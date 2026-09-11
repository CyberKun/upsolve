CREATE TABLE problem (
    id                  BIGSERIAL PRIMARY KEY,
    cf_contest_id       INT,
    problem_index       VARCHAR(10) NOT NULL,
    name                VARCHAR(500) NOT NULL,
    rating              INT,
    tags                TEXT[] DEFAULT '{}',
    problem_type        VARCHAR(20) DEFAULT 'PROGRAMMING',
    metadata_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(cf_contest_id, problem_index)
);
CREATE INDEX idx_problem_rating ON problem(rating);
CREATE INDEX idx_problem_tags ON problem USING GIN(tags);
