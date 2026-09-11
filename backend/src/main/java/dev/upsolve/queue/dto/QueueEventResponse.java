package dev.upsolve.queue.dto;

import java.time.Instant;

public record QueueEventResponse(
        Long id,
        String eventType,
        String actor,
        String payload,
        Instant createdAt
) {}
