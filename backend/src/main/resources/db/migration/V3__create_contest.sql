CREATE TABLE contest (
    cf_contest_id  INT PRIMARY KEY,
    name           VARCHAR(500),
    start_time     TIMESTAMPTZ,
    duration_secs  INT,
    phase          VARCHAR(50),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
