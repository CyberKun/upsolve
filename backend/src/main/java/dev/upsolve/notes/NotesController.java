package dev.upsolve.notes;

import dev.upsolve.auth.AuthUtils;
import dev.upsolve.notes.dto.ProblemNoteResponse;
import dev.upsolve.notes.dto.SaveNoteRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/queue/{id}/notes")
public class NotesController {

    private final NotesService notesService;

    public NotesController(NotesService notesService) {
        this.notesService = notesService;
    }

    @GetMapping
    public ResponseEntity<ProblemNoteResponse> getNote(@PathVariable UUID id) {
        return notesService.getNote(AuthUtils.getCurrentUserId(), id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping
    public ProblemNoteResponse saveNote(@PathVariable UUID id, @RequestBody @Valid SaveNoteRequest req) {
        return notesService.saveNote(AuthUtils.getCurrentUserId(), id, req);
    }
}
