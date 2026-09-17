ALTER TABLE developments ADD COLUMN publication_kind TEXT NOT NULL DEFAULT 'reviewed';
ALTER TABLE developments ADD COLUMN excerpt_article_id INTEGER REFERENCES articles(id);
CREATE TABLE IF NOT EXISTS editorial_pacing(id INTEGER PRIMARY KEY CHECK(id=1),next_allowed_at TEXT NOT NULL);
INSERT OR IGNORE INTO editorial_pacing(id,next_allowed_at) VALUES(1,'1970-01-01T00:00:00.000Z');
