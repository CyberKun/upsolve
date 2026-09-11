package dev.upsolve.analytics.dto;

import java.util.List;

public record DifficultyAnalyticsResponse(List<DifficultyBand> bands) {
    public record DifficultyBand(String label, Integer minRating, Integer maxRating, int attempted, int solved, Double solveRate, boolean insufficientData) {}
}
