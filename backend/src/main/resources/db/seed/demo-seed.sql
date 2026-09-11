-- Demo seed data for Upsolve
-- Run against an empty database after migrations to populate with sample data
-- This creates a demo user with handle "tourist" and some sample problems/queue items

-- Demo user: username "demo", password "demo123" (BCrypt hash)
INSERT INTO app_user (id, username, username_norm, password_hash, created_at)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'demo',
    'demo',
    '$2b$10$yPfspLTkKROA5JSTOluh1OantefyN8VwLedyTbUmRqNk0QMtG4NDK', -- "demo123"
    now()
) ON CONFLICT (username_norm) DO NOTHING;

INSERT INTO user_preferences (user_id, tracked_handle, handle_normalized, time_zone, target_rating_min, target_rating_max, preferred_topics, review_intervals, updated_at)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'demo_handle',
    'demo_handle',
    'Asia/Kolkata',
    1400, 1800,
    ARRAY['math', 'dp', 'greedy', 'graphs', 'binary search'],
    ARRAY[1, 3, 7, 14, 30],
    now()
) ON CONFLICT (user_id) DO NOTHING;

-- Sample contests
INSERT INTO contest (cf_contest_id, name, start_time, duration_secs, phase, updated_at) VALUES
(1900, 'Codeforces Round 900 (Div. 2)', '2024-09-15 14:35:00+00', 7200, 'FINISHED', now()),
(1901, 'Codeforces Round 901 (Div. 2)', '2024-09-22 14:35:00+00', 7200, 'FINISHED', now()),
(1902, 'Educational Codeforces Round 170', '2024-09-29 14:35:00+00', 7200, 'FINISHED', now()),
(1903, 'Codeforces Round 902 (Div. 1 + Div. 2)', '2024-10-06 14:35:00+00', 7200, 'FINISHED', now()),
(1904, 'Codeforces Round 903 (Div. 3)', '2024-10-13 14:35:00+00', 7200, 'FINISHED', now())
ON CONFLICT (cf_contest_id) DO NOTHING;

-- Sample problems across difficulty bands
INSERT INTO problem (id, cf_contest_id, problem_index, name, rating, tags, problem_type, metadata_updated_at) VALUES
(1,  1900, 'A', 'Cover in Water', 800,  ARRAY['implementation', 'greedy'], 'PROGRAMMING', now()),
(2,  1900, 'B', 'Chip and Ribbon', 1100, ARRAY['greedy', 'implementation'], 'PROGRAMMING', now()),
(3,  1900, 'C', 'Anji''s Binary Tree', 1300, ARRAY['dp', 'trees', 'dfs and similar'], 'PROGRAMMING', now()),
(4,  1900, 'D', 'Lonely Mountain Dungeons', 1500, ARRAY['math', 'combinatorics', 'brute force'], 'PROGRAMMING', now()),
(5,  1900, 'E', 'Cardboard for Boxes', 1700, ARRAY['binary search', 'math', 'implementation'], 'PROGRAMMING', now()),
(6,  1900, 'F', 'Minimum Array', 1900, ARRAY['data structures', 'greedy', 'sortings'], 'PROGRAMMING', now()),
(7,  1901, 'A', 'Line Trip', 900,  ARRAY['greedy', 'math'], 'PROGRAMMING', now()),
(8,  1901, 'B', 'Erase First or Second Letter', 1200, ARRAY['combinatorics', 'math'], 'PROGRAMMING', now()),
(9,  1901, 'C', 'Painting the Array I', 1400, ARRAY['greedy', 'dp'], 'PROGRAMMING', now()),
(10, 1901, 'D', 'Carry Bit', 1600, ARRAY['math', 'combinatorics', 'dp'], 'PROGRAMMING', now()),
(11, 1901, 'E', 'Block Sequence', 1800, ARRAY['dp', 'implementation'], 'PROGRAMMING', now()),
(12, 1902, 'A', 'Binary Inversions', 1000, ARRAY['implementation', 'math'], 'PROGRAMMING', now()),
(13, 1902, 'B', 'Monsters', 1100, ARRAY['greedy', 'sortings', 'implementation'], 'PROGRAMMING', now()),
(14, 1902, 'C', 'Prefix Removal', 1300, ARRAY['implementation', 'math'], 'PROGRAMMING', now()),
(15, 1902, 'D', 'Bracket Coloring', 1600, ARRAY['constructive algorithms', 'greedy'], 'PROGRAMMING', now()),
(16, 1902, 'E', 'Min Cost String', 2000, ARRAY['strings', 'graphs', 'constructive algorithms'], 'PROGRAMMING', now()),
(17, 1903, 'A', 'Halloumi Boxes', 800,  ARRAY['brute force', 'sortings'], 'PROGRAMMING', now()),
(18, 1903, 'B', 'Blank Space', 1100, ARRAY['implementation'], 'PROGRAMMING', now()),
(19, 1903, 'C', 'Directional Increase', 1500, ARRAY['greedy', 'math'], 'PROGRAMMING', now()),
(20, 1903, 'D', 'Dima and Salesman', 1700, ARRAY['dp', 'sortings', 'greedy'], 'PROGRAMMING', now()),
(21, 1904, 'A', 'Forked!', 1000, ARRAY['brute force', 'implementation'], 'PROGRAMMING', now()),
(22, 1904, 'B', 'Getting Points', 1100, ARRAY['binary search', 'greedy'], 'PROGRAMMING', now()),
(23, 1904, 'C', 'Smilo and Monsters', 1300, ARRAY['greedy', 'sortings'], 'PROGRAMMING', now()),
(24, 1904, 'D', 'Plus Minus Permutation', 1500, ARRAY['math'], 'PROGRAMMING', now()),
(25, 1904, 'E', 'Nearly Shortest Repeating Substring', 1700, ARRAY['strings', 'implementation', 'brute force'], 'PROGRAMMING', now())
ON CONFLICT (cf_contest_id, problem_index) DO NOTHING;

