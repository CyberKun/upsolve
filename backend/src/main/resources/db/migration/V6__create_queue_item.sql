CREATE TABLE queue_item (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES app_user(id),
    problem_id  BIGINT NOT NULL REFERENCES problem(id),
    status      VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    priority    VARCHAR(10) NOT NULL DEFAULT 'MEDIUM',
    source      VARCHAR(20) NOT NULL DEFAULT 'MANUAL',
    archived_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    version     INT NOT NULL DEFAULT 0,
    UNIQUE(user_id, problem_id)
);
CREATE INDEX idx_queue_user_status ON queue_item(user_id, status);
CREATE INDEX idx_queue_user_archived ON queue_item(user_id, archived_at);
