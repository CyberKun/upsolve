package dev.upsolve.queue.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateQueueItemRequest(
        @jakarta.validation.constraints.Pattern(regexp = "PENDING|ATTEMPTED|SOLVED") String status,
        @jakarta.validation.constraints.Pattern(regexp = "LOW|MEDIUM|HIGH") String priority,
        @NotNull Integer version
) {}
