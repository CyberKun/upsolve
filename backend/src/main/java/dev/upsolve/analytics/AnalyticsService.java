package dev.upsolve.analytics;

import dev.upsolve.analytics.dto.*;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    private final EntityManager entityManager;

    public AnalyticsService(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public TopicAnalyticsResponse getTopicAnalytics(UUID userId, Integer minRating, Integer maxRating) {
        String query = """
            WITH user_subs AS (
                SELECT s.problem_id, s.verdict
                FROM user_submission us
                JOIN submission s ON us.submission_id = s.cf_submission_id
                WHERE us.user_id = :userId
                  AND s.verdict NOT IN ('COMPILATION_ERROR', 'SKIPPED', 'TESTING')
                  AND s.verdict IS NOT NULL
            ),
            problem_stats AS (
                SELECT 
                    tag,
                    p.id AS problem_id,
                    MAX(CASE WHEN s.verdict = 'OK' THEN 1 ELSE 0 END) AS is_solved
                FROM problem p
                JOIN user_subs s ON p.id = s.problem_id
                CROSS JOIN LATERAL unnest(p.tags) AS tag
                WHERE (CAST(:minRating AS integer) IS NULL OR p.rating >= :minRating)
                  AND (CAST(:maxRating AS integer) IS NULL OR p.rating <= :maxRating)
                GROUP BY tag, p.id
            )
            SELECT 
                tag,
                COUNT(problem_id) AS attempted,
                SUM(is_solved) AS solved
            FROM problem_stats
            GROUP BY tag
            ORDER BY attempted DESC
        """;
        
        List<Object[]> results = entityManager.createNativeQuery(query)
                .setParameter("userId", userId)
                .setParameter("minRating", minRating)
                .setParameter("maxRating", maxRating)
                .getResultList();
                
        List<TopicAnalyticsResponse.TopicStat> stats = new ArrayList<>();
        for (Object[] row : results) {
            String tag = (String) row[0];
            int attempted = ((Number) row[1]).intValue();
            int solved = ((Number) row[2]).intValue();
            Double solveRate = attempted >= 5 ? (double) solved / attempted : null;
            boolean insufficientData = attempted < 5;
            stats.add(new TopicAnalyticsResponse.TopicStat(tag, attempted, solved, solveRate, insufficientData));
        }
        
        return new TopicAnalyticsResponse(stats);
    }

    public DifficultyAnalyticsResponse getDifficultyAnalytics(UUID userId) {
        String query = """
            WITH user_subs AS (
                SELECT s.problem_id, s.verdict
                FROM user_submission us
                JOIN submission s ON us.submission_id = s.cf_submission_id
                WHERE us.user_id = :userId
                  AND s.verdict NOT IN ('COMPILATION_ERROR', 'SKIPPED', 'TESTING')
                  AND s.verdict IS NOT NULL
            ),
            problem_stats AS (
                SELECT 
                    p.rating,
                    p.id AS problem_id,
                    MAX(CASE WHEN s.verdict = 'OK' THEN 1 ELSE 0 END) AS is_solved
                FROM problem p
                JOIN user_subs s ON p.id = s.problem_id
                GROUP BY p.rating, p.id
            ),
            bands AS (
                SELECT 
                    CASE
                        WHEN rating IS NULL THEN 'Unrated'
                        WHEN rating < 1200 THEN '<1200'
                        WHEN rating < 1400 THEN '1200-1399'
                        WHEN rating < 1600 THEN '1400-1599'
                        WHEN rating < 1900 THEN '1600-1899'
                        WHEN rating < 2100 THEN '1900-2099'
                        WHEN rating < 2400 THEN '2100-2399'
                        ELSE '2400+'
                    END AS label,
                    CASE
                        WHEN rating IS NULL THEN NULL
                        WHEN rating < 1200 THEN 0
                        WHEN rating < 1400 THEN 1200
                        WHEN rating < 1600 THEN 1400
                        WHEN rating < 1900 THEN 1600
                        WHEN rating < 2100 THEN 1900
                        WHEN rating < 2400 THEN 2100
                        ELSE 2400
                    END AS min_rating,
                    CASE
                        WHEN rating IS NULL THEN NULL
                        WHEN rating < 1200 THEN 1199
                        WHEN rating < 1400 THEN 1399
                        WHEN rating < 1600 THEN 1599
                        WHEN rating < 1900 THEN 1899
                        WHEN rating < 2100 THEN 2099
                        WHEN rating < 2400 THEN 2399
                        ELSE NULL
                    END AS max_rating,
                    problem_id,
                    is_solved
                FROM problem_stats
            )
            SELECT 
                label,
                min_rating,
                max_rating,
                COUNT(problem_id) AS attempted,
                SUM(is_solved) AS solved
            FROM bands
            GROUP BY label, min_rating, max_rating
            ORDER BY min_rating NULLS LAST
        """;
        
        List<Object[]> results = entityManager.createNativeQuery(query)
                .setParameter("userId", userId)
                .getResultList();
                
        List<DifficultyAnalyticsResponse.DifficultyBand> bands = new ArrayList<>();
        for (Object[] row : results) {
            String label = (String) row[0];
            Integer minR = row[1] != null ? ((Number) row[1]).intValue() : null;
            Integer maxR = row[2] != null ? ((Number) row[2]).intValue() : null;
            int attempted = ((Number) row[3]).intValue();
            int solved = ((Number) row[4]).intValue();
            Double solveRate = attempted >= 5 ? (double) solved / attempted : null;
            boolean insufficientData = attempted < 5;
            bands.add(new DifficultyAnalyticsResponse.DifficultyBand(label, minR, maxR, attempted, solved, solveRate, insufficientData));
        }
        
        return new DifficultyAnalyticsResponse(bands);
    }

    public ActivityAnalyticsResponse getActivityAnalytics(UUID userId, int weeks) {
        if (weeks < 1 || weeks > 104) throw new IllegalArgumentException("Weeks must be between 1 and 104");
        String query = """
            WITH dates AS (
                SELECT generate_series(
                    date_trunc('week', current_date - (interval '1 week' * :weeks)),
                    date_trunc('week', current_date),
                    interval '1 week'
                ) AS week_start
            ),
            user_solves AS (
                SELECT 
                    date_trunc('week', s.submitted_at) AS week_start,
                    s.participant_type,
                    s.problem_id
                FROM user_submission us
                JOIN submission s ON us.submission_id = s.cf_submission_id
                WHERE us.user_id = :userId
                  AND s.verdict = 'OK'
                  AND s.submitted_at >= date_trunc('week', current_date - (interval '1 week' * :weeks))
            ),
            weekly_stats AS (
                SELECT 
                    week_start,
                    participant_type,
                    COUNT(DISTINCT problem_id) AS solved_count
                FROM user_solves
                GROUP BY week_start, participant_type
            )
            SELECT 
                d.week_start,
                COALESCE(MAX(CASE WHEN w.participant_type = 'CONTESTANT' THEN w.solved_count END), 0) AS contestant,
                COALESCE(MAX(CASE WHEN w.participant_type = 'VIRTUAL' THEN w.solved_count END), 0) AS virtual,
                COALESCE(MAX(CASE WHEN w.participant_type = 'PRACTICE' THEN w.solved_count END), 0) AS practice
            FROM dates d
            LEFT JOIN weekly_stats w ON d.week_start = w.week_start
            GROUP BY d.week_start
            ORDER BY d.week_start
        """;
        
        List<Object[]> results = entityManager.createNativeQuery(query)
                .setParameter("userId", userId)
                .setParameter("weeks", weeks - 1)
                .getResultList();
                
        List<ActivityAnalyticsResponse.WeeklyActivity> activityList = new ArrayList<>();
        for (Object[] row : results) {
            String weekStart = row[0].toString();
            int contestant = ((Number) row[1]).intValue();
            int virtual = ((Number) row[2]).intValue();
            int practice = ((Number) row[3]).intValue();
            int total = contestant + virtual + practice;
            activityList.add(new ActivityAnalyticsResponse.WeeklyActivity(weekStart, contestant, virtual, practice, total));
        }
        
        return new ActivityAnalyticsResponse(activityList);
    }

    public MistakeAnalyticsResponse getMistakeAnalytics(UUID userId) {
        String query = """
            SELECT 
                category,
                COUNT(*) as cat_count
            FROM queue_item qi
            JOIN problem_note pn ON qi.id = pn.queue_item_id
            CROSS JOIN LATERAL unnest(pn.mistake_categories) AS category
            WHERE qi.user_id = :userId
            GROUP BY category
            ORDER BY cat_count DESC
        """;
        
        List<Object[]> results = entityManager.createNativeQuery(query)
                .setParameter("userId", userId)
                .getResultList();
                
        List<MistakeAnalyticsResponse.MistakeCount> mistakes = new ArrayList<>();
        for (Object[] row : results) {
            mistakes.add(new MistakeAnalyticsResponse.MistakeCount((String) row[0], ((Number) row[1]).intValue()));
        }
        
        String totalQuery = """
            SELECT COUNT(*) 
            FROM queue_item qi
            JOIN problem_note pn ON qi.id = pn.queue_item_id
            WHERE qi.user_id = :userId
        """;
        
        int totalNotes = ((Number) entityManager.createNativeQuery(totalQuery)
                .setParameter("userId", userId)
                .getSingleResult()).intValue();
                
        return new MistakeAnalyticsResponse(mistakes, totalNotes);
    }
}
