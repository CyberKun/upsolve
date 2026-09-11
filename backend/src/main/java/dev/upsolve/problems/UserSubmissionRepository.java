package dev.upsolve.problems;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserSubmissionRepository extends JpaRepository<UserSubmission, UserSubmission.UserSubmissionId> {
    boolean existsByUserIdAndSubmissionId(UUID userId, Long submissionId);
    List<UserSubmission> findByUserId(UUID userId);
}
