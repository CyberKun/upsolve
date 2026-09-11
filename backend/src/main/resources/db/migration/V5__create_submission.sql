CREATE TABLE submission (
    cf_submission_id      BIGINT PRIMARY KEY,
    problem_id            BIGINT NOT NULL REFERENCES problem(id),
    cf_contest_id         INT,
    submitted_at          TIMESTAMPTZ NOT NULL,
    verdict               VARCHAR(50),
    language              VARCHAR(100),
    participant_type      VARCHAR(30) NOT NULL,
    time_consumed_ms      INT,
    memory_consumed_bytes BIGINT,
    passed_test_count     INT,
    imported_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_submission_problem ON submission(problem_id);
CREATE INDEX idx_submission_time ON submission(submitted_at);

CREATE TABLE user_submission (
    user_id       UUID NOT NULL REFERENCES app_user(id),
    submission_id BIGINT NOT NULL REFERENCES submission(cf_submission_id),
    PRIMARY KEY (user_id, submission_id)
);
CREATE INDEX idx_user_sub_user ON user_submission(user_id);
