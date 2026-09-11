package dev.upsolve.notes;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "problem_note")
public class ProblemNote {
    @Id
    @Column(name = "queue_item_id")
    private UUID queueItemId;

    @Column(name = "stuck_reason")
    private String stuckReason;

    @Column(name = "key_observation")
    private String keyObservation;

    @Column(name = "approach_complexity")
    private String approachComplexity;

    @Column(name = "what_to_remember")
    private String whatToRemember;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "mistake_categories")
    private String[] mistakeCategories;

    @Version
    private int version;

    @Column(name = "updated_at")
    private Instant updatedAt;

    public ProblemNote() {}

    @PreUpdate
    @PrePersist
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getQueueItemId() { return queueItemId; }
    public void setQueueItemId(UUID queueItemId) { this.queueItemId = queueItemId; }
    public String getStuckReason() { return stuckReason; }
    public void setStuckReason(String stuckReason) { this.stuckReason = stuckReason; }
    public String getKeyObservation() { return keyObservation; }
    public void setKeyObservation(String keyObservation) { this.keyObservation = keyObservation; }
    public String getApproachComplexity() { return approachComplexity; }
    public void setApproachComplexity(String approachComplexity) { this.approachComplexity = approachComplexity; }
    public String getWhatToRemember() { return whatToRemember; }
    public void setWhatToRemember(String whatToRemember) { this.whatToRemember = whatToRemember; }
    public String[] getMistakeCategories() { return mistakeCategories; }
    public void setMistakeCategories(String[] mistakeCategories) { this.mistakeCategories = mistakeCategories; }
    public int getVersion() { return version; }
    public void setVersion(int version) { this.version = version; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
