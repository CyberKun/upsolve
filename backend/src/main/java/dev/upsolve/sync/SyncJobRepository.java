package dev.upsolve.sync;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SyncJobRepository extends JpaRepository<SyncJob, UUID> {
    Optional<SyncJob> findFirstByUserIdAndStateIn(UUID userId, List<String> states);
    List<SyncJob> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
