package dev.upsolve.sync;

import dev.upsolve.codeforces.CodeforcesClient;
import dev.upsolve.codeforces.CodeforcesException;
import dev.upsolve.codeforces.CodeforcesHandleNotFoundException;
import dev.upsolve.codeforces.dto.CfSubmission;
import dev.upsolve.problems.*;
import dev.upsolve.profile.UserPreferences;
import dev.upsolve.profile.UserPreferencesRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class SyncJobRunner {

    @org.springframework.beans.factory.annotation.Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbc;

    private final SyncJobRepository syncJobRepository;
    private final CodeforcesClient codeforcesClient;
    private final ProblemService problemService;
    private final SubmissionRepository submissionRepository;
    private final UserSubmissionRepository userSubmissionRepository;
    private final UserPreferencesRepository userPreferencesRepository;

    public SyncJobRunner(SyncJobRepository syncJobRepository,
                         CodeforcesClient codeforcesClient,
                         ProblemService problemService,
                         SubmissionRepository submissionRepository,
                         UserSubmissionRepository userSubmissionRepository,
                         UserPreferencesRepository userPreferencesRepository) {
        this.syncJobRepository = syncJobRepository;
        this.codeforcesClient = codeforcesClient;
        this.problemService = problemService;
        this.submissionRepository = submissionRepository;
        this.userSubmissionRepository = userSubmissionRepository;
        this.userPreferencesRepository = userPreferencesRepository;
    }

    @org.springframework.scheduling.annotation.Scheduled(fixedDelay = 2000, initialDelayString = "${upsolve.sync.initial-delay-ms:2000}")
    public void processPendingJobs() {
        for (SyncJob job : syncJobRepository.findAll()) {
            if ("QUEUED".equals(job.getState()) || ("RUNNING".equals(job.getState()) &&
                    (job.getLeaseExpiresAt() == null || job.getLeaseExpiresAt().isBefore(Instant.now())))) {
                runImport(job.getId());
            }
        }
    }

    public void runImport(UUID jobId) {
        Optional<SyncJob> jobOpt = syncJobRepository.findById(jobId);
        if (jobOpt.isEmpty()) return;

        SyncJob job = jobOpt.get();
        job.setState("RUNNING");
        job.setStartedAt(Instant.now());
        job.setLeaseExpiresAt(Instant.now().plusSeconds(3600));
        syncJobRepository.save(job);

        try {
            Optional<UserPreferences> prefs = userPreferencesRepository.findById(job.getUserId());
            if (prefs.isEmpty() || prefs.get().getTrackedHandle() == null) {
                throw new IllegalStateException("Tracked handle not found");
            }
            String handle = prefs.get().getTrackedHandle();

            int from = Math.max(1, (job.getCheckpointFrom() != null ? job.getCheckpointFrom() : 1) - 50);
            int count = 500;
            
            int imported = job.getNewSubmissionsImported() == null ? 0 : job.getNewSubmissionsImported();
            int fetched = job.getTotalSubmissionsFetched() == null ? 0 : job.getTotalSubmissionsFetched();
            while (true) {
            List<CfSubmission> submissions = fetchPage(handle, from, count);
            if (submissions != null) {
                for (CfSubmission cfSub : submissions) {
                    if (cfSub.problem() == null || cfSub.problem().contestId() == null) continue;
                    
                    Problem p = problemService.getOrCreateProblem(cfSub.problem());
                    
                    Submission sub = submissionRepository.findById(cfSub.id()).orElse(new Submission());
                    sub.setCfSubmissionId(cfSub.id());
                    sub.setProblem(p);
                    sub.setCfContestId(cfSub.contestId());
                    sub.setSubmittedAt(Instant.ofEpochSecond(cfSub.creationTimeSeconds()));
                    
                    // Verdict rules
                    if (sub.getVerdict() == null || !sub.getVerdict().equals("OK") || (cfSub.verdict() != null && cfSub.verdict().equals("OK"))) {
                        sub.setVerdict(cfSub.verdict());
                    }
                    
                    sub.setLanguage(cfSub.programmingLanguage());
                    sub.setParticipantType(cfSub.author() != null && cfSub.author().participantType() != null ? cfSub.author().participantType() : "PRACTICE");
                    sub.setTimeConsumedMs(cfSub.timeConsumedMillis() != null ? cfSub.timeConsumedMillis().intValue() : null);
                    sub.setMemoryConsumedBytes(cfSub.memoryConsumedBytes());
                    sub.setPassedTestCount(cfSub.passedTestCount());
                    if (sub.getImportedAt() == null) sub.setImportedAt(Instant.now());
                    sub.setUpdatedAt(Instant.now());
                    
                    submissionRepository.save(sub);
                    
                    if (!userSubmissionRepository.existsByUserIdAndSubmissionId(job.getUserId(), sub.getCfSubmissionId())) {
                        userSubmissionRepository.save(new UserSubmission(job.getUserId(), sub.getCfSubmissionId()));
                        imported++;
                    }
                }
            }
            
            job.setNewSubmissionsImported(imported);
            fetched += submissions.size();
            job.setTotalSubmissionsFetched(fetched);
            from += submissions.size();
            job.setCheckpointFrom(from);
            job.setLeaseExpiresAt(Instant.now().plusSeconds(900));
            job.setUpdatedAt(Instant.now());
            syncJobRepository.save(job);
            if (submissions.size() < count) break;
            }

            reconcileQueue(job);
            // Refresh searchable problem metadata after importing the complete history.
            problemService.refreshCatalog();

            job.setLeaseExpiresAt(null);
            job.setErrorSummary(null);
            job.setState("COMPLETED");
            job.setCompletedAt(Instant.now());
            syncJobRepository.save(job);

        } catch (CodeforcesHandleNotFoundException e) {
            job.setState("FAILED");
            job.setErrorSummary("Handle not found: " + e.getMessage());
            job.setCompletedAt(Instant.now());
            syncJobRepository.save(job);
        } catch (Exception e) {
            job.setState("FAILED");
            job.setErrorSummary(e.getMessage());
            job.setCompletedAt(Instant.now());
            syncJobRepository.save(job);
        }
    }

    private List<CfSubmission> fetchPage(String handle, int from, int count) {
        for (int attempt = 0; ; attempt++) {
            try { return codeforcesClient.getUserSubmissions(handle, from, count); }
            catch (CodeforcesException ex) {
                if (attempt >= 2 || ex instanceof CodeforcesHandleNotFoundException) throw ex;
                try { Thread.sleep(2500L * (attempt + 1)); }
                catch (InterruptedException interrupted) {
                    Thread.currentThread().interrupt();
                    throw new IllegalStateException("Sync interrupted", interrupted);
                }
            }
        }
    }

    private void reconcileQueue(SyncJob job) {
        int added = jdbc.update("""
            INSERT INTO queue_item (user_id, problem_id, status, priority, source)
            SELECT ?, s.problem_id, 'ATTEMPTED', 'MEDIUM', 'SYNC'
            FROM user_submission us JOIN submission s ON s.cf_submission_id = us.submission_id
            WHERE us.user_id = ? AND s.verdict IS NOT NULL
                AND s.verdict NOT IN ('COMPILATION_ERROR', 'SKIPPED', 'TESTING')
            GROUP BY s.problem_id HAVING bool_or(s.verdict = 'OK') = false
            ON CONFLICT (user_id, problem_id) DO NOTHING
            """, job.getUserId(), job.getUserId());
        jdbc.update("""
            UPDATE queue_item qi SET status = 'SOLVED', version = version + 1, updated_at = now()
            WHERE qi.user_id = ? AND qi.status <> 'SOLVED' AND EXISTS (
                SELECT 1 FROM user_submission us JOIN submission s ON s.cf_submission_id = us.submission_id
                WHERE us.user_id = qi.user_id AND s.problem_id = qi.problem_id AND s.verdict = 'OK')
            """, job.getUserId());
        job.setProblemsAddedToQueue((job.getProblemsAddedToQueue() == null ? 0 : job.getProblemsAddedToQueue()) + added);
    }
}
