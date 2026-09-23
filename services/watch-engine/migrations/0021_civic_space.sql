-- Add a distinct persistent civic-space case. The Awyu record and its links
-- remain intact, but it is no longer a featured Following case in the UI.
INSERT OR IGNORE INTO issues(slug,title_en,title_id,summary_en,summary_id,category,status_en,status_id,concepts_json,created_at,updated_at)
VALUES('papuan-civic-space','Civic space in Papua','Ruang sipil di Tanah Papua','The ability to report, organize, assemble and express Papuan perspectives in public.','Ruang untuk meliput, berorganisasi, berkumpul, dan menyampaikan pandangan orang Papua di hadapan publik.','Civic rights','Following','Dipantau','[]',datetime('now'),datetime('now'));

INSERT OR IGNORE INTO dossiers(slug,title_en,title_id,summary_en,summary_id,category,status_en,status_id,source_issue_slug,created_at,updated_at)
SELECT slug,title_en,title_id,summary_en,summary_id,category,status_en,status_id,slug,created_at,updated_at FROM issues WHERE slug='papuan-civic-space';

INSERT OR IGNORE INTO dossier_issues(dossier_slug,broad_issue_slug) VALUES('papuan-civic-space','human-rights-conflict-security');
INSERT OR IGNORE INTO dossier_issues(dossier_slug,broad_issue_slug) VALUES('papuan-civic-space','politics-governance-representation');

-- Existing reports remain as published; a subsequent normal editorial cycle
-- attaches only reports whose own text supports the new scope.
