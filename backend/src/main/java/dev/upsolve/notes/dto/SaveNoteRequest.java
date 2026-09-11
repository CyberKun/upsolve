package dev.upsolve.notes.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record SaveNoteRequest(
        @Size(max = 10000) String stuckReason,
        @Size(max = 10000) String keyObservation,
        @Size(max = 10000) String approachComplexity,
        @Size(max = 10000) String whatToRemember,
        List<String> mistakeCategories,
        @NotNull Integer version
) {}
