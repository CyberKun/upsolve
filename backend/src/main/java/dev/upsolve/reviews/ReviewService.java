package dev.upsolve.reviews;

import dev.upsolve.common.EntityNotFoundException;
import dev.upsolve.profile.UserPreferences;
import dev.upsolve.profile.UserPreferencesRepository;
import dev.upsolve.problems.dto.ProblemResponse;
import dev.upsolve.queue.QueueItem;
import dev.upsolve.queue.QueueItemRepository;
import dev.upsolve.reviews.dto.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@Service
@Transactional
public class ReviewService {
    private final ReviewScheduleRepository scheduleRepo;
    private final ReviewAttemptRepository attemptRepo;
    private final QueueItemRepository queueRepo;
    private final UserPreferencesRepository prefsRepo;

    public ReviewService(ReviewScheduleRepository scheduleRepo, ReviewAttemptRepository attemptRepo,
                         QueueItemRepository queueRepo, UserPreferencesRepository prefsRepo) {
        this.scheduleRepo = scheduleRepo;
        this.attemptRepo = attemptRepo;
        this.queueRepo = queueRepo;
        this.prefsRepo = prefsRepo;
    }

    private QueueItem owned(UUID userId, UUID id) {
        return queueRepo.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Queue item not found"));
    }

    private UserPreferences preferences(UUID userId) {
        return prefsRepo.findById(userId).orElseThrow(() -> new EntityNotFoundException("Preferences not found"));
    }

    private LocalDate today(UserPreferences prefs) {
        return LocalDate.now(ZoneId.of(prefs.getTimeZone()));
    }

    private ReviewSchedule schedule(UUID id) {
        return scheduleRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("Review schedule not found"));
    }

    public ReviewScheduleResponse getSchedule(UUID userId, UUID id) {
        owned(userId, id);
        return response(schedule(id));
    }

    public ReviewScheduleResponse enableReview(UUID userId, UUID id) {
        QueueItem item = owned(userId, id);
        if (item.getArchivedAt() != null) throw new IllegalArgumentException("Unarchive the problem before enabling reviews");
        UserPreferences prefs = preferences(userId);
        ReviewSchedule rs = scheduleRepo.findById(id).orElseGet(() -> {
            ReviewSchedule created = new ReviewSchedule();
            created.setQueueItemId(id);
            created.setNextReviewDate(today(prefs).plusDays(prefs.getReviewIntervals().getFirst()));
            return created;
        });
        rs.setPaused(false);
        return response(scheduleRepo.saveAndFlush(rs));
    }

    public ReviewScheduleResponse disableReview(UUID userId, UUID id) {
        owned(userId, id);
        ReviewSchedule rs = schedule(id);
        rs.setPaused(true);
        return response(scheduleRepo.saveAndFlush(rs));
    }

    public ReviewDueResponse getDueReviews(UUID userId) {
        LocalDate today = today(preferences(userId));
        List<ReviewItemResponse> overdue = new ArrayList<>(), dueToday = new ArrayList<>(), upcoming = new ArrayList<>();
        var schedules = scheduleRepo.findDueReviews(userId, today.plusDays(7));
        schedules.sort(Comparator.comparing(ReviewSchedule::getNextReviewDate).thenComparing(ReviewSchedule::getQueueItemId));
        for (ReviewSchedule rs : schedules) {
            QueueItem item = owned(userId, rs.getQueueItemId());
            var p = item.getProblem();
            var review = new ReviewItemResponse(item.getId(), new ProblemResponse(p.getId(), p.getCfContestId(),
                    p.getProblemIndex(), p.getName(), p.getRating(), p.getTags(), p.getProblemType()), item.getStatus(),
                    rs.getNextReviewDate(), rs.getIntervalIndex(), attemptRepo.findByQueueItemIdOrderByReviewedAtDesc(item.getId()).size());
            if (rs.getNextReviewDate().isBefore(today)) overdue.add(review);
            else if (rs.getNextReviewDate().equals(today)) dueToday.add(review);
            else upcoming.add(review);
        }
        return new ReviewDueResponse(overdue, dueToday, upcoming);
    }

    public ReviewScheduleResponse recordReview(UUID userId, UUID id, RecordReviewRequest req) {
        QueueItem item = owned(userId, id);
        ReviewSchedule rs = scheduleRepo.findLockedById(id)
                .orElseThrow(() -> new EntityNotFoundException("Review schedule not found"));
        if (attemptRepo.existsByQueueItemIdAndIdempotencyKey(id, req.idempotencyKey())) return response(rs);
        if (item.getArchivedAt() != null || rs.isPaused()) throw new IllegalArgumentException("Review is paused or archived");
        UserPreferences prefs = preferences(userId);
        List<Integer> intervals = prefs.getReviewIntervals();
        int index = Math.min(rs.getIntervalIndex(), intervals.size() - 1);
        index = switch (req.outcome()) {
            case "SOLVED_INDEPENDENTLY" -> req.notesRevealed() ? index : Math.min(index + 1, intervals.size() - 1);
            case "NEEDED_HINT" -> index;
            case "COULD_NOT_SOLVE" -> 0;
            default -> throw new IllegalArgumentException("Invalid review outcome");
        };
        ReviewAttempt attempt = new ReviewAttempt();
        attempt.setQueueItemId(id);
        attempt.setOutcome(req.outcome());
        attempt.setNotesRevealed(req.notesRevealed());
        attempt.setReflection(req.reflection());
        attempt.setIdempotencyKey(req.idempotencyKey());
        attemptRepo.save(attempt);
        rs.setIntervalIndex(index);
        rs.setNextReviewDate(today(prefs).plusDays(intervals.get(index)));
        return response(scheduleRepo.saveAndFlush(rs));
    }

    public ReviewScheduleResponse snoozeReview(UUID userId, UUID id, SnoozeRequest req) {
        owned(userId, id);
        ReviewSchedule rs = schedule(id);
        LocalDate today = today(preferences(userId));
        LocalDate base = rs.getNextReviewDate() != null && rs.getNextReviewDate().isAfter(today) ? rs.getNextReviewDate() : today;
        rs.setNextReviewDate(base.plusDays(req.days()));
        return response(scheduleRepo.saveAndFlush(rs));
    }

    private ReviewScheduleResponse response(ReviewSchedule rs) {
        return new ReviewScheduleResponse(rs.getQueueItemId(), rs.getIntervalIndex(),
                rs.getNextReviewDate() == null ? null : rs.getNextReviewDate().toString(), rs.isPaused(), rs.getVersion());
    }
}

