package dev.upsolve.export.dto;

import dev.upsolve.notes.dto.ProblemNoteResponse;
import dev.upsolve.profile.dto.PreferencesResponse;
import dev.upsolve.queue.dto.QueueItemResponse;

import java.util.List;
import java.util.UUID;

public record ExportData(
        UUID userId,
        PreferencesResponse preferences,
        List<QueueItemResponse> queueItems,
        List<ProblemNoteResponse> notes,
        List<dev.upsolve.reviews.ReviewSchedule> reviewSchedules,
        List<dev.upsolve.reviews.ReviewAttempt> reviewHistory
) {}
