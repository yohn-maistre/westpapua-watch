-- Additive: keep legacy kind and resource IDs for existing consumers.
ALTER TABLE resource_candidates ADD COLUMN item_type TEXT;
ALTER TABLE resource_candidates ADD COLUMN format TEXT;
ALTER TABLE resource_candidates ADD COLUMN published_at TEXT;
ALTER TABLE resource_candidates ADD COLUMN evidence_roles_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE resource_candidates ADD COLUMN topics_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE resource_candidates ADD COLUMN places_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE resource_candidates ADD COLUMN inclusion_reason TEXT;
ALTER TABLE story_packets ADD COLUMN item_type TEXT;
ALTER TABLE story_packets ADD COLUMN evidence_roles_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE story_packets ADD COLUMN library_worthy INTEGER NOT NULL DEFAULT 0;
ALTER TABLE story_packets ADD COLUMN library_reason TEXT;
CREATE INDEX IF NOT EXISTS idx_resources_type ON resource_candidates(status,item_type,published_at);
CREATE TABLE IF NOT EXISTS resource_relations (
 resource_id INTEGER NOT NULL REFERENCES resource_candidates(id) ON DELETE CASCADE,
 target_kind TEXT NOT NULL CHECK(target_kind IN ('topic','place','story')),
 target_id TEXT NOT NULL,
 relation TEXT NOT NULL DEFAULT 'about',
 origin TEXT NOT NULL DEFAULT 'classifier',
 PRIMARY KEY(resource_id,target_kind,target_id)
);
CREATE INDEX IF NOT EXISTS idx_resource_relations_target ON resource_relations(target_kind,target_id,resource_id);
-- Only actual publication dates are backfilled; never created_at/updated_at.
UPDATE resource_candidates SET published_at=(SELECT published_at FROM articles WHERE articles.id=resource_candidates.article_id);
