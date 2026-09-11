package dev.upsolve.queue;

import dev.upsolve.common.ConflictException;
import dev.upsolve.common.EntityNotFoundException;
import dev.upsolve.common.PageResponse;
import dev.upsolve.notes.ProblemNoteRepository;
import dev.upsolve.problems.Problem;
import dev.upsolve.problems.ProblemRepository;
import dev.upsolve.problems.SubmissionRepository;
import dev.upsolve.problems.dto.ProblemResponse;
import dev.upsolve.queue.dto.*;
import dev.upsolve.reviews.ReviewSchedule;
import dev.upsolve.reviews.ReviewScheduleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Transactional
public class QueueService {

    private final QueueItemRepository queueItemRepository;
    private final QueueEventRepository queueEventRepository;
    private final ProblemRepository problemRepository;
    private final SubmissionRepository submissionRepository;
    private final ReviewScheduleRepository reviewScheduleRepository;
    private final ProblemNoteRepository problemNoteRepository;

    public QueueService(QueueItemRepository queueItemRepository,
                        QueueEventRepository queueEventRepository,
                        ProblemRepository problemRepository,
                        SubmissionRepository submissionRepository,
                        ReviewScheduleRepository reviewScheduleRepository,
                        ProblemNoteRepository problemNoteRepository) {
        this.queueItemRepository = queueItemRepository;
        this.queueEventRepository = queueEventRepository;
        this.problemRepository = problemRepository;
        this.submissionRepository = submissionRepository;
        this.reviewScheduleRepository = reviewScheduleRepository;
        this.problemNoteRepository = problemNoteRepository;
    }

    public PageResponse<QueueItemResponse> getQueue(UUID userId, String status, String priority, Boolean archived, String search, Integer minRating, Integer maxRating, Pageable pageable) {
        Specification<QueueItem> spec = Specification.where(QueueItemSpecs.forUser(userId));
        
        if (status != null && !status.isEmpty()) {
            spec = spec.and(QueueItemSpecs.hasStatus(status));
        }
        if (priority != null && !priority.isEmpty()) {
            spec = spec.and(QueueItemSpecs.hasPriority(priority));
        }
        if (archived != null) {
            spec = spec.and(QueueItemSpecs.isArchived(archived));
        }
        if (search != null && !search.isEmpty()) {
            spec = spec.and(QueueItemSpecs.searchByName(search));
        }
        if (minRating != null || maxRating != null) {
            spec = spec.and(QueueItemSpecs.ratingBetween(minRating, maxRating));
        }

        Page<QueueItem> page = queueItemRepository.findAll(spec, pageable);
        
        List<QueueItemResponse> content = page.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return new PageResponse<>(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    public QueueItemResponse addToQueue(UUID userId, AddToQueueRequest req) {
        Problem problem = null;
        if (req.problemId() != null) {
            problem = problemRepository.findById(req.problemId())
                    .orElseThrow(() -> new EntityNotFoundException("Problem not found"));
        } else if (req.problemUrl() != null && !req.problemUrl().isEmpty()) {
            try {
                java.net.URI uri = java.net.URI.create(req.problemUrl().trim());
                if (!List.of("https", "http").contains(uri.getScheme()) ||
                        !List.of("codeforces.com", "www.codeforces.com").contains(uri.getHost()))
                    throw new IllegalArgumentException("Invalid Codeforces problem URL");
            } catch (RuntimeException ex) { throw new IllegalArgumentException("Invalid Codeforces problem URL"); }
            Pattern contestPattern = Pattern.compile("/contest/(\\d+)/problem/([A-Za-z0-9]+)");
            Pattern problemsetPattern = Pattern.compile("/problemset/problem/(\\d+)/([A-Za-z0-9]+)");
            
            Integer contestId = null;
            String index = null;
            
            Matcher cMatcher = contestPattern.matcher(req.problemUrl());
            if (cMatcher.find()) {
                contestId = Integer.parseInt(cMatcher.group(1));
                index = cMatcher.group(2);
            } else {
                Matcher pMatcher = problemsetPattern.matcher(req.problemUrl());
                if (pMatcher.find()) {
                    contestId = Integer.parseInt(pMatcher.group(1));
                    index = pMatcher.group(2);
                }
            }
            
            if (contestId != null && index != null) {
                problem = problemRepository.findByCfContestIdAndProblemIndex(contestId, index)
                        .orElseThrow(() -> new EntityNotFoundException("Problem not found for the given URL"));
            } else {
                throw new IllegalArgumentException("Invalid Codeforces problem URL");
            }
        } else {
            throw new IllegalArgumentException("Must provide either problemId or problemUrl");
        }
        
        if (queueItemRepository.existsByUserIdAndProblemId(userId, problem.getId())) {
            throw new ConflictException("Problem is already in the queue");
        }
        
        QueueItem item = new QueueItem();
        item.setUserId(userId);
        item.setProblem(problem);
        var previous = submissionRepository.findForUserAndProblem(userId, problem.getId());
        item.setStatus(previous.stream().anyMatch(s -> "OK".equals(s.getVerdict())) ? "SOLVED" :
                previous.stream().anyMatch(s -> s.getVerdict() != null && !List.of("COMPILATION_ERROR", "SKIPPED", "TESTING").contains(s.getVerdict())) ? "ATTEMPTED" : "PENDING");
        item.setPriority(req.priority() != null ? req.priority() : "MEDIUM");
        item.setSource("MANUAL");
        
        item = queueItemRepository.saveAndFlush(item);
        
        recordEvent(item.getId(), "CREATED", userId.toString(), "Added to queue");
        
        return mapToResponse(item);
    }

    public QueueItemResponse getQueueItem(UUID userId, UUID id) {
        QueueItem item = queueItemRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("QueueItem not found"));
        return mapToResponse(item);
    }

    public QueueItemResponse updateQueueItem(UUID userId, UUID id, UpdateQueueItemRequest req) {
        QueueItem item = queueItemRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("QueueItem not found"));
                
        if (item.getVersion() != req.version()) {
            throw new ConflictException("Version mismatch");
        }
        
        if ("SOLVED".equals(item.getStatus()) && req.status() != null && !"SOLVED".equals(req.status())) {
            throw new IllegalArgumentException("Cannot revert SOLVED status");
        }
        
        if (req.status() != null && !req.status().isEmpty()) {
            item.setStatus(req.status());
            recordEvent(item.getId(), "STATUS_CHANGED", userId.toString(), "Status changed to " + req.status());
        }
        
        if (req.priority() != null && !req.priority().isEmpty()) {
            item.setPriority(req.priority());
            recordEvent(item.getId(), "PRIORITY_CHANGED", userId.toString(), "Priority changed to " + req.priority());
        }
        
        item = queueItemRepository.saveAndFlush(item);
        return mapToResponse(item);
    }

