import os

backend_dir = r'd:\Upsolver\backend\src\main\java\dev\upsolve'
frontend_dir = r'd:\Upsolver\frontend\src\features'

def write_file(path, content):
    if os.path.exists(path):
        raise FileExistsError(f'Legacy scaffolder will not overwrite existing project code: {path}')
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip())
    print(f'Created {path}')

# ----------------- REVIEWS BACKEND -----------------
reviews_dir = os.path.join(backend_dir, 'reviews')

write_file(os.path.join(reviews_dir, 'ReviewSchedule.java'), '''
package dev.upsolve.reviews;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "review_schedule")
public class ReviewSchedule {
    @Id
    private UUID queueItemId;
    private int intervalIndex;
    private LocalDate nextReviewDate;
    private boolean paused;
    @Version
    private int version;
    private Instant updatedAt;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
    
    public UUID getQueueItemId() { return queueItemId; }
    public void setQueueItemId(UUID queueItemId) { this.queueItemId = queueItemId; }
    public int getIntervalIndex() { return intervalIndex; }
    public void setIntervalIndex(int intervalIndex) { this.intervalIndex = intervalIndex; }
    public LocalDate getNextReviewDate() { return nextReviewDate; }
    public void setNextReviewDate(LocalDate nextReviewDate) { this.nextReviewDate = nextReviewDate; }
    public boolean isPaused() { return paused; }
    public void setPaused(boolean paused) { this.paused = paused; }
    public int getVersion() { return version; }
    public void setVersion(int version) { this.version = version; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
''')

write_file(os.path.join(reviews_dir, 'ReviewAttempt.java'), '''
package dev.upsolve.reviews;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "review_attempt", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"queueItemId", "idempotencyKey"})
})
public class ReviewAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private UUID queueItemId;
    private Instant reviewedAt;
    private String outcome;
    private boolean notesRevealed;
    @Column(length = 2000)
    private String reflection;
    private String idempotencyKey;
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        if (reviewedAt == null) reviewedAt = Instant.now();
    }
    
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getQueueItemId() { return queueItemId; }
    public void setQueueItemId(UUID queueItemId) { this.queueItemId = queueItemId; }
    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }
    public String getOutcome() { return outcome; }
    public void setOutcome(String outcome) { this.outcome = outcome; }
    public boolean isNotesRevealed() { return notesRevealed; }
    public void setNotesRevealed(boolean notesRevealed) { this.notesRevealed = notesRevealed; }
    public String getReflection() { return reflection; }
    public void setReflection(String reflection) { this.reflection = reflection; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
''')

write_file(os.path.join(reviews_dir, 'ReviewScheduleRepository.java'), '''
package dev.upsolve.reviews;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ReviewScheduleRepository extends JpaRepository<ReviewSchedule, UUID> {
    @Query("SELECT rs FROM ReviewSchedule rs WHERE rs.paused = false AND rs.nextReviewDate <= :date AND rs.queueItemId IN (SELECT qi.id FROM QueueItem qi WHERE qi.userId = :userId AND qi.archivedAt IS NULL)")
    List<ReviewSchedule> findDueReviews(@Param("userId") UUID userId, @Param("date") LocalDate date);
}
''')

write_file(os.path.join(reviews_dir, 'ReviewAttemptRepository.java'), '''
package dev.upsolve.reviews;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReviewAttemptRepository extends JpaRepository<ReviewAttempt, UUID> {
    List<ReviewAttempt> findByQueueItemIdOrderByReviewedAtDesc(UUID queueItemId);
    boolean existsByQueueItemIdAndIdempotencyKey(UUID queueItemId, String idempotencyKey);
}
''')

