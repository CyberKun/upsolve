package dev.upsolve.reviews;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReviewAttemptRepository extends JpaRepository<ReviewAttempt, UUID> {
    List<ReviewAttempt> findByQueueItemIdOrderByReviewedAtDesc(UUID queueItemId);
    boolean existsByQueueItemIdAndIdempotencyKey(UUID queueItemId, String idempotencyKey);
}