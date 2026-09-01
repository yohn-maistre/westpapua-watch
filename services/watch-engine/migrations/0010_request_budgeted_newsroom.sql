PRAGMA foreign_keys=ON;

-- Durable editorial admission. Queue messages are only valid when their token
-- matches the currently authorized dispatch stored on the Development.
ALTER TABLE developments ADD COLUMN editorial_pending INTEGER NOT NULL DEFAULT 0;
ALTER TABLE developments ADD COLUMN editorial_dispatch_id TEXT;
ALTER TABLE developments ADD COLUMN editorial_dispatched_at TEXT;
CREATE INDEX IF NOT EXISTS idx_developments_editorial_pending ON developments(editorial_pending,status,editorial_not_before,updated_at);

-- Compact event fingerprints generated inside the existing Story Packet call.
ALTER TABLE story_packets ADD COLUMN event_key TEXT;
ALTER TABLE story_packets ADD COLUMN action TEXT;
ALTER TABLE story_packets ADD COLUMN object TEXT;

-- Anything left from the pre-token queue is work-to-do, not authorization-to-run.
UPDATE developments
SET editorial_pending=1,
    editorial_dispatch_id=NULL,
    editorial_dispatched_at=NULL,
    status=CASE WHEN status='editorial_queued' THEN 'held' ELSE status END,
    editorial_not_before=CASE WHEN status='editorial_queued' THEN strftime('%Y-%m-%dT%H:%M:%fZ','now') ELSE editorial_not_before END,
    updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')
WHERE pipeline_version>=2 AND status IN ('candidate','retrying','held','editorial_queued');

-- Always-on sparse retrieval. Vectorize becomes optional semantic enrichment.
CREATE VIRTUAL TABLE IF NOT EXISTS article_fts USING fts5(
  article_id UNINDEXED,
  title,
  summary,
  body,
  places,
  organizations,
  topics,
  tokenize='unicode61 remove_diacritics 2'
);

CREATE VIRTUAL TABLE IF NOT EXISTS development_fts USING fts5(
  development_id UNINDEXED,
  title,
  summary,
  event_key,
  places,
  organizations,
  topics,
  tokenize='unicode61 remove_diacritics 2'
);

INSERT INTO article_fts(article_id,title,summary,body,places,organizations,topics)
SELECT CAST(a.id AS TEXT),a.title,COALESCE(sp.summary,a.summary,''),COALESCE(a.body_excerpt,''),
       COALESCE(sp.places_json,''),COALESCE(sp.organizations_json,''),COALESCE(sp.topics_json,'')
FROM articles a LEFT JOIN story_packets sp ON sp.article_id=a.id;

INSERT INTO development_fts(development_id,title,summary,event_key,places,organizations,topics)
SELECT CAST(d.id AS TEXT),COALESCE(d.title_id,d.title_en,''),COALESCE(d.summary_id,d.summary_en,''),COALESCE(d.event_signature,''),
       COALESCE((SELECT ds.places_json FROM development_syntheses ds WHERE ds.development_id=d.id ORDER BY ds.created_at DESC LIMIT 1),''),
       '',
       COALESCE((SELECT ds.topics_json FROM development_syntheses ds WHERE ds.development_id=d.id ORDER BY ds.created_at DESC LIMIT 1),'')
FROM developments d WHERE d.status<>'merged';
