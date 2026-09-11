package dev.upsolve.queue;

import dev.upsolve.problems.Problem;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class QueueItemSpecs {
    
    private QueueItemSpecs() {}

    public static Specification<QueueItem> forUser(UUID userId) {
        return (root, query, cb) -> cb.equal(root.get("userId"), userId);
    }

    public static Specification<QueueItem> hasStatus(String status) {
        return (root, query, cb) -> "ACTIVE".equals(status) ? root.get("status").in("PENDING", "ATTEMPTED") : cb.equal(root.get("status"), status);
    }

    public static Specification<QueueItem> hasPriority(String priority) {
        return (root, query, cb) -> cb.equal(root.get("priority"), priority);
    }

    public static Specification<QueueItem> isArchived(boolean archived) {
        return (root, query, cb) -> archived ? cb.isNotNull(root.get("archivedAt")) : cb.isNull(root.get("archivedAt"));
    }

    public static Specification<QueueItem> searchByName(String search) {
        return (root, query, cb) -> {
            Join<QueueItem, Problem> problem = root.join("problem");
            return cb.like(cb.lower(problem.get("name")), "%" + search.toLowerCase() + "%");
        };
    }

    public static Specification<QueueItem> ratingBetween(Integer min, Integer max) {
        return (root, query, cb) -> {
            Join<QueueItem, Problem> problem = root.join("problem");
            if (min != null && max != null) {
                return cb.between(problem.get("rating"), min, max);
            } else if (min != null) {
                return cb.greaterThanOrEqualTo(problem.get("rating"), min);
            } else if (max != null) {
                return cb.lessThanOrEqualTo(problem.get("rating"), max);
            }
            return cb.conjunction();
        };
    }
}
