package dev.upsolve.reviews;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ReviewScheduleRepository extends JpaRepository<ReviewSchedule, UUID> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT rs FROM ReviewSchedule rs WHERE rs.queueItemId = :id")
    java.util.Optional<ReviewSchedule> findLockedById(UUID id);
    @Query("SELECT rs FROM ReviewSchedule rs WHERE rs.paused = false AND rs.nextReviewDate <= :date AND rs.queueItemId IN (SELECT qi.id FROM QueueItem qi WHERE qi.userId = :userId AND qi.archivedAt IS NULL)")
    List<ReviewSchedule> findDueReviews(@Param("userId") UUID userId, @Param("date") LocalDate date);
}
