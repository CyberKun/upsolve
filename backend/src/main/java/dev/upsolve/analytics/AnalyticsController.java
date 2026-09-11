package dev.upsolve.analytics;

import dev.upsolve.analytics.dto.*;
import dev.upsolve.auth.AuthUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/topics")
    public TopicAnalyticsResponse getTopicAnalytics(
            @RequestParam(required = false) Integer minRating,
            @RequestParam(required = false) Integer maxRating) {
        return analyticsService.getTopicAnalytics(AuthUtils.getCurrentUserId(), minRating, maxRating);
    }

    @GetMapping("/difficulty")
    public DifficultyAnalyticsResponse getDifficultyAnalytics() {
        return analyticsService.getDifficultyAnalytics(AuthUtils.getCurrentUserId());
    }

    @GetMapping("/activity")
    public ActivityAnalyticsResponse getActivityAnalytics(
            @RequestParam(defaultValue = "12") int weeks) {
        return analyticsService.getActivityAnalytics(AuthUtils.getCurrentUserId(), weeks);
    }

    @GetMapping("/mistakes")
    public MistakeAnalyticsResponse getMistakeAnalytics() {
        return analyticsService.getMistakeAnalytics(AuthUtils.getCurrentUserId());
    }
}
