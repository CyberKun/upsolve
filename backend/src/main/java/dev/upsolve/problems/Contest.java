package dev.upsolve.problems;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "contest")
public class Contest {

    @Id
    @Column(name = "cf_contest_id")
    private Integer cfContestId;

    private String name;

    @Column(name = "start_time")
    private Instant startTime;

    @Column(name = "duration_secs")
    private Integer durationSecs;

    private String phase;

    @Column(name = "updated_at")
    private Instant updatedAt;

    public Contest() {}

    public Contest(Integer cfContestId, String name, Instant startTime, Integer durationSecs, String phase, Instant updatedAt) {
        this.cfContestId = cfContestId;
        this.name = name;
        this.startTime = startTime;
        this.durationSecs = durationSecs;
        this.phase = phase;
        this.updatedAt = updatedAt;
    }

    public Integer getCfContestId() { return cfContestId; }
    public void setCfContestId(Integer cfContestId) { this.cfContestId = cfContestId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Instant getStartTime() { return startTime; }
    public void setStartTime(Instant startTime) { this.startTime = startTime; }
    public Integer getDurationSecs() { return durationSecs; }
    public void setDurationSecs(Integer durationSecs) { this.durationSecs = durationSecs; }
    public String getPhase() { return phase; }
    public void setPhase(String phase) { this.phase = phase; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
