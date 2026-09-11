package dev.upsolve.profile;

import dev.upsolve.auth.AppUser;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "user_preferences")
public class UserPreferences {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private AppUser user;

    @Column(name = "tracked_handle", length = 50)
    private String trackedHandle;

    @Column(name = "handle_normalized", length = 50, unique = true)
    private String handleNormalized;

    @Column(name = "time_zone", nullable = false, length = 100)
    private String timeZone = "UTC";

    @Column(name = "target_rating_min", nullable = false)
    private Integer targetRatingMin = 1400;

    @Column(name = "target_rating_max", nullable = false)
    private Integer targetRatingMax = 1800;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "preferred_topics", columnDefinition = "text[]")
    private List<String> preferredTopics = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "review_intervals", nullable = false, columnDefinition = "int[]")
    private List<Integer> reviewIntervals = new ArrayList<>(List.of(1, 3, 7, 14, 30));

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public UserPreferences() {
    }

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public AppUser getUser() {
        return user;
    }

    public void setUser(AppUser user) {
        this.user = user;
    }

    public String getTrackedHandle() {
        return trackedHandle;
    }

    public void setTrackedHandle(String trackedHandle) {
        this.trackedHandle = trackedHandle;
    }

    public String getHandleNormalized() {
        return handleNormalized;
    }

    public void setHandleNormalized(String handleNormalized) {
        this.handleNormalized = handleNormalized;
    }

    public String getTimeZone() {
        return timeZone;
    }

    public void setTimeZone(String timeZone) {
        this.timeZone = timeZone;
    }

    public Integer getTargetRatingMin() {
        return targetRatingMin;
    }

    public void setTargetRatingMin(Integer targetRatingMin) {
        this.targetRatingMin = targetRatingMin;
    }

    public Integer getTargetRatingMax() {
        return targetRatingMax;
    }

    public void setTargetRatingMax(Integer targetRatingMax) {
        this.targetRatingMax = targetRatingMax;
    }

    public List<String> getPreferredTopics() {
        return preferredTopics;
    }

    public void setPreferredTopics(List<String> preferredTopics) {
        this.preferredTopics = preferredTopics;
    }

    public List<Integer> getReviewIntervals() {
        return reviewIntervals;
    }

    public void setReviewIntervals(List<Integer> reviewIntervals) {
        this.reviewIntervals = reviewIntervals;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
