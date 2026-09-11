CREATE TABLE review_schedule (
    queue_item_id   UUID PRIMARY KEY REFERENCES queue_item(id),
    interval_index  INT NOT NULL DEFAULT 0,
    next_review_date DATE,
    paused          BOOLEAN NOT NULL DEFAULT false,
    version         INT NOT NULL DEFAULT 0,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_review_due ON review_schedule(next_review_date) WHERE NOT paused;

CREATE TABLE review_attempt (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queue_item_id   UUID NOT NULL REFERENCES queue_item(id),
    reviewed_at     TIMESTAMPTZ NOT NULL,
    outcome         VARCHAR(30) NOT NULL,
    notes_revealed  BOOLEAN NOT NULL DEFAULT false,
    reflection      TEXT,
    idempotency_key VARCHAR(100) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(queue_item_id, idempotency_key)
);
