package dev.upsolve.sync.dto;

import java.time.Instant;
import java.util.UUID;

public record SyncJobResponse(
        UUID id,
        UUID userId,
        String state,
        Instant createdAt,
        Instant updatedAt,
        Instant startedAt,
        Instant completedAt,
        Integer totalSubmissionsFetched,
        Integer newSubmissionsImported,
        Integer problemsAddedToQueue,
        String errorSummary
) {}
