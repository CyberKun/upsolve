CREATE TABLE queue_event (
    id            BIGSERIAL PRIMARY KEY,
    queue_item_id UUID NOT NULL REFERENCES queue_item(id),
    event_type    VARCHAR(50) NOT NULL,
    actor         VARCHAR(20) NOT NULL DEFAULT 'USER',
    payload       JSONB,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_event_queue ON queue_event(queue_item_id, created_at);
