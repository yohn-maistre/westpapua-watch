PRAGMA foreign_keys=ON;

-- Freeze 08.7 provider activation recovery.
-- Editorial jobs exhausted retries while direct Workers AI had no daily neurons.
-- Raw evidence, article membership, images and story packets are preserved.
UPDATE developments
SET status='candidate',
    retry_count=0,
    updated_at=datetime('now')
WHERE pipeline_version>=2
  AND status IN ('editorial_queued','retrying','held');
