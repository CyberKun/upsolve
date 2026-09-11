package dev.upsolve.analytics.dto;

import java.util.List;

public record MistakeAnalyticsResponse(List<MistakeCount> mistakes, int totalNotes) {
    public record MistakeCount(String category, int count) {}
}
