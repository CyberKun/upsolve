package dev.upsolve.queue;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface QueueEventRepository extends JpaRepository<QueueEvent, Long> {
    List<QueueEvent> findByQueueItemIdOrderByCreatedAtDesc(UUID queueItemId);
}
