package dev.upsolve.export;

import dev.upsolve.export.dto.ExportData;
import dev.upsolve.notes.NotesService;
import dev.upsolve.profile.PreferencesService;
import dev.upsolve.queue.QueueService;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ExportService {
    
    private final PreferencesService preferencesService;
    private final QueueService queueService;
    private final NotesService notesService;
    private final dev.upsolve.reviews.ReviewScheduleRepository schedules;
    private final dev.upsolve.reviews.ReviewAttemptRepository attempts;

    public ExportService(PreferencesService preferencesService, QueueService queueService, NotesService notesService,
                         dev.upsolve.reviews.ReviewScheduleRepository schedules, dev.upsolve.reviews.ReviewAttemptRepository attempts) {
        this.preferencesService = preferencesService;
        this.queueService = queueService;
        this.notesService = notesService;
        this.schedules = schedules;
        this.attempts = attempts;
    }

    public ExportData exportUserData(UUID userId) {
        var prefs = preferencesService.getPreferences(userId);
        var queue = queueService.getQueue(userId, null, null, null, null, null, null, Pageable.unpaged()).content();
        var notes = queue.stream()
                .map(item -> notesService.getNote(userId, item.id()).orElse(null))
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
                
        var reviews = queue.stream().flatMap(item -> attempts.findByQueueItemIdOrderByReviewedAtDesc(item.id()).stream()).toList();
        return new ExportData(userId, prefs, queue, notes, schedules.findAllById(queue.stream().map(item -> item.id()).toList()), reviews);
    }
}
