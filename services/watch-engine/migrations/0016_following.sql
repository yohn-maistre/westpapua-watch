PRAGMA foreign_keys=ON;

-- Editorially selected Following records. Legacy URLs and data remain intact.

INSERT OR IGNORE INTO issues(slug,title_en,title_id,summary_en,summary_id,category,status_en,status_id,concepts_json,created_at,updated_at) VALUES('nduga-displacement','Nduga: conflict and displacement','Nduga: konflik dan pengungsian','Displacement since 2018, access to schools and healthcare, and the conditions for returning home.','Pengungsian sejak 2018, akses sekolah dan layanan kesehatan, serta kondisi untuk pulang.','Human rights','Following','Dipantau','["internal-displacement", "humanitarian-access"]','2026-09-10T00:00:00Z','2026-09-10T00:00:00Z');

INSERT OR IGNORE INTO dossiers(slug,title_en,title_id,summary_en,summary_id,category,status_en,status_id,source_issue_slug,created_at,updated_at) SELECT slug,title_en,title_id,summary_en,summary_id,category,status_en,status_id,slug,created_at,updated_at FROM issues WHERE slug='nduga-displacement';

INSERT OR IGNORE INTO dossier_issues VALUES('nduga-displacement','human-rights-conflict-security');

INSERT OR IGNORE INTO dossier_issues VALUES('nduga-displacement','health-food-public-services');

INSERT OR IGNORE INTO issues(slug,title_en,title_id,summary_en,summary_id,category,status_en,status_id,concepts_json,created_at,updated_at) VALUES('freeport-mimika','Freeport and Mimika','Freeport dan Mimika','Mining, river tailings, land and livelihoods from the highlands to the Mimika coast.','Pertambangan, tailing sungai, tanah dan penghidupan dari pegunungan hingga pesisir Mimika.','Extraction','Following','Dipantau','["extractivism", "customary-land"]','2026-09-10T00:00:00Z','2026-09-10T00:00:00Z');

INSERT OR IGNORE INTO dossiers(slug,title_en,title_id,summary_en,summary_id,category,status_en,status_id,source_issue_slug,created_at,updated_at) SELECT slug,title_en,title_id,summary_en,summary_id,category,status_en,status_id,slug,created_at,updated_at FROM issues WHERE slug='freeport-mimika';

INSERT OR IGNORE INTO dossier_issues VALUES('freeport-mimika','extraction-industrial-development');

INSERT OR IGNORE INTO dossier_issues VALUES('freeport-mimika','environment-biodiversity');

INSERT OR IGNORE INTO dossier_issues VALUES('freeport-mimika','land-indigenous-rights');

INSERT OR IGNORE INTO issues(slug,title_en,title_id,summary_en,summary_id,category,status_en,status_id,concepts_json,created_at,updated_at) VALUES('puncak-displacement','Displacement in Puncak','Pengungsian di Puncak','Access to shelter, services and home amid renewed displacement.','Akses tempat tinggal, layanan dan kampung halaman di tengah pengungsian.','Human rights','Following','Dipantau','["internal-displacement", "humanitarian-access"]','2026-09-10T00:00:00Z','2026-09-10T00:00:00Z');

INSERT OR IGNORE INTO dossiers(slug,title_en,title_id,summary_en,summary_id,category,status_en,status_id,source_issue_slug,created_at,updated_at) SELECT slug,title_en,title_id,summary_en,summary_id,category,status_en,status_id,slug,created_at,updated_at FROM issues WHERE slug='puncak-displacement';

INSERT OR IGNORE INTO dossier_issues VALUES('puncak-displacement','human-rights-conflict-security');

INSERT OR IGNORE INTO dossier_issues VALUES('puncak-displacement','health-food-public-services');

INSERT OR IGNORE INTO issues(slug,title_en,title_id,summary_en,summary_id,category,status_en,status_id,concepts_json,created_at,updated_at) VALUES('intan-jaya-displacement','Displacement in Intan Jaya','Pengungsian di Intan Jaya','Civilian displacement and access to assistance around Sugapa and surrounding districts.','Pengungsian warga dan akses bantuan di Sugapa serta distrik sekitarnya.','Human rights','Following','Dipantau','["internal-displacement", "humanitarian-access"]','2026-09-10T00:00:00Z','2026-09-10T00:00:00Z');

INSERT OR IGNORE INTO dossiers(slug,title_en,title_id,summary_en,summary_id,category,status_en,status_id,source_issue_slug,created_at,updated_at) SELECT slug,title_en,title_id,summary_en,summary_id,category,status_en,status_id,slug,created_at,updated_at FROM issues WHERE slug='intan-jaya-displacement';

INSERT OR IGNORE INTO dossier_issues VALUES('intan-jaya-displacement','human-rights-conflict-security');

INSERT OR IGNORE INTO dossier_issues VALUES('intan-jaya-displacement','health-food-public-services');

