package dev.upsolve.problems;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {
    Optional<Problem> findByCfContestIdAndProblemIndex(Integer contestId, String index);

    @Query(value = "SELECT * FROM problem p WHERE " +
            "(CAST(:search AS text) IS NULL OR (LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(CONCAT(p.cf_contest_id, p.problem_index)) LIKE LOWER(CONCAT('%', :search, '%')))) AND " +
            "(CAST(:minRating AS integer) IS NULL OR p.rating >= :minRating) AND " +
            "(CAST(:maxRating AS integer) IS NULL OR p.rating <= :maxRating) AND " +
            "(CAST(:tags AS text) IS NULL OR p.tags @> string_to_array(CAST(:tags AS text), ','))", nativeQuery = true)
    Page<Problem> searchProblems(@Param("search") String search,
                                 @Param("minRating") Integer minRating,
                                 @Param("maxRating") Integer maxRating,
                                 @Param("tags") String tags,
                                 Pageable pageable);
}
