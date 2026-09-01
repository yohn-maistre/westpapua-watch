PRAGMA foreign_keys=ON;

-- Freeze 08.9: recover V2 editorial jobs that reached the writer but could not
-- complete the critic/finalize path before provider-neutral critic handling
-- and publish-before-vector-index were deployed.
-- Raw articles, packets, images, provenance, and cluster membership remain intact.
UPDATE developments
SET status='candidate',
    retry_count=0,
    updated_at=datetime('now')
WHERE pipeline_version>=2
  AND status IN ('editorial_queued','retrying','held');
