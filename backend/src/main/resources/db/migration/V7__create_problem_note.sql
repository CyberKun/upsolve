CREATE TABLE problem_note (
    queue_item_id       UUID PRIMARY KEY REFERENCES queue_item(id),
    stuck_reason        TEXT,
    key_observation     TEXT,
    approach_complexity TEXT,
    what_to_remember    TEXT,
    mistake_categories  TEXT[] DEFAULT '{}',
    version             INT NOT NULL DEFAULT 0,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
