package dev.upsolve.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TrackedHandleRequest(
    @NotBlank
    @Size(max = 50)
    String handle
) {}