-- Reset sequence
SELECT setval('problem_id_seq', 25);

-- Sample submissions (various verdicts for the demo user)
INSERT INTO submission (cf_submission_id, problem_id, cf_contest_id, submitted_at, verdict, language, participant_type, time_consumed_ms, memory_consumed_bytes, passed_test_count, imported_at, updated_at) VALUES
-- Solved problems (OK)
(200001, 1,  1900, '2024-09-15 15:05:00+00', 'OK', 'GNU C++20 (64)', 'CONTESTANT', 15, 262144, 10, now(), now()),
(200002, 2,  1900, '2024-09-15 15:25:00+00', 'OK', 'GNU C++20 (64)', 'CONTESTANT', 31, 524288, 15, now(), now()),
(200003, 7,  1901, '2024-09-22 14:50:00+00', 'OK', 'GNU C++20 (64)', 'CONTESTANT', 15, 262144, 8, now(), now()),
(200004, 8,  1901, '2024-09-22 15:10:00+00', 'OK', 'GNU C++20 (64)', 'CONTESTANT', 46, 1048576, 20, now(), now()),
(200005, 12, 1902, '2024-09-29 14:45:00+00', 'OK', 'GNU C++20 (64)', 'CONTESTANT', 15, 262144, 5, now(), now()),
(200006, 13, 1902, '2024-09-29 15:00:00+00', 'OK', 'GNU C++20 (64)', 'CONTESTANT', 31, 524288, 12, now(), now()),
(200007, 17, 1903, '2024-10-06 14:48:00+00', 'OK', 'GNU C++20 (64)', 'CONTESTANT', 15, 262144, 8, now(), now()),
(200008, 21, 1904, '2024-10-13 14:55:00+00', 'OK', 'GNU C++20 (64)', 'CONTESTANT', 15, 262144, 6, now(), now()),
-- Failed attempts on medium problems (WA, TLE)
(200009, 3,  1900, '2024-09-15 16:00:00+00', 'WRONG_ANSWER', 'GNU C++20 (64)', 'CONTESTANT', 62, 1048576, 5, now(), now()),
(200010, 4,  1900, '2024-09-15 16:30:00+00', 'WRONG_ANSWER', 'GNU C++20 (64)', 'CONTESTANT', 15, 262144, 3, now(), now()),
(200011, 5,  1900, '2024-09-17 10:00:00+00', 'TIME_LIMIT_EXCEEDED', 'GNU C++20 (64)', 'PRACTICE', 2000, 4194304, 20, now(), now()),
(200012, 9,  1901, '2024-09-22 15:40:00+00', 'WRONG_ANSWER', 'GNU C++20 (64)', 'CONTESTANT', 46, 524288, 8, now(), now()),
(200013, 10, 1901, '2024-09-23 12:00:00+00', 'WRONG_ANSWER', 'GNU C++20 (64)', 'PRACTICE', 31, 262144, 4, now(), now()),
(200014, 10, 1901, '2024-09-23 13:00:00+00', 'OK', 'GNU C++20 (64)', 'PRACTICE', 62, 524288, 15, now(), now()),
(200015, 11, 1901, '2024-09-24 10:00:00+00', 'WRONG_ANSWER', 'GNU C++20 (64)', 'PRACTICE', 78, 1048576, 10, now(), now()),
(200016, 15, 1902, '2024-09-30 09:00:00+00', 'WRONG_ANSWER', 'GNU C++20 (64)', 'PRACTICE', 46, 524288, 6, now(), now()),
(200017, 19, 1903, '2024-10-06 15:30:00+00', 'WRONG_ANSWER', 'GNU C++20 (64)', 'CONTESTANT', 15, 262144, 4, now(), now()),
(200018, 20, 1903, '2024-10-07 11:00:00+00', 'TIME_LIMIT_EXCEEDED', 'GNU C++20 (64)', 'PRACTICE', 3000, 8388608, 25, now(), now()),
-- Upsolved (practice OK after contest failure)
(200019, 3,  1900, '2024-09-17 14:00:00+00', 'OK', 'GNU C++20 (64)', 'PRACTICE', 46, 524288, 12, now(), now()),
(200020, 9,  1901, '2024-09-24 14:00:00+00', 'OK', 'GNU C++20 (64)', 'PRACTICE', 62, 1048576, 20, now(), now()),
(200021, 22, 1904, '2024-10-13 15:20:00+00', 'OK', 'GNU C++20 (64)', 'CONTESTANT', 31, 262144, 10, now(), now())
ON CONFLICT (cf_submission_id) DO NOTHING;

