package dev.upsolve.reviews.dto;
import java.util.UUID;
public record ReviewScheduleResponse(UUID queueItemId, int intervalIndex, String nextReviewDate, boolean paused, int version) {}