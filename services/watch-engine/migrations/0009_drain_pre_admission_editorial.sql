-- Pre-admission queue messages may still exist after the initial Gemini retry storm.
-- Hold their developments before the new dispatcher selects one controlled candidate.
UPDATE developments
SET status='held',
    editorial_not_before=strftime('%Y-%m-%dT%H:%M:%fZ','now','+5 minutes'),
    updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')
WHERE pipeline_version>=2 AND status='editorial_queued';