-- Link submissions to user
INSERT INTO user_submission (user_id, submission_id) VALUES
('a0000000-0000-0000-0000-000000000001', 200001),
('a0000000-0000-0000-0000-000000000001', 200002),
('a0000000-0000-0000-0000-000000000001', 200003),
('a0000000-0000-0000-0000-000000000001', 200004),
('a0000000-0000-0000-0000-000000000001', 200005),
('a0000000-0000-0000-0000-000000000001', 200006),
('a0000000-0000-0000-0000-000000000001', 200007),
('a0000000-0000-0000-0000-000000000001', 200008),
('a0000000-0000-0000-0000-000000000001', 200009),
('a0000000-0000-0000-0000-000000000001', 200010),
('a0000000-0000-0000-0000-000000000001', 200011),
('a0000000-0000-0000-0000-000000000001', 200012),
('a0000000-0000-0000-0000-000000000001', 200013),
('a0000000-0000-0000-0000-000000000001', 200014),
('a0000000-0000-0000-0000-000000000001', 200015),
('a0000000-0000-0000-0000-000000000001', 200016),
('a0000000-0000-0000-0000-000000000001', 200017),
('a0000000-0000-0000-0000-000000000001', 200018),
('a0000000-0000-0000-0000-000000000001', 200019),
('a0000000-0000-0000-0000-000000000001', 200020),
('a0000000-0000-0000-0000-000000000001', 200021)
ON CONFLICT (user_id, submission_id) DO NOTHING;

