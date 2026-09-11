package dev.upsolve.reviews.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
public record RecordReviewRequest(
    @NotBlank @jakarta.validation.constraints.Pattern(regexp = "SOLVED_INDEPENDENTLY|NEEDED_HINT|COULD_NOT_SOLVE") String outcome,
    boolean notesRevealed,
    @Size(max=2000) String reflection,
    @NotBlank @Size(max=100) String idempotencyKey
) {}