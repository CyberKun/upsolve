CREATE TABLE user_preferences (
    user_id           UUID PRIMARY KEY REFERENCES app_user(id),
    tracked_handle    VARCHAR(50),
    handle_normalized VARCHAR(50),
    time_zone         VARCHAR(100) NOT NULL DEFAULT 'UTC',
    target_rating_min INT NOT NULL DEFAULT 1400,
    target_rating_max INT NOT NULL DEFAULT 1800,
    preferred_topics  TEXT[] DEFAULT '{}',
    review_intervals  INT[] NOT NULL DEFAULT '{1,3,7,14,30}',
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_prefs_handle ON user_preferences(handle_normalized) WHERE handle_normalized IS NOT NULL;
