PRAGMA foreign_keys=ON;

-- Freeze 09: persistent dossiers, broad internal areas, canonical places, and
-- Development-level key points. Existing single issue_slug stays as a legacy
-- compatibility field while the application moves to many-to-many relations.

CREATE TABLE IF NOT EXISTS areas(
  slug TEXT PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 100,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS issues(
  slug TEXT PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_id TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  summary_id TEXT NOT NULL,
  category TEXT NOT NULL,
  status_en TEXT NOT NULL,
  status_id TEXT NOT NULL,
  origin TEXT NOT NULL DEFAULT 'seed',
  first_seen_at TEXT,
  last_seen_at TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  concepts_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_issues_active ON issues(active,updated_at DESC);

CREATE TABLE IF NOT EXISTS issue_areas(
  issue_slug TEXT NOT NULL REFERENCES issues(slug) ON DELETE CASCADE,
  area_slug TEXT NOT NULL REFERENCES areas(slug) ON DELETE CASCADE,
  PRIMARY KEY(issue_slug,area_slug)
);

CREATE TABLE IF NOT EXISTS development_issues(
  development_id INTEGER NOT NULL REFERENCES developments(id) ON DELETE CASCADE,
  issue_slug TEXT NOT NULL REFERENCES issues(slug) ON DELETE CASCADE,
  score REAL NOT NULL DEFAULT 0.5,
  relation TEXT NOT NULL DEFAULT 'related',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY(development_id,issue_slug)
);
CREATE INDEX IF NOT EXISTS idx_development_issues_issue ON development_issues(issue_slug,development_id);

CREATE TABLE IF NOT EXISTS places(
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'reported',
  parent_slug TEXT REFERENCES places(slug) ON DELETE SET NULL,
  latitude REAL,
  longitude REAL,
  external_code TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_places_parent ON places(parent_slug,kind,name);

CREATE TABLE IF NOT EXISTS place_aliases(
  alias_key TEXT PRIMARY KEY,
  place_slug TEXT NOT NULL REFERENCES places(slug) ON DELETE CASCADE,
  label TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_place_aliases_place ON place_aliases(place_slug);

CREATE TABLE IF NOT EXISTS development_places(
  development_id INTEGER NOT NULL REFERENCES developments(id) ON DELETE CASCADE,
  place_slug TEXT NOT NULL REFERENCES places(slug) ON DELETE CASCADE,
  score REAL NOT NULL DEFAULT 0.7,
  relation TEXT NOT NULL DEFAULT 'reported',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY(development_id,place_slug)
);
CREATE INDEX IF NOT EXISTS idx_development_places_place ON development_places(place_slug,development_id);

ALTER TABLE development_syntheses ADD COLUMN key_points_en_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE development_syntheses ADD COLUMN key_points_id_json TEXT NOT NULL DEFAULT '[]';

-- Broad internal areas. The public UI may simply call these categories/lenses.
INSERT OR IGNORE INTO areas(slug,title_en,title_id,sort_order) VALUES
('land-extraction','Land & extraction','Tanah & ekstraksi',10),
('human-rights-militarization','Human rights & militarization','Hak asasi & militerisasi',20),
('indigenous-rights-governance','Indigenous rights & governance','Hak masyarakat adat & tata kelola',30),
('environment-biodiversity','Environment & biodiversity','Lingkungan & keanekaragaman hayati',40),
('health-food-livelihoods','Health, food & livelihoods','Kesehatan, pangan & penghidupan',50),
('education-knowledge-culture','Education, knowledge & culture','Pendidikan, pengetahuan & budaya',60),
('women-gender','Women & gender','Perempuan & gender',70);

-- Seed the existing seven editorial dossiers into D1. These are living records,
-- not hard-coded routing logic after this migration.
INSERT OR IGNORE INTO issues(slug,title_en,title_id,summary_en,summary_id,category,status_en,status_id,origin,first_seen_at,last_seen_at,concepts_json,created_at,updated_at) VALUES
('mining-raja-ampat','Mining in Raja Ampat','Pertambangan di Raja Ampat','Mining permits, operating sites, marine and terrestrial ecosystems, customary land and public scrutiny across Raja Ampat.','Izin pertambangan, lokasi operasi, ekosistem laut dan darat, tanah adat, serta pengawasan publik di Raja Ampat.','Environment','Active review','Pemantauan aktif','seed','2026-08-25','2026-08-25','["extractivism","ecocide","customary-land","sasi"]','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('lake-sentani-watershed','Lake Sentani watershed','Daerah aliran Danau Sentani','Water quality, sedimentation, mining pressure, biodiversity and livelihoods around Lake Sentani and the Cycloop foothills.','Kualitas air, sedimentasi, tekanan pertambangan, keanekaragaman hayati, dan penghidupan di sekitar Danau Sentani serta kaki Pegunungan Cycloop.','Environment','Active concern','Perhatian aktif','seed','2026-08-27','2026-08-27','["extractivism","ecocide","customary-land"]','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('south-papua-food-energy-estate','South Papua food and energy estate','Proyek pangan dan energi Papua Selatan','Land, forests, livelihoods and large-scale food and energy projects being developed in and around Merauke.','Tanah, hutan, penghidupan, serta proyek pangan dan energi skala besar yang dikembangkan di Merauke dan sekitarnya.','Land','Long-running','Berlangsung lama','seed','2026-08-14','2026-08-14','["extractivism","gastrocolonialism","customary-land"]','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('conflict-displacement-access','Conflict, displacement and access','Konflik, pengungsian, dan akses','Civilian displacement, access to services and independent monitoring in conflict-affected areas.','Pengungsian warga sipil, akses terhadap layanan, dan pemantauan independen di wilayah terdampak konflik.','Human rights','Ongoing concern','Perhatian berkelanjutan','seed','2026-08-10','2026-08-10','["humanitarian-access","internal-displacement"]','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('political-status-representation','Political status and representation','Status politik dan keterwakilan','The historical political status of the territory, regional institutions, autonomy and Papuan representation.','Status politik historis wilayah, lembaga regional, otonomi, dan keterwakilan orang Papua.','Politics','Structural issue','Isu struktural','seed','2026-08-20','2026-08-20','["self-determination","special-autonomy"]','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('women-gender','Women & Gender','Perempuan & Gender','Indigenous women’s leadership, rights, land relationships, care, cultural transmission and gender-based violence.','Kepemimpinan perempuan adat, hak, hubungan dengan tanah, kerja perawatan, pewarisan budaya, dan kekerasan berbasis gender.','Women & Gender','Growing index','Indeks berkembang','seed','2026-08-14','2026-08-14','["femicide","customary-land"]','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('culture-memory-expression','Culture, memory and expression','Budaya, ingatan, dan ekspresi','Art, literature, film, music and collective practice as living records of Papuan experience and cultural life.','Seni, sastra, film, musik, dan praktik kolektif sebagai catatan hidup pengalaman serta kehidupan budaya Papua.','Culture','Programme active','Program aktif','seed','2026-08-28','2026-08-28','["collective-memory"]','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z');

INSERT OR IGNORE INTO issue_areas(issue_slug,area_slug) VALUES
('mining-raja-ampat','land-extraction'),('mining-raja-ampat','environment-biodiversity'),('mining-raja-ampat','indigenous-rights-governance'),
('lake-sentani-watershed','environment-biodiversity'),('lake-sentani-watershed','health-food-livelihoods'),
('south-papua-food-energy-estate','land-extraction'),('south-papua-food-energy-estate','environment-biodiversity'),('south-papua-food-energy-estate','indigenous-rights-governance'),('south-papua-food-energy-estate','health-food-livelihoods'),
('conflict-displacement-access','human-rights-militarization'),('conflict-displacement-access','health-food-livelihoods'),('conflict-displacement-access','education-knowledge-culture'),
('political-status-representation','indigenous-rights-governance'),('political-status-representation','human-rights-militarization'),
('women-gender','women-gender'),('women-gender','indigenous-rights-governance'),('women-gender','human-rights-militarization'),
('culture-memory-expression','education-knowledge-culture'),('culture-memory-expression','indigenous-rights-governance');

-- Backfill legacy primary Issue relations before runtime re-indexing enriches them.
INSERT OR IGNORE INTO development_issues(development_id,issue_slug,score,relation,created_at,updated_at)
SELECT d.id,d.issue_slug,1.0,'primary',COALESCE(d.first_seen_at,strftime('%Y-%m-%dT%H:%M:%fZ','now')),strftime('%Y-%m-%dT%H:%M:%fZ','now')
FROM developments d JOIN issues i ON i.slug=d.issue_slug
WHERE d.issue_slug IS NOT NULL;

-- Canonical geography seed. Geometry is intentionally deferred to Freeze 10;
-- these stable IDs already let Current/Issues/Resources/History speak one language.
INSERT OR IGNORE INTO places(slug,name,kind,created_at,updated_at) VALUES
('west-papua-region','West Papua','region','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('papua','Papua','province','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('papua-barat','Papua Barat','province','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('papua-barat-daya','Papua Barat Daya','province','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('papua-tengah','Papua Tengah','province','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('papua-pegunungan','Papua Pegunungan','province','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('papua-selatan','Papua Selatan','province','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('jayapura','Jayapura','city','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('sentani','Sentani','town','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('lake-sentani','Lake Sentani','lake','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('cycloop','Cycloop','mountain-range','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('raja-ampat','Raja Ampat','regency','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('sorong','Sorong','city','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('manokwari','Manokwari','city','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('nabire','Nabire','regency','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('merauke','Merauke','regency','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('mimika','Mimika','regency','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('timika','Timika','city','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('biak','Biak','island','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('yapen','Yapen','island','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('wamena','Wamena','city','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('jayawijaya','Jayawijaya','regency','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('nduga','Nduga','regency','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('intan-jaya','Intan Jaya','regency','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('puncak','Puncak','regency','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('yahukimo','Yahukimo','regency','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('paniai','Paniai','regency','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('deiyai','Deiyai','regency','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('dogiyai','Dogiyai','regency','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('fakfak','Fakfak','regency','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('kaimana','Kaimana','regency','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('tambrauw','Tambrauw','regency','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('maybrat','Maybrat','regency','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('asmat','Asmat','regency','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z'),
('boven-digoel','Boven Digoel','regency','2026-09-02T00:00:00Z','2026-09-02T00:00:00Z');

INSERT OR IGNORE INTO place_aliases(alias_key,place_slug,label) VALUES
('west papua','west-papua-region','West Papua'),('western new guinea','west-papua-region','Western New Guinea'),('tanah papua','west-papua-region','Tanah Papua'),
('papua province','papua','Papua Province'),('provinsi papua','papua','Provinsi Papua'),
('papua barat','papua-barat','Papua Barat'),('west papua province','papua-barat','West Papua Province'),
('papua barat daya','papua-barat-daya','Papua Barat Daya'),('southwest papua','papua-barat-daya','Southwest Papua'),
('papua tengah','papua-tengah','Papua Tengah'),('central papua','papua-tengah','Central Papua'),
('papua pegunungan','papua-pegunungan','Papua Pegunungan'),('highland papua','papua-pegunungan','Highland Papua'),
('papua selatan','papua-selatan','Papua Selatan'),('south papua','papua-selatan','South Papua'),
('jayapura','jayapura','Jayapura'),('sentani','sentani','Sentani'),('danau sentani','lake-sentani','Danau Sentani'),('lake sentani','lake-sentani','Lake Sentani'),
('cycloop','cycloop','Cycloop'),('pegunungan cycloop','cycloop','Pegunungan Cycloop'),
('raja ampat','raja-ampat','Raja Ampat'),('sorong','sorong','Sorong'),('manokwari','manokwari','Manokwari'),('nabire','nabire','Nabire'),
('merauke','merauke','Merauke'),('mimika','mimika','Mimika'),('timika','timika','Timika'),('biak','biak','Biak'),('yapen','yapen','Yapen'),
('wamena','wamena','Wamena'),('jayawijaya','jayawijaya','Jayawijaya'),('nduga','nduga','Nduga'),('intan jaya','intan-jaya','Intan Jaya'),
('puncak','puncak','Puncak'),('yahukimo','yahukimo','Yahukimo'),('paniai','paniai','Paniai'),('deiyai','deiyai','Deiyai'),('dogiyai','dogiyai','Dogiyai'),
('fakfak','fakfak','Fakfak'),('fak fak','fakfak','Fakfak'),('kaimana','kaimana','Kaimana'),('tambrauw','tambrauw','Tambrauw'),
('maybrat','maybrat','Maybrat'),('asmat','asmat','Asmat'),('boven digoel','boven-digoel','Boven Digoel');
