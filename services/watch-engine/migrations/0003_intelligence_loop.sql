PRAGMA foreign_keys=ON;
ALTER TABLE story_packets ADD COLUMN watch_relevance INTEGER;
ALTER TABLE story_packets ADD COLUMN watch_relevance_confidence REAL;
ALTER TABLE story_packets ADD COLUMN watch_relevance_reason TEXT;
ALTER TABLE story_packets ADD COLUMN watch_relevance_evidence_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE story_packets ADD COLUMN watch_desk TEXT;
ALTER TABLE developments ADD COLUMN title_id TEXT;
ALTER TABLE developments ADD COLUMN summary_id TEXT;
ALTER TABLE developments ADD COLUMN event_signature TEXT;
ALTER TABLE developments ADD COLUMN ranking_score REAL NOT NULL DEFAULT 0;
ALTER TABLE developments ADD COLUMN retry_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE developments ADD COLUMN last_growth_at TEXT;
ALTER TABLE developments ADD COLUMN merged_into_id INTEGER REFERENCES developments(id) ON DELETE SET NULL;
ALTER TABLE developments ADD COLUMN pipeline_version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE development_syntheses ADD COLUMN what_changed_id TEXT;
ALTER TABLE issue_delta_candidates ADD COLUMN delta_summary_id TEXT;
CREATE INDEX IF NOT EXISTS idx_developments_rank ON developments(status,ranking_score DESC,updated_at DESC);
CREATE TABLE IF NOT EXISTS critic_reviews(
  id INTEGER PRIMARY KEY AUTOINCREMENT,development_id INTEGER NOT NULL REFERENCES developments(id) ON DELETE CASCADE,verdict TEXT NOT NULL,unsupported_claims_json TEXT NOT NULL DEFAULT '[]',framing_problems_json TEXT NOT NULL DEFAULT '[]',cluster_problem INTEGER NOT NULL DEFAULT 0,relevance_problem INTEGER NOT NULL DEFAULT 0,note TEXT,attempt INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_critic_dev ON critic_reviews(development_id,created_at DESC);
CREATE TABLE IF NOT EXISTS emerging_issues(
  id INTEGER PRIMARY KEY AUTOINCREMENT,slug TEXT NOT NULL UNIQUE,title TEXT NOT NULL,title_id TEXT,summary TEXT,summary_id TEXT,domain_hint TEXT,status TEXT NOT NULL DEFAULT 'emerging',first_seen_at TEXT NOT NULL,last_seen_at TEXT NOT NULL,development_count INTEGER NOT NULL DEFAULT 0,source_count INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL,updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS emerging_issue_developments(
  emerging_issue_id INTEGER NOT NULL REFERENCES emerging_issues(id) ON DELETE CASCADE,development_id INTEGER NOT NULL REFERENCES developments(id) ON DELETE CASCADE,score REAL,PRIMARY KEY(emerging_issue_id,development_id)
);
CREATE INDEX IF NOT EXISTS idx_emerging_status ON emerging_issues(status,last_seen_at DESC);
