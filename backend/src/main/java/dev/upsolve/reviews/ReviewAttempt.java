package dev.upsolve.reviews;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "review_attempt", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"queueItemId", "idempotencyKey"})
})
public class ReviewAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private UUID queueItemId;
    private Instant reviewedAt;
    private String outcome;
    private boolean notesRevealed;
    @Column(length = 2000)
    private String reflection;
    private String idempotencyKey;
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        if (reviewedAt == null) reviewedAt = Instant.now();
    }
    
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getQueueItemId() { return queueItemId; }
    public void setQueueItemId(UUID queueItemId) { this.queueItemId = queueItemId; }
    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }
    public String getOutcome() { return outcome; }
    public void setOutcome(String outcome) { this.outcome = outcome; }
    public boolean isNotesRevealed() { return notesRevealed; }
    public void setNotesRevealed(boolean notesRevealed) { this.notesRevealed = notesRevealed; }
    public String getReflection() { return reflection; }
    public void setReflection(String reflection) { this.reflection = reflection; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}