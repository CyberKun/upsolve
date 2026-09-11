CREATE TABLE sync_job (
    id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                   UUID NOT NULL REFERENCES app_user(id),
    state                     VARCHAR(20) NOT NULL DEFAULT 'QUEUED',
    created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    started_at                TIMESTAMPTZ,
    completed_at              TIMESTAMPTZ,
    lease_expires_at          TIMESTAMPTZ,
    total_submissions_fetched INT DEFAULT 0,
    new_submissions_imported  INT DEFAULT 0,
    problems_added_to_queue   INT DEFAULT 0,
    checkpoint_from           INT,
    error_summary             TEXT
);
CREATE INDEX idx_sync_user ON sync_job(user_id, state);
