CREATE TABLE IF NOT EXISTS analysis_jobs (
 week_id TEXT PRIMARY KEY, status TEXT NOT NULL CHECK(status IN ('running','held','published')),
 attempts INTEGER NOT NULL DEFAULT 1, lease_until TEXT NOT NULL, error TEXT, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS weekly_editions (
 id TEXT PRIMARY KEY, from_at TEXT NOT NULL, to_at TEXT NOT NULL,
 payload_json TEXT NOT NULL, published_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS weekly_candidates (
 id INTEGER PRIMARY KEY AUTOINCREMENT, week_id TEXT NOT NULL,
 payload_json TEXT, verdict_json TEXT, errors_json TEXT NOT NULL DEFAULT '[]', created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS following_snapshots (
 id TEXT PRIMARY KEY, slug TEXT NOT NULL, edition_id TEXT NOT NULL REFERENCES weekly_editions(id),
 payload_json TEXT NOT NULL, as_of TEXT NOT NULL, published_at TEXT NOT NULL,
 UNIQUE(slug,edition_id)
);
CREATE INDEX IF NOT EXISTS idx_following_snapshot ON following_snapshots(slug,as_of DESC);
