PRAGMA foreign_keys=ON;

-- Freeze 08.8: recover editorial jobs that hit the template GPT-4o/Llama route
-- before Git-managed Gemini Dynamic Route versions were deployed.
-- Raw articles, source provenance, images, packets and cluster membership remain intact.
UPDATE developments
SET status='candidate',
    retry_count=0,
    updated_at=datetime('now')
WHERE pipeline_version>=2
  AND status IN ('editorial_queued','retrying','held');
