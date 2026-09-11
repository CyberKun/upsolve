package dev.upsolve.analytics.dto;

import java.util.List;

public record ActivityAnalyticsResponse(List<WeeklyActivity> activity) {
    public record WeeklyActivity(String weekStart, int contestant, int virtual, int practice, int total) {}
}
