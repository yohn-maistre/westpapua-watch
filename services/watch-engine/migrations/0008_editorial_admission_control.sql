ALTER TABLE developments ADD COLUMN editorial_not_before TEXT;
ALTER TABLE developments ADD COLUMN provider_backoff_count INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_developments_editorial_admission ON developments(pipeline_version,status,editorial_not_before,updated_at);