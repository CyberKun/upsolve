package dev.upsolve;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.upsolve.codeforces.CodeforcesClient;
import dev.upsolve.codeforces.dto.*;
import dev.upsolve.sync.*;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.*;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.IntStream;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

@SpringBootTest(properties = {"upsolve.sync.initial-delay-ms=3600000"})
@AutoConfigureMockMvc
@Testcontainers
class FeatureIntegrationTest {
    @Container static PostgreSQLContainer<?> db = new PostgreSQLContainer<>("postgres:16-alpine");
    @DynamicPropertySource static void database(DynamicPropertyRegistry p) {
        p.add("spring.datasource.url", db::getJdbcUrl);
        p.add("spring.datasource.username", db::getUsername);
        p.add("spring.datasource.password", db::getPassword);
    }
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JdbcTemplate jdbc;
    @Autowired SyncJobRunner runner;
    @Autowired SyncJobRepository jobs;
    @MockitoBean CodeforcesClient cf;
    Cookie csrf;
    Cookie session;
    UUID userId;
    long problemId;

    @BeforeEach void setup() throws Exception {
        jdbc.execute("TRUNCATE app_user, problem CASCADE");
        reset(cf);
        csrf = mvc.perform(get("/api/v1/auth/csrf")).andReturn().getResponse().getCookie("XSRF-TOKEN");
        session = null;
        var user = call(post("/auth/register"), Map.of("username", "tester", "password", "password123"), 201);
        userId = UUID.fromString(user.get("id").asText());
        var login = request(post("/auth/login"), Map.of("username", "TESTER", "password", "password123"));
        assertThat(login.getResponse().getStatus()).isEqualTo(200);
        session = login.getResponse().getCookie("UPSOLVE_SESSION");
        assertThat(session).isNotNull();
        problemId = jdbc.queryForObject("INSERT INTO problem(cf_contest_id, problem_index, name, rating, tags) VALUES (1900,'A','Audit Problem',1500,ARRAY['math','dp']) RETURNING id", Long.class);
    }

    MvcResult request(MockHttpServletRequestBuilder req, Object body) throws Exception {
        // Paths are relative to /api/v1 in tests, including all modifying requests.
        req.with(r -> { r.setRequestURI("/api/v1" + r.getRequestURI()); return r; });
        req.cookie(csrf).header("X-XSRF-TOKEN", csrf.getValue());
        if (session != null) req.cookie(session);
        if (body != null) req.contentType("application/json").content(json.writeValueAsString(body));
        var result = mvc.perform(req).andReturn();
        for (Cookie cookie : result.getResponse().getCookies()) {
            if ("UPSOLVE_SESSION".equals(cookie.getName())) session = cookie.getMaxAge() == 0 ? null : cookie;
            if ("XSRF-TOKEN".equals(cookie.getName()) && cookie.getMaxAge() != 0) csrf = cookie;
        }
        return result;
    }
    JsonNode call(MockHttpServletRequestBuilder req, Object body, int status) throws Exception {
        var response = request(req, body).getResponse();
        assertThat(response.getStatus()).withFailMessage(response.getContentAsString()).isEqualTo(status);
        return response.getContentAsString().isEmpty() ? json.nullNode() : json.readTree(response.getContentAsString());
    }
    String queue() throws Exception {
        return call(post("/queue"), Map.of("problemId", problemId), 201).get("id").asText();
    }

    @Test void authenticationCsrfAndLogout() throws Exception {
        call(get("/auth/me"), null, 200);
        assertThat(mvc.perform(patch("/api/v1/preferences").cookie(session).contentType("application/json").content("{}"))
                .andReturn().getResponse().getStatus()).isEqualTo(403);
        call(patch("/preferences"), Map.of("timeZone", "Asia/Kolkata"), 200);
        call(post("/auth/logout"), null, 204);
        session = null;
        call(get("/auth/me"), null, 401);
        call(post("/auth/login"), Map.of("username", "tester", "password", "wrong"), 401);
    }

    @Test void concurrentAuthenticatedReadsKeepTheLoginSessionStable() throws Exception {
        Cookie loginSession = session;
        try (var executor = Executors.newFixedThreadPool(8)) {
            var reads = new ArrayList<Future<MvcResult>>();
            for (int i = 0; i < 24; i++) {
                reads.add(executor.submit(() -> mvc.perform(get("/api/v1/auth/me").cookie(loginSession)).andReturn()));
            }
            for (var read : reads) {
                var response = read.get(15, TimeUnit.SECONDS).getResponse();
                assertThat(response.getStatus()).isEqualTo(200);
                assertThat(json.readTree(response.getContentAsString()).get("id").asText()).isEqualTo(userId.toString());
                assertThat(response.getCookie("UPSOLVE_SESSION")).isNull();
            }
        }
        assertThat(jdbc.queryForObject("SELECT count(*) FROM spring_session_attributes WHERE attribute_name = 'SPRING_SECURITY_CONTEXT'", Integer.class)).isZero();
        call(post("/auth/login"), Map.of("username", "tester", "password", "password123"), 200);
        assertThat(session.getValue()).isNotEqualTo(loginSession.getValue());
        assertThat(mvc.perform(get("/api/v1/auth/me").cookie(loginSession)).andReturn().getResponse().getStatus()).isEqualTo(401);
        call(get("/auth/me"), null, 200);
    }