# DTOs
write_file(os.path.join(reviews_dir, 'dto', 'ReviewScheduleResponse.java'), '''
package dev.upsolve.reviews.dto;
import java.util.UUID;
public record ReviewScheduleResponse(UUID queueItemId, int intervalIndex, String nextReviewDate, boolean paused, int version) {}
''')
write_file(os.path.join(reviews_dir, 'dto', 'SetReviewScheduleRequest.java'), '''
package dev.upsolve.reviews.dto;
public record SetReviewScheduleRequest(boolean enabled) {}
''')
write_file(os.path.join(reviews_dir, 'dto', 'RecordReviewRequest.java'), '''
package dev.upsolve.reviews.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
public record RecordReviewRequest(
    @NotBlank String outcome,
    boolean notesRevealed,
    @Size(max=2000) String reflection,
    @NotBlank String idempotencyKey
) {}
''')
write_file(os.path.join(reviews_dir, 'dto', 'ReviewDueResponse.java'), '''
package dev.upsolve.reviews.dto;
import java.util.List;
public record ReviewDueResponse(
    List<ReviewItemResponse> overdue,
    List<ReviewItemResponse> today,
    List<ReviewItemResponse> upcoming
) {}
''')
write_file(os.path.join(reviews_dir, 'dto', 'ReviewItemResponse.java'), '''
package dev.upsolve.reviews.dto;
import java.time.LocalDate;
import java.util.UUID;
// Using a generic record for problem since we don't have the ProblemResponse imported here easily.
public record ReviewItemResponse(
    UUID queueItemId, 
    Object problem, 
    String status, 
    LocalDate nextReviewDate, 
    int intervalIndex, 
    int totalReviews
) {}
''')
write_file(os.path.join(reviews_dir, 'dto', 'SnoozeRequest.java'), '''
package dev.upsolve.reviews.dto;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
public record SnoozeRequest(
    @NotNull @Positive Integer days
) {}
''')

write_file(os.path.join(reviews_dir, 'ReviewService.java'), '''
package dev.upsolve.reviews;

import dev.upsolve.reviews.dto.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.*;

@Service
@Transactional
public class ReviewService {
    private final ReviewScheduleRepository scheduleRepo;
    private final ReviewAttemptRepository attemptRepo;

    public ReviewService(ReviewScheduleRepository scheduleRepo, ReviewAttemptRepository attemptRepo) {
        this.scheduleRepo = scheduleRepo;
        this.attemptRepo = attemptRepo;
    }

    public ReviewScheduleResponse enableReview(UUID userId, UUID queueItemId) {
        ReviewSchedule rs = new ReviewSchedule();
        rs.setQueueItemId(queueItemId);
        rs.setIntervalIndex(0);
        rs.setNextReviewDate(LocalDate.now().plusDays(1)); // simplified
        rs.setPaused(false);
        scheduleRepo.save(rs);
        return new ReviewScheduleResponse(queueItemId, 0, rs.getNextReviewDate().toString(), false, 0);
    }

    public ReviewScheduleResponse disableReview(UUID userId, UUID queueItemId) {
        ReviewSchedule rs = scheduleRepo.findById(queueItemId).orElseThrow();
        rs.setPaused(true);
        scheduleRepo.save(rs);
        return new ReviewScheduleResponse(queueItemId, rs.getIntervalIndex(), 
            rs.getNextReviewDate() != null ? rs.getNextReviewDate().toString() : null, true, rs.getVersion());
    }

    public ReviewDueResponse getDueReviews(UUID userId) {
        List<ReviewSchedule> due = scheduleRepo.findDueReviews(userId, LocalDate.now().plusDays(7));
        return new ReviewDueResponse(List.of(), List.of(), List.of()); // simplified
    }

    public ReviewScheduleResponse recordReview(UUID userId, UUID queueItemId, RecordReviewRequest req) {
        if (attemptRepo.existsByQueueItemIdAndIdempotencyKey(queueItemId, req.idempotencyKey())) {
            ReviewSchedule rs = scheduleRepo.findById(queueItemId).orElseThrow();
            return new ReviewScheduleResponse(queueItemId, rs.getIntervalIndex(), rs.getNextReviewDate().toString(), rs.isPaused(), rs.getVersion());
        }

        ReviewAttempt attempt = new ReviewAttempt();
        attempt.setQueueItemId(queueItemId);
        attempt.setOutcome(req.outcome());
        attempt.setNotesRevealed(req.notesRevealed());
        attempt.setReflection(req.reflection());
        attempt.setIdempotencyKey(req.idempotencyKey());
        attemptRepo.save(attempt);

        ReviewSchedule rs = scheduleRepo.findById(queueItemId).orElseThrow();
        rs.setNextReviewDate(LocalDate.now().plusDays(3)); // simplified
        scheduleRepo.save(rs);

        return new ReviewScheduleResponse(queueItemId, rs.getIntervalIndex(), rs.getNextReviewDate().toString(), rs.isPaused(), rs.getVersion());
    }

    public ReviewScheduleResponse snoozeReview(UUID userId, UUID queueItemId, SnoozeRequest req) {
        ReviewSchedule rs = scheduleRepo.findById(queueItemId).orElseThrow();
        rs.setNextReviewDate(LocalDate.now().plusDays(req.days()));
        scheduleRepo.save(rs);
        return new ReviewScheduleResponse(queueItemId, rs.getIntervalIndex(), rs.getNextReviewDate().toString(), rs.isPaused(), rs.getVersion());
    }
}
''')

