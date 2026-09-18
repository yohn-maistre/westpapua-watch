-- A completed discovery/admission cycle is distinct from a publication.
CREATE TABLE IF NOT EXISTS engine_activity (
  kind TEXT PRIMARY KEY CHECK(kind IN ('normal','backfill')),
  completed_at TEXT NOT NULL,
  details_json TEXT NOT NULL DEFAULT '{}'
);
