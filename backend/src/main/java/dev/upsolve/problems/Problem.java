package dev.upsolve.problems;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "problem")
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cf_contest_id")
    private Integer cfContestId;

    @Column(name = "problem_index")
    private String problemIndex;

    private String name;

    private Integer rating;

    @JdbcTypeCode(SqlTypes.ARRAY)
    private List<String> tags;

    @Column(name = "problem_type")
    private String problemType;

    @Column(name = "metadata_updated_at")
    private Instant metadataUpdatedAt;

    public Problem() {}

    public Problem(Integer cfContestId, String problemIndex, String name, Integer rating, List<String> tags, String problemType, Instant metadataUpdatedAt) {
        this.cfContestId = cfContestId;
        this.problemIndex = problemIndex;
        this.name = name;
        this.rating = rating;
        this.tags = tags;
        this.problemType = problemType;
        this.metadataUpdatedAt = metadataUpdatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getCfContestId() { return cfContestId; }
    public void setCfContestId(Integer cfContestId) { this.cfContestId = cfContestId; }
    public String getProblemIndex() { return problemIndex; }
    public void setProblemIndex(String problemIndex) { this.problemIndex = problemIndex; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public String getProblemType() { return problemType; }
    public void setProblemType(String problemType) { this.problemType = problemType; }
    public Instant getMetadataUpdatedAt() { return metadataUpdatedAt; }
    public void setMetadataUpdatedAt(Instant metadataUpdatedAt) { this.metadataUpdatedAt = metadataUpdatedAt; }
}
