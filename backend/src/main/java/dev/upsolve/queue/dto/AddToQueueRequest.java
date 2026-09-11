package dev.upsolve.queue.dto;

public record AddToQueueRequest(
        Long problemId,
        String problemUrl,
        @jakarta.validation.constraints.Pattern(regexp = "LOW|MEDIUM|HIGH") String priority
) {}
