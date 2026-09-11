package dev.upsolve.reviews.dto;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
public record SnoozeRequest(
    @NotNull @Positive @jakarta.validation.constraints.Max(365) Integer days
) {}