package dev.upsolve.profile.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import java.util.List;

public record UpdatePreferencesRequest(
    @Min(800) @Max(3500) Integer targetRatingMin,
    @Min(800) @Max(3500) Integer targetRatingMax,
    List<String> preferredTopics,
    String timeZone,
    @jakarta.validation.constraints.Size(min=1, max=20) List<@jakarta.validation.constraints.NotNull @Positive @Max(3650) Integer> reviewIntervals
) {}
