package dev.upsolve.queue.dto;

import java.time.Instant;

public record SubmissionResponse(
        Long cfSubmissionId,
        Instant submittedAt,
        String verdict,
        String language,
        String participantType,
        Integer timeConsumedMs,
        Integer passedTestCount
) {}
