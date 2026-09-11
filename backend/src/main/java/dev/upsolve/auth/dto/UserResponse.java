package dev.upsolve.auth.dto;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
    UUID id,
    String username,
    Instant createdAt,
    boolean hasTrackedHandle,
    boolean setupComplete
) {}
