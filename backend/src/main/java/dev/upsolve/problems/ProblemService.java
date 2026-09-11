package dev.upsolve.problems;

import dev.upsolve.codeforces.CodeforcesClient;
import dev.upsolve.codeforces.dto.CfContest;
import dev.upsolve.codeforces.dto.CfProblem;
import dev.upsolve.codeforces.dto.CfProblemSet;
import dev.upsolve.problems.dto.ProblemResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final ContestRepository contestRepository;
    private final CodeforcesClient codeforcesClient;

    public ProblemService(ProblemRepository problemRepository, ContestRepository contestRepository, CodeforcesClient codeforcesClient) {
        this.problemRepository = problemRepository;
        this.contestRepository = contestRepository;
        this.codeforcesClient = codeforcesClient;
    }

    @Transactional(readOnly = true)
    public Page<ProblemResponse> searchProblems(String search, Integer minRating, Integer maxRating, List<String> tags, Pageable pageable) {
        String tagsFilter = tags != null && !tags.isEmpty() ? String.join(",", tags) : null;
        return problemRepository.searchProblems(search, minRating, maxRating, tagsFilter, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public ProblemResponse getProblem(Long id) {
        return problemRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new dev.upsolve.common.EntityNotFoundException("Problem not found"));
    }

    @Transactional
    public Problem getOrCreateProblem(CfProblem cfProblem) {
        return problemRepository.findByCfContestIdAndProblemIndex(cfProblem.contestId(), cfProblem.index())
                .orElseGet(() -> {
                    Problem p = new Problem();
                    p.setCfContestId(cfProblem.contestId());
                    p.setProblemIndex(cfProblem.index());
                    p.setName(cfProblem.name());
                    p.setRating(cfProblem.rating());
                    p.setTags(cfProblem.tags());
                    p.setProblemType(cfProblem.type());
                    p.setMetadataUpdatedAt(Instant.now());
                    return problemRepository.save(p);
                });
    }

    @Transactional
    public void refreshCatalog() {
        CfProblemSet problemSet = codeforcesClient.getProblems();
        if (problemSet != null && problemSet.problems() != null) {
            for (CfProblem cfProblem : problemSet.problems()) {
                problemRepository.findByCfContestIdAndProblemIndex(cfProblem.contestId(), cfProblem.index())
                        .ifPresentOrElse(p -> {
                            p.setName(cfProblem.name());
                            p.setRating(cfProblem.rating());
                            p.setTags(cfProblem.tags());
                            p.setProblemType(cfProblem.type());
                            p.setMetadataUpdatedAt(Instant.now());
                            problemRepository.save(p);
                        }, () -> {
                            Problem p = new Problem();
                            p.setCfContestId(cfProblem.contestId());
                            p.setProblemIndex(cfProblem.index());
                            p.setName(cfProblem.name());
                            p.setRating(cfProblem.rating());
                            p.setTags(cfProblem.tags());
                            p.setProblemType(cfProblem.type());
                            p.setMetadataUpdatedAt(Instant.now());
                            problemRepository.save(p);
                        });
            }
        }
    }

    @Transactional
    public void refreshContests() {
        List<CfContest> contests = codeforcesClient.getContests();
        if (contests != null) {
            for (CfContest cfContest : contests) {
                Contest c = contestRepository.findById(cfContest.id()).orElse(new Contest());
                c.setCfContestId(cfContest.id());
                c.setName(cfContest.name());
                c.setStartTime(cfContest.startTimeSeconds() != null ? Instant.ofEpochSecond(cfContest.startTimeSeconds()) : null);
                c.setDurationSecs(cfContest.durationSeconds() != null ? cfContest.durationSeconds().intValue() : null);
                c.setPhase(cfContest.phase());
                c.setUpdatedAt(Instant.now());
                contestRepository.save(c);
            }
        }
    }

    private ProblemResponse mapToResponse(Problem problem) {
        return new ProblemResponse(
                problem.getId(),
                problem.getCfContestId(),
                problem.getProblemIndex(),
                problem.getName(),
                problem.getRating(),
                problem.getTags(),
                problem.getProblemType()
        );
    }
}
