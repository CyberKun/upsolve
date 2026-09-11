package dev.upsolve.profile.dto;

import java.util.List;
import java.util.UUID;

public record PreferencesResponse(
    UUID userId,
    String trackedHandle,
    String timeZone,
    int targetRatingMin,
    int targetRatingMax,
    List<String> preferredTopics,
    List<Integer> reviewIntervals,
    boolean setupComplete
) {}
