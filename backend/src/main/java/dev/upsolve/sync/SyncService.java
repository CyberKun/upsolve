package dev.upsolve.sync;

import dev.upsolve.sync.dto.SyncJobResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class SyncService {

    private final SyncJobRepository syncJobRepository;
    private final dev.upsolve.profile.UserPreferencesRepository preferencesRepository;

    public SyncService(SyncJobRepository syncJobRepository, dev.upsolve.profile.UserPreferencesRepository preferencesRepository) {
        this.syncJobRepository = syncJobRepository;
        this.preferencesRepository = preferencesRepository;
    }

    @Transactional
    public SyncJobResponse triggerSync(UUID userId) {
        var prefs = preferencesRepository.findLockedById(userId)
                .orElseThrow(() -> new dev.upsolve.common.EntityNotFoundException("Preferences not found"));
        if (prefs.getTrackedHandle() == null) throw new IllegalArgumentException("Set a tracked handle before syncing");
        var activeJob = syncJobRepository.findFirstByUserIdAndStateIn(userId, List.of("QUEUED", "RUNNING"));
        if (activeJob.isPresent()) {
            return mapToResponse(activeJob.get());
        }

        SyncJob newJob = new SyncJob();
        newJob.setUserId(userId);
        newJob.setState("QUEUED");
        newJob = syncJobRepository.save(newJob);

        // The scheduled worker observes the job only after this transaction commits.

        return mapToResponse(newJob);
    }

    @Transactional(readOnly = true)
    public SyncJobResponse getJob(UUID userId, UUID jobId) {
        SyncJob job = syncJobRepository.findById(jobId).orElseThrow(() -> new dev.upsolve.common.EntityNotFoundException("Job not found"));
        if (!job.getUserId().equals(userId)) {
            throw new dev.upsolve.common.EntityNotFoundException("Job not found");
        }
        return mapToResponse(job);
    }

    @Transactional(readOnly = true)
    public List<SyncJobResponse> getJobs(UUID userId) {
        return syncJobRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private SyncJobResponse mapToResponse(SyncJob job) {
        return new SyncJobResponse(
                job.getId(),
                job.getUserId(),
                job.getState(),
                job.getCreatedAt(),
                job.getUpdatedAt(),
                job.getStartedAt(),
                job.getCompletedAt(),
                job.getTotalSubmissionsFetched(),
                job.getNewSubmissionsImported(),
                job.getProblemsAddedToQueue(),
                job.getErrorSummary()
        );
    }
}
