PRAGMA foreign_keys=ON;

ALTER TABLE publishers ADD COLUMN priority INTEGER NOT NULL DEFAULT 2;
ALTER TABLE publishers ADD COLUMN notes TEXT;

ALTER TABLE articles ADD COLUMN extraction_method TEXT;
ALTER TABLE articles ADD COLUMN content_hash TEXT;
ALTER TABLE articles ADD COLUMN syndicated_from_article_id INTEGER REFERENCES articles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_articles_content_hash ON articles(content_hash);
CREATE INDEX IF NOT EXISTS idx_articles_syndicated ON articles(syndicated_from_article_id);

CREATE TABLE IF NOT EXISTS story_packets(
  article_id INTEGER PRIMARY KEY REFERENCES articles(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  key_points_json TEXT NOT NULL DEFAULT '[]',
  what_changed TEXT,
  event_date TEXT,
  places_json TEXT NOT NULL DEFAULT '[]',
  people_json TEXT NOT NULL DEFAULT '[]',
  organizations_json TEXT NOT NULL DEFAULT '[]',
  topics_json TEXT NOT NULL DEFAULT '[]',
  issue_candidates_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS development_syntheses(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  development_id INTEGER NOT NULL REFERENCES developments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  what_changed TEXT,
  common_ground_json TEXT NOT NULL DEFAULT '[]',
  source_notes_json TEXT NOT NULL DEFAULT '[]',
  places_json TEXT NOT NULL DEFAULT '[]',
  topics_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_dev_syntheses ON development_syntheses(development_id,created_at DESC);

CREATE TABLE IF NOT EXISTS issue_delta_candidates(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  issue_slug TEXT NOT NULL,
  development_id INTEGER NOT NULL REFERENCES developments(id) ON DELETE CASCADE,
  delta_summary TEXT NOT NULL,
  significance TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'candidate',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_issue_delta_status ON issue_delta_candidates(status,created_at DESC);

ALTER TABLE resource_candidates ADD COLUMN description TEXT;
ALTER TABLE resource_candidates ADD COLUMN tags_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE resource_candidates ADD COLUMN updated_at TEXT;