    @Test void setupPreferencesValidationAndSyncEnqueue() throws Exception {
        when(cf.validateHandle("tourist")).thenReturn(new CfUser("tourist", 3900, 4000, "legendary grandmaster", null, null, null));
        call(patch("/preferences"), Map.of("targetRatingMin", 2000, "targetRatingMax", 1000), 400);
        call(patch("/preferences"), Map.of("timeZone", "invalid"), 400);
        call(patch("/preferences"), Map.of("reviewIntervals", List.of()), 400);
        call(patch("/preferences"), Map.of("reviewIntervals", List.of(3,1)), 400);
        call(post("/tracked-handle"), Map.of("handle", "tourist"), 200);
        assertThat(call(get("/auth/me"), null, 200).get("setupComplete").asBoolean()).isTrue();
        call(post("/tracked-handle"), Map.of("handle", "other"), 409);
        assertThat(call(get("/sync-jobs"), null, 200).size()).isEqualTo(1);
    }

    @Test void queueCrudVersionsArchiveAndValidation() throws Exception {
        String id = queue();
        call(post("/queue"), Map.of("problemId", problemId), 409);
        call(post("/queue"), Map.of("problemUrl", "bad url"), 400);
        call(patch("/queue/"+id), Map.of("status", "WRONG", "version", 0), 400);
        call(patch("/queue/"+id), Map.of("status", "ATTEMPTED"), 400);
        var solved = call(patch("/queue/"+id), Map.of("status", "SOLVED", "version", 0), 200);
        assertThat(solved.get("version").asInt()).isEqualTo(1);
        call(patch("/queue/"+id), Map.of("priority", "HIGH", "version", 1), 200);
        call(patch("/queue/"+id), Map.of("priority", "LOW", "version", 0), 409);
        call(post("/queue/"+id+"/archive"), null, 200);
        assertThat(call(get("/queue?archived=true"), null, 200).get("totalElements").asInt()).isEqualTo(1);
        call(post("/queue/"+id+"/unarchive"), null, 200);
        assertThat(call(get("/queue/"+id+"/events"), null, 200).size()).isEqualTo(5);
    }

    @Test void notesSaveTwiceAndDetectConflicts() throws Exception {
        String id = queue();
        call(get("/queue/"+id+"/notes"), null, 404);
        var note = call(put("/queue/"+id+"/notes"), Map.of("keyObservation", "first", "version", 0), 200);
        var updated = call(put("/queue/"+id+"/notes"), Map.of("keyObservation", "second", "version", note.get("version").asInt()), 200);
        assertThat(updated.get("version").asInt()).isEqualTo(1);
        call(put("/queue/"+id+"/notes"), Map.of("keyObservation", "stale", "version", 0), 409);
    }

    @Test void reviewSchedulingOutcomesIdempotencyAndExport() throws Exception {
        String id = queue();
        call(patch("/preferences"), Map.of("reviewIntervals", List.of(2,5,10), "timeZone", "Pacific/Kiritimati"), 200);
        var schedule = call(put("/queue/"+id+"/review-schedule"), Map.of("enabled", true), 200);
        assertThat(schedule.get("nextReviewDate").asText()).isEqualTo(LocalDate.now(ZoneId.of("Pacific/Kiritimati")).plusDays(2).toString());
        assertThat(call(get("/reviews/due"), null, 200).get("upcoming").size()).isEqualTo(1);
        var outcome = Map.of("outcome", "SOLVED_INDEPENDENTLY", "notesRevealed", false, "idempotencyKey", "test-1");
        var reviewed = call(post("/queue/"+id+"/reviews"), outcome, 200);
        assertThat(reviewed.get("intervalIndex").asInt()).isEqualTo(1);
        assertThat(call(post("/queue/"+id+"/reviews"), outcome, 200)).isEqualTo(reviewed);
        call(post("/queue/"+id+"/reviews"), Map.of("outcome","COULD_NOT_SOLVE","idempotencyKey","test-2"), 200);
        call(post("/queue/"+id+"/review-schedule/snooze"), Map.of("days", 1), 200);
        call(put("/queue/"+id+"/review-schedule"), Map.of("enabled", false), 200);
        assertThat(call(get("/reviews/due"), null, 200).get("upcoming").size()).isZero();
        var export = call(get("/export"), null, 200);
        assertThat(export.get("reviewHistory").size()).isEqualTo(2);
        assertThat(export.get("reviewSchedules").size()).isEqualTo(1);
    }