    public QueueItemResponse archiveItem(UUID userId, UUID id) {
        QueueItem item = queueItemRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("QueueItem not found"));
                
        item.setArchivedAt(Instant.now());
        item = queueItemRepository.saveAndFlush(item);
        recordEvent(item.getId(), "ARCHIVED", userId.toString(), "Archived item");
        return mapToResponse(item);
    }

    public QueueItemResponse unarchiveItem(UUID userId, UUID id) {
        QueueItem item = queueItemRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("QueueItem not found"));
                
        item.setArchivedAt(null);
        item = queueItemRepository.saveAndFlush(item);
        recordEvent(item.getId(), "UNARCHIVED", userId.toString(), "Unarchived item");
        return mapToResponse(item);
    }

    public List<SubmissionResponse> getSubmissions(UUID userId, UUID id) {
        QueueItem item = queueItemRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("QueueItem not found"));
                
        return submissionRepository.findForUserAndProblem(userId, item.getProblem().getId()).stream()
                .map(sub -> new SubmissionResponse(
                        sub.getCfSubmissionId(),
                        sub.getSubmittedAt(),
                        sub.getVerdict(),
                        sub.getLanguage(),
                        sub.getParticipantType(),
                        sub.getTimeConsumedMs(),
                        sub.getPassedTestCount()
                )).toList();
    }

    public List<QueueEventResponse> getEvents(UUID userId, UUID id) {
        QueueItem item = queueItemRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("QueueItem not found"));
                
        return queueEventRepository.findByQueueItemIdOrderByCreatedAtDesc(item.getId()).stream()
                .map(e -> new QueueEventResponse(e.getId(), e.getEventType(), e.getActor(), e.getPayload(), e.getCreatedAt()))
                .toList();
    }
    
    private void recordEvent(UUID queueItemId, String eventType, String actor, String payload) {
        QueueEvent event = new QueueEvent();
        event.setQueueItemId(queueItemId);
        event.setEventType(eventType);
        event.setActor("USER");
        event.setPayload(String.format("{\"message\":\"%s\"}", payload));
        queueEventRepository.save(event);
    }
    
    private QueueItemResponse mapToResponse(QueueItem item) {
        Problem p = item.getProblem();
        ProblemResponse problemResponse = new ProblemResponse(p.getId(), p.getCfContestId(), p.getProblemIndex(), p.getName(), p.getRating(), p.getTags(), p.getProblemType());
        
        boolean hasNotes = problemNoteRepository.existsById(item.getId());
        
        Optional<ReviewSchedule> rs = reviewScheduleRepository.findById(item.getId());
        boolean hasReview = rs.isPresent();
        String nextReviewDate = rs.map(r -> r.getNextReviewDate() != null ? r.getNextReviewDate().toString() : null).orElse(null);
        
        int subCount = submissionRepository.findForUserAndProblem(item.getUserId(), p.getId()).size();
        
        return QueueItemResponse.from(item, problemResponse, hasNotes, hasReview, nextReviewDate, subCount);
    }
}
