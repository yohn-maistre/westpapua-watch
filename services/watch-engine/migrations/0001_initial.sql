PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS publishers(
  id TEXT PRIMARY KEY,name TEXT NOT NULL,homepage TEXT NOT NULL,role TEXT NOT NULL,ownership TEXT NOT NULL,enabled INTEGER NOT NULL DEFAULT 1,updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS articles(
  id INTEGER PRIMARY KEY AUTOINCREMENT,publisher_id TEXT NOT NULL REFERENCES publishers(id),canonical_url TEXT NOT NULL UNIQUE,title TEXT NOT NULL,summary TEXT,body_excerpt TEXT,language TEXT,published_at TEXT,fetched_at TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'discovered'
);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_publisher ON articles(publisher_id,published_at DESC);
CREATE TABLE IF NOT EXISTS developments(
  id INTEGER PRIMARY KEY AUTOINCREMENT,issue_slug TEXT,title_en TEXT NOT NULL,title_pmy TEXT,summary_en TEXT,summary_pmy TEXT,status TEXT NOT NULL DEFAULT 'candidate',first_seen_at TEXT,updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_developments_status ON developments(status,updated_at DESC);
CREATE TABLE IF NOT EXISTS development_articles(
  development_id INTEGER NOT NULL REFERENCES developments(id) ON DELETE CASCADE,article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,membership_score REAL,membership_method TEXT,PRIMARY KEY(development_id,article_id)
);
CREATE TABLE IF NOT EXISTS image_candidates(
  id INTEGER PRIMARY KEY AUTOINCREMENT,article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,url TEXT NOT NULL,source_url TEXT NOT NULL,credit TEXT,caption TEXT,rights_status TEXT NOT NULL DEFAULT 'unverified_external',created_at TEXT NOT NULL, UNIQUE(article_id,url)
);
CREATE INDEX IF NOT EXISTS idx_images_article ON image_candidates(article_id);
CREATE TABLE IF NOT EXISTS resource_candidates(
  id INTEGER PRIMARY KEY AUTOINCREMENT,article_id INTEGER REFERENCES articles(id) ON DELETE SET NULL,title TEXT NOT NULL,source_url TEXT NOT NULL UNIQUE,publisher_id TEXT,kind TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'candidate',created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS issue_snapshots(
  id INTEGER PRIMARY KEY AUTOINCREMENT,issue_slug TEXT NOT NULL,captured_at TEXT NOT NULL,summary_en TEXT NOT NULL,summary_pmy TEXT,status TEXT,source_article_ids TEXT NOT NULL DEFAULT '[]',immutable_hash TEXT
);
