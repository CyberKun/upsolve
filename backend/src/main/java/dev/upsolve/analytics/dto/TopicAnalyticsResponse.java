package dev.upsolve.analytics.dto;

import java.util.List;

public record TopicAnalyticsResponse(List<TopicStat> topics) {
    public record TopicStat(String tag, int attempted, int solved, Double solveRate, boolean insufficientData) {}
}
