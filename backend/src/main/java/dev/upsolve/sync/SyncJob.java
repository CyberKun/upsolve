package dev.upsolve.sync;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "sync_job")
public class SyncJob {

    @Id
    private UUID id;

    @Column(name = "user_id")
    private UUID userId;

    private String state; // QUEUED, RUNNING, COMPLETED, FAILED

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "lease_expires_at")
    private Instant leaseExpiresAt;

    @Column(name = "total_submissions_fetched")
    private Integer totalSubmissionsFetched = 0;

    @Column(name = "new_submissions_imported")
    private Integer newSubmissionsImported = 0;

    @Column(name = "problems_added_to_queue")
    private Integer problemsAddedToQueue = 0;

    @Column(name = "checkpoint_from")
    private Integer checkpointFrom;

    @Column(name = "error_summary")
    private String errorSummary;

    public SyncJob() {
        this.id = UUID.randomUUID();
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
    public Instant getLeaseExpiresAt() { return leaseExpiresAt; }
    public void setLeaseExpiresAt(Instant leaseExpiresAt) { this.leaseExpiresAt = leaseExpiresAt; }
    public Integer getTotalSubmissionsFetched() { return totalSubmissionsFetched; }
    public void setTotalSubmissionsFetched(Integer totalSubmissionsFetched) { this.totalSubmissionsFetched = totalSubmissionsFetched; }
    public Integer getNewSubmissionsImported() { return newSubmissionsImported; }
    public void setNewSubmissionsImported(Integer newSubmissionsImported) { this.newSubmissionsImported = newSubmissionsImported; }
    public Integer getProblemsAddedToQueue() { return problemsAddedToQueue; }
    public void setProblemsAddedToQueue(Integer problemsAddedToQueue) { this.problemsAddedToQueue = problemsAddedToQueue; }
    public Integer getCheckpointFrom() { return checkpointFrom; }
    public void setCheckpointFrom(Integer checkpointFrom) { this.checkpointFrom = checkpointFrom; }
    public String getErrorSummary() { return errorSummary; }
    public void setErrorSummary(String errorSummary) { this.errorSummary = errorSummary; }
}