INSERT OR IGNORE INTO issues(slug,title_en,title_id,summary_en,summary_id,category,status_en,status_id,concepts_json,created_at,updated_at) VALUES('awyu-customary-forests','Awyu customary forests','Hutan adat Awyu','Forest permits, oil palm expansion and recognition of Awyu land rights in Boven Digoel.','Izin hutan, perluasan sawit dan pengakuan hak atas tanah Awyu di Boven Digoel.','Land','Following','Dipantau','["customary-land", "extractivism"]','2026-09-10T00:00:00Z','2026-09-10T00:00:00Z');

INSERT OR IGNORE INTO dossiers(slug,title_en,title_id,summary_en,summary_id,category,status_en,status_id,source_issue_slug,created_at,updated_at) SELECT slug,title_en,title_id,summary_en,summary_id,category,status_en,status_id,slug,created_at,updated_at FROM issues WHERE slug='awyu-customary-forests';

INSERT OR IGNORE INTO dossier_issues VALUES('awyu-customary-forests','land-indigenous-rights');

INSERT OR IGNORE INTO dossier_issues VALUES('awyu-customary-forests','environment-biodiversity');

INSERT OR IGNORE INTO development_issues(development_id,issue_slug,score,relation,created_at,updated_at) SELECT DISTINCT da.development_id,'nduga-displacement',0.8,'related',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now') FROM development_articles da JOIN articles a ON a.id=da.article_id LEFT JOIN story_packets sp ON sp.article_id=a.id WHERE lower(a.title || ' ' || COALESCE(sp.summary,a.summary,'')) LIKE '%nduga%' AND (lower(a.title || ' ' || COALESCE(sp.summary,a.summary,'')) LIKE '%pengungs%' OR lower(a.title || ' ' || COALESCE(sp.summary,a.summary,'')) LIKE '%displac%' OR lower(a.title || ' ' || COALESCE(sp.summary,a.summary,'')) LIKE '%mengungsi%');

INSERT OR IGNORE INTO development_issues(development_id,issue_slug,score,relation,created_at,updated_at) SELECT DISTINCT da.development_id,'puncak-displacement',0.8,'related',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now') FROM development_articles da JOIN articles a ON a.id=da.article_id LEFT JOIN story_packets sp ON sp.article_id=a.id WHERE lower(a.title || ' ' || COALESCE(sp.summary,a.summary,'')) LIKE '%puncak%' AND (lower(a.title || ' ' || COALESCE(sp.summary,a.summary,'')) LIKE '%pengungs%' OR lower(a.title || ' ' || COALESCE(sp.summary,a.summary,'')) LIKE '%displac%' OR lower(a.title || ' ' || COALESCE(sp.summary,a.summary,'')) LIKE '%mengungsi%') AND lower(a.title || ' ' || COALESCE(sp.summary,a.summary,'')) NOT LIKE '%puncak jaya%';

INSERT OR IGNORE INTO development_issues(development_id,issue_slug,score,relation,created_at,updated_at) SELECT DISTINCT da.development_id,'intan-jaya-displacement',0.8,'related',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now') FROM development_articles da JOIN articles a ON a.id=da.article_id LEFT JOIN story_packets sp ON sp.article_id=a.id WHERE lower(a.title || ' ' || COALESCE(sp.summary,a.summary,'')) LIKE '%intan jaya%' AND (lower(a.title || ' ' || COALESCE(sp.summary,a.summary,'')) LIKE '%pengungs%' OR lower(a.title || ' ' || COALESCE(sp.summary,a.summary,'')) LIKE '%displac%' OR lower(a.title || ' ' || COALESCE(sp.summary,a.summary,'')) LIKE '%mengungsi%');

INSERT OR IGNORE INTO development_issues(development_id,issue_slug,score,relation,created_at,updated_at) SELECT DISTINCT da.development_id,'freeport-mimika',0.8,'related',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now') FROM development_articles da JOIN articles a ON a.id=da.article_id LEFT JOIN story_packets sp ON sp.article_id=a.id WHERE (lower(a.title || ' ' || COALESCE(sp.summary,a.summary,'')) LIKE '%freeport%' OR lower(a.title || ' ' || COALESCE(sp.summary,a.summary,'')) LIKE '%grasberg%');

INSERT OR IGNORE INTO development_issues(development_id,issue_slug,score,relation,created_at,updated_at)
SELECT DISTINCT da.development_id,'awyu-customary-forests',0.8,'related',datetime('now'),datetime('now') FROM development_articles da JOIN articles a ON a.id=da.article_id LEFT JOIN story_packets sp ON sp.article_id=a.id
WHERE lower(a.title || ' ' || COALESCE(sp.summary,a.summary,'')) LIKE '%awyu%' AND (lower(a.title || ' ' || COALESCE(sp.summary,a.summary,'')) LIKE '%hutan%' OR lower(a.title || ' ' || COALESCE(sp.summary,a.summary,'')) LIKE '%forest%');
