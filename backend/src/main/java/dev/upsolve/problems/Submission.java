package dev.upsolve.problems;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "submission")
public class Submission {

    @Id
    @Column(name = "cf_submission_id")
    private Long cfSubmissionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id")
    private Problem problem;

    @Column(name = "cf_contest_id")
    private Integer cfContestId;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    private String verdict;

    private String language;

    @Column(name = "participant_type")
    private String participantType;

    @Column(name = "time_consumed_ms")
    private Integer timeConsumedMs;

    @Column(name = "memory_consumed_bytes")
    private Long memoryConsumedBytes;

    @Column(name = "passed_test_count")
    private Integer passedTestCount;

    @Column(name = "imported_at")
    private Instant importedAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    public Submission() {}

    public Long getCfSubmissionId() { return cfSubmissionId; }
    public void setCfSubmissionId(Long cfSubmissionId) { this.cfSubmissionId = cfSubmissionId; }
    public Problem getProblem() { return problem; }
    public void setProblem(Problem problem) { this.problem = problem; }
    public Integer getCfContestId() { return cfContestId; }
    public void setCfContestId(Integer cfContestId) { this.cfContestId = cfContestId; }
    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }
    public String getVerdict() { return verdict; }
    public void setVerdict(String verdict) { this.verdict = verdict; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public String getParticipantType() { return participantType; }
    public void setParticipantType(String participantType) { this.participantType = participantType; }
    public Integer getTimeConsumedMs() { return timeConsumedMs; }
    public void setTimeConsumedMs(Integer timeConsumedMs) { this.timeConsumedMs = timeConsumedMs; }
    public Long getMemoryConsumedBytes() { return memoryConsumedBytes; }
    public void setMemoryConsumedBytes(Long memoryConsumedBytes) { this.memoryConsumedBytes = memoryConsumedBytes; }
    public Integer getPassedTestCount() { return passedTestCount; }
    public void setPassedTestCount(Integer passedTestCount) { this.passedTestCount = passedTestCount; }
    public Instant getImportedAt() { return importedAt; }
    public void setImportedAt(Instant importedAt) { this.importedAt = importedAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
