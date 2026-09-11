package dev.upsolve.problems;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT s FROM Submission s WHERE s.problem.id = :problemId AND s.cfSubmissionId IN (SELECT us.submissionId FROM UserSubmission us WHERE us.userId = :userId) ORDER BY s.submittedAt DESC")
    List<Submission> findForUserAndProblem(java.util.UUID userId, Long problemId);
    List<Submission> findByProblemIdOrderBySubmittedAtDesc(Long problemId);
}
