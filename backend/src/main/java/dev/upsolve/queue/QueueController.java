package dev.upsolve.queue;

import dev.upsolve.auth.AuthUtils;
import dev.upsolve.common.PageResponse;
import dev.upsolve.queue.dto.*;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/queue")
public class QueueController {

    private final QueueService queueService;

    public QueueController(QueueService queueService) {
        this.queueService = queueService;
    }

    @GetMapping
    public PageResponse<QueueItemResponse> getQueue(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Boolean archived,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer minRating,
            @RequestParam(required = false) Integer maxRating,
            Pageable pageable) {
        return queueService.getQueue(AuthUtils.getCurrentUserId(), status, priority, archived, search, minRating, maxRating, pageable);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public QueueItemResponse addToQueue(@jakarta.validation.Valid @RequestBody AddToQueueRequest req) {
        return queueService.addToQueue(AuthUtils.getCurrentUserId(), req);
    }

    @GetMapping("/{id}")
    public QueueItemResponse getQueueItem(@PathVariable UUID id) {
        return queueService.getQueueItem(AuthUtils.getCurrentUserId(), id);
    }

    @PatchMapping("/{id}")
    public QueueItemResponse updateQueueItem(@PathVariable UUID id, @jakarta.validation.Valid @RequestBody UpdateQueueItemRequest req) {
        return queueService.updateQueueItem(AuthUtils.getCurrentUserId(), id, req);
    }

    @PostMapping("/{id}/archive")
    public QueueItemResponse archiveItem(@PathVariable UUID id) {
        return queueService.archiveItem(AuthUtils.getCurrentUserId(), id);
    }

    @PostMapping("/{id}/unarchive")
    public QueueItemResponse unarchiveItem(@PathVariable UUID id) {
        return queueService.unarchiveItem(AuthUtils.getCurrentUserId(), id);
    }

    @GetMapping("/{id}/submissions")
    public List<SubmissionResponse> getSubmissions(@PathVariable UUID id) {
        return queueService.getSubmissions(AuthUtils.getCurrentUserId(), id);
    }

    @GetMapping("/{id}/events")
    public List<QueueEventResponse> getEvents(@PathVariable UUID id) {
        return queueService.getEvents(AuthUtils.getCurrentUserId(), id);
    }
}
