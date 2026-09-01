PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS engine_attempts(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  development_id INTEGER NOT NULL REFERENCES developments(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  outcome TEXT NOT NULL,
  model TEXT,
  error TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_engine_attempts_dev ON engine_attempts(development_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_engine_attempts_outcome ON engine_attempts(outcome,created_at DESC);

-- Freeze 08.6 recovery: retry V2 editorial items from a clean logical attempt count.
UPDATE developments
SET status='candidate',retry_count=0,updated_at=datetime('now')
WHERE pipeline_version>=2
  AND status IN ('editorial_queued','retrying','held');