write_file(os.path.join(reviews_dir, 'ReviewController.java'), '''
package dev.upsolve.reviews;

import dev.upsolve.reviews.dto.*;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class ReviewController {
    private final ReviewService service;

    public ReviewController(ReviewService service) {
        this.service = service;
    }

    @GetMapping("/reviews/due")
    public ReviewDueResponse getDueReviews() {
        UUID userId = UUID.randomUUID(); // auth mocked
        return service.getDueReviews(userId);
    }

    @PutMapping("/queue/{id}/review-schedule")
    public ReviewScheduleResponse setReviewSchedule(@PathVariable UUID id, @RequestBody SetReviewScheduleRequest req) {
        UUID userId = UUID.randomUUID(); // auth mocked
        return req.enabled() ? service.enableReview(userId, id) : service.disableReview(userId, id);
    }

    @PostMapping("/queue/{id}/reviews")
    public ReviewScheduleResponse recordReview(@PathVariable UUID id, @Valid @RequestBody RecordReviewRequest req) {
        UUID userId = UUID.randomUUID(); // auth mocked
        return service.recordReview(userId, id, req);
    }

    @PostMapping("/queue/{id}/review-schedule/snooze")
    public ReviewScheduleResponse snoozeReview(@PathVariable UUID id, @Valid @RequestBody SnoozeRequest req) {
        UUID userId = UUID.randomUUID(); // auth mocked
        return service.snoozeReview(userId, id, req);
    }
}
''')

# FRONTEND: Reviews
reviews_fe_dir = os.path.join(frontend_dir, 'reviews')
write_file(os.path.join(reviews_fe_dir, 'hooks.ts'), '''
export const useDueReviews = () => ({ data: { overdue: [], today: [], upcoming: [] }, isLoading: false });
export const useRecordReview = () => ({ mutate: (data: any) => {} });
export const useSetReviewSchedule = () => ({ mutate: (data: any) => {} });
export const useSnoozeReview = () => ({ mutate: (data: any) => {} });
''')
write_file(os.path.join(reviews_fe_dir, 'ReviewsPage.tsx'), '''
import React from 'react';
import { useDueReviews } from './hooks';

export const ReviewsPage = () => {
    const { data } = useDueReviews();
    return (
        <div>
            <h1>Reviews</h1>
            <section>
                <h2 style={{color: 'red'}}>Overdue</h2>
                {data.overdue.map((r: any) => <div key={r.queueItemId}>{r.problem.name}</div>)}
            </section>
            <section>
                <h2>Today</h2>
                {data.today.map((r: any) => <div key={r.queueItemId}>{r.problem.name}</div>)}
            </section>
            <section>
                <h2>Upcoming</h2>
                {data.upcoming.map((r: any) => <div key={r.queueItemId}>{r.problem.name}</div>)}
            </section>
        </div>
    );
};
''')
write_file(os.path.join(reviews_fe_dir, 'ReviewSession.tsx'), '''
import React, { useState } from 'react';
import { useRecordReview } from './hooks';
import { v4 as uuidv4 } from 'uuid';

export const ReviewSession = ({ queueItemId }: { queueItemId: string }) => {
    const [notesRevealed, setNotesRevealed] = useState(false);
    const { mutate: record } = useRecordReview();
    
    const handleSubmit = (outcome: string) => {
        record({ outcome, notesRevealed, idempotencyKey: uuidv4(), reflection: '' });
    };
    
    return (
        <div>
            <h2>Review Session</h2>
            <p>Try solving the problem first</p>
            {!notesRevealed ? (
                <button onClick={() => setNotesRevealed(true)}>Reveal notes</button>
            ) : (
                <div>Notes content here</div>
            )}
            
            <div>
                <button style={{color: 'green'}} onClick={() => handleSubmit('SOLVED_INDEPENDENTLY')}>Solved independently</button>
                <button style={{color: 'orange'}} onClick={() => handleSubmit('NEEDED_HINT')}>Needed a hint</button>
                <button style={{color: 'red'}} onClick={() => handleSubmit('COULD_NOT_SOLVE')}>Could not solve</button>
            </div>
        </div>
    );
};
''')

print("Done")
