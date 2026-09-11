package dev.upsolve.reviews;

import dev.upsolve.reviews.dto.*;
import dev.upsolve.auth.AuthUtils;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class ReviewController {
    private final ReviewService service;

    public ReviewController(ReviewService service) {
        this.service = service;
    }

    @GetMapping("/reviews/due")
    public ReviewDueResponse getDueReviews() {
        UUID userId = AuthUtils.getCurrentUserId();
        return service.getDueReviews(userId);
    }

    @GetMapping("/queue/{id}/review-schedule")
    public ReviewScheduleResponse getReviewSchedule(@PathVariable UUID id) {
        return service.getSchedule(AuthUtils.getCurrentUserId(), id);
    }

    @PutMapping("/queue/{id}/review-schedule")
    public ReviewScheduleResponse setReviewSchedule(@PathVariable UUID id, @RequestBody SetReviewScheduleRequest req) {
        UUID userId = AuthUtils.getCurrentUserId();
        return req.enabled() ? service.enableReview(userId, id) : service.disableReview(userId, id);
    }

    @PostMapping("/queue/{id}/reviews")
    public ReviewScheduleResponse recordReview(@PathVariable UUID id, @Valid @RequestBody RecordReviewRequest req) {
        UUID userId = AuthUtils.getCurrentUserId();
        return service.recordReview(userId, id, req);
    }

    @PostMapping("/queue/{id}/review-schedule/snooze")
    public ReviewScheduleResponse snoozeReview(@PathVariable UUID id, @Valid @RequestBody SnoozeRequest req) {
        UUID userId = AuthUtils.getCurrentUserId();
        return service.snoozeReview(userId, id, req);
    }
}
