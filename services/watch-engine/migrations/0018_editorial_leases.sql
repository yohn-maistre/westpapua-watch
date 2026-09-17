ALTER TABLE developments ADD COLUMN editorial_started_at TEXT;
ALTER TABLE developments ADD COLUMN last_published_at TEXT;
-- Recover a historical publication timestamp from the synthesis, never from retries.
UPDATE developments SET last_published_at=(SELECT MAX(created_at) FROM development_syntheses WHERE development_id=developments.id) WHERE status='published';
CREATE INDEX IF NOT EXISTS idx_editorial_dispatch ON developments(editorial_dispatch_id,editorial_started_at);