    @Test void allPrivateResourcesAreUserScoped() throws Exception {
        String id = queue();
        call(put("/queue/"+id+"/review-schedule"), Map.of("enabled", true), 200);
        UUID other = UUID.randomUUID();
        call(post("/auth/register"), Map.of("username","other","password","password123"), 201);
        session = request(post("/auth/login"), Map.of("username","other","password","password123")).getResponse().getCookie("UPSOLVE_SESSION");
        for (String path : List.of("", "/notes", "/submissions", "/events", "/review-schedule")) call(get("/queue/"+id+path), null, 404);
        call(put("/queue/"+id+"/review-schedule"), Map.of("enabled", true), 404);
        call(post("/queue/"+id+"/reviews"), Map.of("outcome","NEEDED_HINT","idempotencyKey","foreign"), 404);
    }

    @Test void analyticsSearchAndUserSubmissionIsolation() throws Exception {
        String id = queue();
        jdbc.update("INSERT INTO submission(cf_submission_id,problem_id,submitted_at,verdict,participant_type) VALUES (1,?,now(),'OK','PRACTICE'),(2,?,now(),'WRONG_ANSWER','PRACTICE')",problemId,problemId);
        jdbc.update("INSERT INTO user_submission VALUES (?,1)", userId);
        assertThat(call(get("/queue/"+id+"/submissions"),null,200).size()).isEqualTo(1);
        assertThat(call(get("/queue/"+id),null,200).get("submissionCount").asInt()).isEqualTo(1);
        call(put("/queue/"+id+"/notes"),Map.of("version",0,"mistakeCategories",List.of("OVERFLOW")),200);
        assertThat(call(get("/analytics/topics"),null,200).get("topics").size()).isEqualTo(2);
        assertThat(call(get("/analytics/difficulty"),null,200).get("bands").get(0).get("solved").asInt()).isEqualTo(1);
        assertThat(call(get("/analytics/activity?weeks=4"),null,200).get("activity").size()).isEqualTo(4);
        assertThat(call(get("/analytics/mistakes"),null,200).get("mistakes").get(0).get("count").asInt()).isEqualTo(1);
        assertThat(call(get("/problems?search=Audit"),null,200).get("content").size()).isEqualTo(1);
        call(get("/queue?status=ACTIVE&archived=false&sort=priorityRank,asc"),null,200);
    }

    @Test void fullSyncImportsBeyondFirstPageAndIsRepeatable() throws Exception {
        jdbc.update("UPDATE user_preferences SET tracked_handle='tester' WHERE user_id=?", userId);
        CfProblem problem = new CfProblem(1900,"A","Audit Problem",1500,List.of("math"),"PROGRAMMING");
        var submissions = IntStream.rangeClosed(1,501).mapToObj(i -> new CfSubmission((long)i,1900,Instant.now().getEpochSecond(),problem,
                new CfParty(1900,List.of(),"PRACTICE",false),"Java","WRONG_ANSWER",0,10L,100L)).toList();
        when(cf.getUserSubmissions(eq("tester"), anyInt(), eq(500))).thenAnswer(inv -> {
            int from = inv.getArgument(1);
            return submissions.subList(Math.min(from-1,501), Math.min(from-1+500,501));
        });
        when(cf.getProblems()).thenReturn(new CfProblemSet(List.of(problem), List.of()));
        UUID jobId = UUID.fromString(call(post("/sync-jobs"),null,202).get("id").asText());
        runner.runImport(jobId);
        assertThat(jobs.findById(jobId).orElseThrow().getState()).isEqualTo("COMPLETED");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM user_submission WHERE user_id=?",Integer.class,userId)).isEqualTo(501);
        assertThat(call(get("/queue"),null,200).get("totalElements").asInt()).isEqualTo(1);
        UUID repeat = UUID.fromString(call(post("/sync-jobs"),null,202).get("id").asText());
        runner.runImport(repeat);
        assertThat(jobs.findById(repeat).orElseThrow().getNewSubmissionsImported()).isZero();
    }

    @Test void demoIsReadOnly() throws Exception {
        UUID demo = UUID.fromString("a0000000-0000-0000-0000-000000000001");
        jdbc.update("INSERT INTO app_user(id,username,username_norm,password_hash) SELECT ?, 'demo','demo',password_hash FROM app_user WHERE id=?",demo,userId);
        jdbc.update("INSERT INTO user_preferences(user_id) VALUES (?)",demo);
        session = request(post("/auth/login"), Map.of("username","demo","password","password123")).getResponse().getCookie("UPSOLVE_SESSION");
        call(post("/queue"),Map.of("problemId",problemId),403);
        call(patch("/preferences"),Map.of("timeZone","UTC"),403);
        call(post("/auth/logout"),null,204);
    }
}
