package dev.upsolve.notes.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ProblemNoteResponse(
        UUID queueItemId,
        String stuckReason,
        String keyObservation,
        String approachComplexity,
        String whatToRemember,
        List<String> mistakeCategories,
        int version,
        Instant updatedAt
) {}
