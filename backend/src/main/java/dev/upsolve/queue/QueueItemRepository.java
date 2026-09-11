package dev.upsolve.queue;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.Optional;
import java.util.UUID;

public interface QueueItemRepository extends JpaRepository<QueueItem, UUID>, JpaSpecificationExecutor<QueueItem> {
    Optional<QueueItem> findByIdAndUserId(UUID id, UUID userId);
    Optional<QueueItem> findByUserIdAndProblemId(UUID userId, Long problemId);
    boolean existsByUserIdAndProblemId(UUID userId, Long problemId);
}
