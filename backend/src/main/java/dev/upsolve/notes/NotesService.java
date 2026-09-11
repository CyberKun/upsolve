package dev.upsolve.notes;

import dev.upsolve.common.ConflictException;
import dev.upsolve.common.EntityNotFoundException;
import dev.upsolve.notes.dto.ProblemNoteResponse;
import dev.upsolve.notes.dto.SaveNoteRequest;
import dev.upsolve.queue.QueueItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class NotesService {

    private final ProblemNoteRepository problemNoteRepository;
    private final QueueItemRepository queueItemRepository;

    public NotesService(ProblemNoteRepository problemNoteRepository, QueueItemRepository queueItemRepository) {
        this.problemNoteRepository = problemNoteRepository;
        this.queueItemRepository = queueItemRepository;
    }

    public Optional<ProblemNoteResponse> getNote(UUID userId, UUID queueItemId) {
        if (queueItemRepository.findByIdAndUserId(queueItemId, userId).isEmpty()) {
            throw new EntityNotFoundException("QueueItem not found");
        }

        return problemNoteRepository.findById(queueItemId)
                .map(this::mapToResponse);
    }

    public ProblemNoteResponse saveNote(UUID userId, UUID queueItemId, SaveNoteRequest req) {
        if (queueItemRepository.findByIdAndUserId(queueItemId, userId).isEmpty()) {
            throw new EntityNotFoundException("QueueItem not found");
        }

        ProblemNote note = problemNoteRepository.findById(queueItemId)
                .orElse(new ProblemNote());

        if (note.getQueueItemId() != null && note.getVersion() != req.version()) {
            throw new ConflictException("Version mismatch");
        }

        if (note.getQueueItemId() == null) {
            note.setQueueItemId(queueItemId);
            note.setVersion(0);
        }

        note.setStuckReason(req.stuckReason());
        note.setKeyObservation(req.keyObservation());
        note.setApproachComplexity(req.approachComplexity());
        note.setWhatToRemember(req.whatToRemember());
        if (req.mistakeCategories() != null) {
            note.setMistakeCategories(req.mistakeCategories().toArray(new String[0]));
        } else {
            note.setMistakeCategories(new String[0]);
        }

        note = problemNoteRepository.saveAndFlush(note);
        return mapToResponse(note);
    }

    private ProblemNoteResponse mapToResponse(ProblemNote note) {
        List<String> categories = note.getMistakeCategories() != null ? Arrays.asList(note.getMistakeCategories()) : List.of();
        return new ProblemNoteResponse(
                note.getQueueItemId(),
                note.getStuckReason(),
                note.getKeyObservation(),
                note.getApproachComplexity(),
                note.getWhatToRemember(),
                categories,
                note.getVersion(),
                note.getUpdatedAt()
        );
    }
}