-- Queue items: mix of PENDING, ATTEMPTED, SOLVED
INSERT INTO queue_item (id, user_id, problem_id, status, priority, source, archived_at, created_at, updated_at, version) VALUES
-- Solved items (with review schedules)
('b0000001-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 3,  'SOLVED', 'MEDIUM', 'AUTO', NULL, '2024-09-17 14:00:00+00', '2024-09-17 14:00:00+00', 1),
('b0000001-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 9,  'SOLVED', 'HIGH',   'AUTO', NULL, '2024-09-24 14:00:00+00', '2024-09-24 14:00:00+00', 1),
('b0000001-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 10, 'SOLVED', 'MEDIUM', 'AUTO', NULL, '2024-09-23 13:00:00+00', '2024-09-23 13:00:00+00', 1),
-- Attempted (WA/TLE, not yet solved)
('b0000001-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 5,  'ATTEMPTED', 'HIGH',   'AUTO', NULL, '2024-09-17 10:00:00+00', '2024-09-17 10:00:00+00', 1),
('b0000001-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 11, 'ATTEMPTED', 'HIGH',   'AUTO', NULL, '2024-09-24 10:00:00+00', '2024-09-24 10:00:00+00', 1),
('b0000001-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 15, 'ATTEMPTED', 'MEDIUM', 'AUTO', NULL, '2024-09-30 09:00:00+00', '2024-09-30 09:00:00+00', 1),
('b0000001-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 20, 'ATTEMPTED', 'HIGH',   'AUTO', NULL, '2024-10-07 11:00:00+00', '2024-10-07 11:00:00+00', 1),
-- Pending (manually added for practice)
('b0000001-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 6,  'PENDING', 'MEDIUM', 'MANUAL', NULL, '2024-10-10 10:00:00+00', '2024-10-10 10:00:00+00', 0),
('b0000001-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 16, 'PENDING', 'LOW',    'MANUAL', NULL, '2024-10-10 10:05:00+00', '2024-10-10 10:05:00+00', 0),
('b0000001-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 25, 'PENDING', 'HIGH',   'MANUAL', NULL, '2024-10-10 10:10:00+00', '2024-10-10 10:10:00+00', 0),
-- Archived (solved + archived)
('b0000001-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 4,  'SOLVED', 'MEDIUM', 'AUTO', '2024-10-01 00:00:00+00', '2024-09-15 16:30:00+00', '2024-10-01 00:00:00+00', 2)
ON CONFLICT (user_id, problem_id) DO NOTHING;

-- Notes for some problems
INSERT INTO problem_note (queue_item_id, stuck_reason, key_observation, approach_complexity, what_to_remember, mistake_categories, version, updated_at) VALUES
('b0000001-0000-0000-0000-000000000001', 'Did not realize I could root the tree at any node', 'The tree structure means each node needs at most one swap', 'DFS traversal, O(n) time and space', 'Root choice doesn''t matter in trees when counting operations', ARRAY['MISSED_OBSERVATION'], 1, now()),
('b0000001-0000-0000-0000-000000000002', 'Greedy approach failed on edge cases', 'Need to consider the painting order from left to right', 'Greedy, O(n) time', 'Always verify greedy on small adversarial cases', ARRAY['EDGE_CASE', 'INCORRECT_PROOF'], 1, now()),
('b0000001-0000-0000-0000-000000000004', 'Binary search bounds were wrong', 'Need to binary search on the answer, not the input', 'Binary search + check, O(n log max_val)', 'Off-by-one errors in binary search bounds', ARRAY['IMPLEMENTATION_BUG', 'OVERFLOW'], 1, now()),
('b0000001-0000-0000-0000-000000000005', 'Missed that dp states can be compressed', 'Consider suffix DP instead of prefix', 'DP, O(n) with optimized states', 'Try both prefix and suffix DP approaches', ARRAY['MISSING_PREREQUISITE'], 1, now()),
('b0000001-0000-0000-0000-000000000007', 'TLE due to wrong complexity', 'Sort first, then greedy picks', 'Sort + greedy, O(n log n)', 'Always consider sorting as a preprocessing step', ARRAY['COMPLEXITY_ISSUE'], 1, now())
ON CONFLICT (queue_item_id) DO NOTHING;

-- Review schedules for solved items
INSERT INTO review_schedule (queue_item_id, interval_index, next_review_date, paused, version, updated_at) VALUES
('b0000001-0000-0000-0000-000000000001', 1, CURRENT_DATE - INTERVAL '2 days', false, 1, now()),   -- overdue
('b0000001-0000-0000-0000-000000000002', 0, CURRENT_DATE, false, 0, now()),                        -- due today
('b0000001-0000-0000-0000-000000000003', 2, CURRENT_DATE + INTERVAL '3 days', false, 2, now())     -- upcoming
ON CONFLICT (queue_item_id) DO NOTHING;

-- Review attempts
INSERT INTO review_attempt (id, queue_item_id, reviewed_at, outcome, notes_revealed, reflection, idempotency_key, created_at) VALUES
('c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', '2024-09-18 10:00:00+00', 'SOLVED_INDEPENDENTLY', false, 'Good recall, tree DP pattern is settling in', 'key-001', now()),
('c0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000003', '2024-09-24 10:00:00+00', 'NEEDED_HINT', true, 'Had to look at notes for the approach direction', 'key-002', now()),
('c0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000003', '2024-09-27 10:00:00+00', 'SOLVED_INDEPENDENTLY', false, NULL, 'key-003', now())
ON CONFLICT (queue_item_id, idempotency_key) DO NOTHING;

-- Queue events
INSERT INTO queue_event (queue_item_id, event_type, actor, payload, created_at) VALUES
('b0000001-0000-0000-0000-000000000001', 'ADDED', 'SYNC', '{"source":"auto-import"}', '2024-09-17 14:00:00+00'),
('b0000001-0000-0000-0000-000000000001', 'STATUS_CHANGED', 'SYNC', '{"from":"PENDING","to":"SOLVED"}', '2024-09-17 14:00:00+00'),
('b0000001-0000-0000-0000-000000000008', 'ADDED', 'USER', '{"source":"manual"}', '2024-10-10 10:00:00+00'),
('b0000001-0000-0000-0000-000000000010', 'ADDED', 'USER', '{"source":"manual"}', '2024-10-10 10:10:00+00');

-- Sync job history
INSERT INTO sync_job (id, user_id, state, total_submissions_fetched, new_submissions_imported, problems_added_to_queue, checkpoint_from, created_at, started_at, completed_at)
VALUES 
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'COMPLETED', 21, 21, 15, 0, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '59 minutes', NOW() - INTERVAL '58 minutes')
ON CONFLICT (id) DO NOTHING;
