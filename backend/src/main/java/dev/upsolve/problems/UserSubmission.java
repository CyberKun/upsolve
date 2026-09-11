package dev.upsolve.problems;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "user_submission")
@IdClass(UserSubmission.UserSubmissionId.class)
public class UserSubmission {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Id
    @Column(name = "submission_id")
    private Long submissionId;

    public UserSubmission() {}

    public UserSubmission(UUID userId, Long submissionId) {
        this.userId = userId;
        this.submissionId = submissionId;
    }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public Long getSubmissionId() { return submissionId; }
    public void setSubmissionId(Long submissionId) { this.submissionId = submissionId; }

    public static class UserSubmissionId implements Serializable {
        private UUID userId;
        private Long submissionId;

        public UserSubmissionId() {}
        public UserSubmissionId(UUID userId, Long submissionId) {
            this.userId = userId;
            this.submissionId = submissionId;
        }

        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }
        public Long getSubmissionId() { return submissionId; }
        public void setSubmissionId(Long submissionId) { this.submissionId = submissionId; }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            UserSubmissionId that = (UserSubmissionId) o;
            return Objects.equals(userId, that.userId) && Objects.equals(submissionId, that.submissionId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(userId, submissionId);
        }
    }
}
