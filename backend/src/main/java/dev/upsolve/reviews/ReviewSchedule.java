package dev.upsolve.reviews;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "review_schedule")
public class ReviewSchedule {
    @Id
    private UUID queueItemId;
    private int intervalIndex;
    private LocalDate nextReviewDate;
    private boolean paused;
    @Version
    private int version;
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
    
    public UUID getQueueItemId() { return queueItemId; }
    public void setQueueItemId(UUID queueItemId) { this.queueItemId = queueItemId; }
    public int getIntervalIndex() { return intervalIndex; }
    public void setIntervalIndex(int intervalIndex) { this.intervalIndex = intervalIndex; }
    public LocalDate getNextReviewDate() { return nextReviewDate; }
    public void setNextReviewDate(LocalDate nextReviewDate) { this.nextReviewDate = nextReviewDate; }
    public boolean isPaused() { return paused; }
    public void setPaused(boolean paused) { this.paused = paused; }
    public int getVersion() { return version; }
    public void setVersion(int version) { this.version = version; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
