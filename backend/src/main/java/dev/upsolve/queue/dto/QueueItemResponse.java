package dev.upsolve.queue.dto;

import dev.upsolve.problems.dto.ProblemResponse;
import dev.upsolve.queue.QueueItem;

import java.time.Instant;
import java.util.UUID;

public record QueueItemResponse(
        UUID id,
        ProblemResponse problem,
        String status,
        String priority,
        String source,
        Instant archivedAt,
        Instant createdAt,
        Instant updatedAt,
        int version,
        boolean hasNotes,
        boolean hasReviewSchedule,
        String nextReviewDate,
        int submissionCount
) {
    public static QueueItemResponse from(QueueItem item, ProblemResponse problem, boolean hasNotes, boolean hasReview, String nextReview, int subCount) {
        return new QueueItemResponse(
                item.getId(),
                problem,
                item.getStatus(),
                item.getPriority(),
                item.getSource(),
                item.getArchivedAt(),
                item.getCreatedAt(),
                item.getUpdatedAt(),
                item.getVersion(),
                hasNotes,
                hasReview,
                nextReview,
                subCount
        );
    }
}
