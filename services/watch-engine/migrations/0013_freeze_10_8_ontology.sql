PRAGMA foreign_keys=ON;

-- Freeze 10.8: public Issues become stable umbrella lenses. The seven named
-- records introduced in Freeze 09 remain persistent Dossiers.

CREATE TABLE IF NOT EXISTS broad_issues(
  slug TEXT PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_id TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  summary_id TEXT NOT NULL,
  category TEXT NOT NULL,
  status_en TEXT NOT NULL DEFAULT 'Persistent issue',
  status_id TEXT NOT NULL DEFAULT 'Isu jangka panjang',
  sort_order INTEGER NOT NULL DEFAULT 100,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS dossiers(
  slug TEXT PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_id TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  summary_id TEXT NOT NULL,
  category TEXT NOT NULL,
  status_en TEXT NOT NULL,
  status_id TEXT NOT NULL,
  source_issue_slug TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dossier_issues(
  dossier_slug TEXT NOT NULL REFERENCES dossiers(slug) ON DELETE CASCADE,
  broad_issue_slug TEXT NOT NULL REFERENCES broad_issues(slug) ON DELETE CASCADE,
  PRIMARY KEY(dossier_slug,broad_issue_slug)
);
CREATE INDEX IF NOT EXISTS idx_dossier_issues_broad ON dossier_issues(broad_issue_slug,dossier_slug);

CREATE TABLE IF NOT EXISTS development_broad_issues(
  development_id INTEGER NOT NULL REFERENCES developments(id) ON DELETE CASCADE,
  broad_issue_slug TEXT NOT NULL REFERENCES broad_issues(slug) ON DELETE CASCADE,
  score REAL NOT NULL DEFAULT 0.7,
  relation TEXT NOT NULL DEFAULT 'topic',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY(development_id,broad_issue_slug)
);
CREATE INDEX IF NOT EXISTS idx_development_broad_issues_issue ON development_broad_issues(broad_issue_slug,development_id);

INSERT OR IGNORE INTO broad_issues(slug,title_en,title_id,summary_en,summary_id,category,status_en,status_id,sort_order) VALUES
('land-indigenous-rights','Land & Indigenous rights','Tanah & hak masyarakat adat','Customary land, tenure, consent, displacement and Indigenous control over territory.','Tanah adat, hak atas tanah, persetujuan, penggusuran, dan kendali masyarakat adat atas wilayah.','Land & Indigenous rights','Persistent issue','Isu jangka panjang',10),
('extraction-industrial-development','Extraction & industrial development','Ekstraksi & pembangunan industri','Mining, plantations, logging, large projects, permits and their social and ecological consequences.','Tambang, perkebunan, pembalakan, proyek besar, izin, dan dampak sosial-ekologinya.','Extraction & industrial development','Persistent issue','Isu jangka panjang',20),
('environment-biodiversity','Environment & biodiversity','Lingkungan & keanekaragaman hayati','Forests, watersheds, reefs, species, protected areas and ecological change across Western New Guinea.','Hutan, daerah aliran air, terumbu, spesies, kawasan lindung, dan perubahan ekologi di Papua bagian barat.','Environment & biodiversity','Persistent issue','Isu jangka panjang',30),
('climate-disasters','Climate & disasters','Iklim & bencana','Fire, drought, floods, rainfall extremes, landslides and climate-related risks.','Kebakaran, kekeringan, banjir, hujan ekstrem, longsor, dan risiko terkait iklim.','Climate & disasters','Persistent issue','Isu jangka panjang',40),
('human-rights-conflict-security','Human rights, conflict & security','Hak asasi, konflik & keamanan','Civilian protection, violence, militarization, displacement, detention and access for independent monitoring.','Perlindungan warga, kekerasan, militerisasi, pengungsian, penahanan, dan akses pemantauan independen.','Human rights, conflict & security','Persistent issue','Isu jangka panjang',50),
('politics-governance-representation','Politics, governance & representation','Politik, pemerintahan & keterwakilan','Political status, autonomy, institutions, elections, representation and public decision-making.','Status politik, otonomi, lembaga, pemilu, keterwakilan, dan pengambilan keputusan publik.','Politics, governance & representation','Persistent issue','Isu jangka panjang',60),
('economy-livelihoods','Economy & livelihoods','Ekonomi & mata pencaharian','Work, markets, fisheries, agriculture, local enterprise, resource revenue and household livelihoods.','Kerja, pasar, perikanan, pertanian, usaha lokal, pendapatan sumber daya, dan mata pencaharian rumah tangga.','Economy & livelihoods','Persistent issue','Isu jangka panjang',70),
('health-food-public-services','Health, food & public services','Kesehatan, pangan & layanan publik','Health care, nutrition, food systems, water, housing and access to essential public services.','Layanan kesehatan, gizi, sistem pangan, air, perumahan, dan akses layanan publik penting.','Health, food & public services','Persistent issue','Isu jangka panjang',80),
('education-language-culture','Education, language & culture','Pendidikan, bahasa & budaya','Schools, knowledge, Indigenous languages, cultural transmission, arts, memory and expression.','Sekolah, pengetahuan, bahasa adat, pewarisan budaya, seni, ingatan, dan ekspresi.','Education, language & culture','Persistent issue','Isu jangka panjang',90),
('women-gender-social-inclusion','Women, gender & social inclusion','Perempuan, gender & inklusi sosial','Women’s leadership, gender-based violence, care, disability, youth and unequal access to rights and services.','Kepemimpinan perempuan, kekerasan berbasis gender, perawatan, disabilitas, pemuda, dan ketimpangan akses hak dan layanan.','Women, gender & social inclusion','Persistent issue','Isu jangka panjang',100),
('infrastructure-connectivity','Infrastructure & connectivity','Infrastruktur & konektivitas','Roads, ports, aviation, communications, energy systems and unequal physical or digital access.','Jalan, pelabuhan, penerbangan, komunikasi, sistem energi, dan ketimpangan akses fisik atau digital.','Infrastructure & connectivity','Persistent issue','Isu jangka panjang',110);

INSERT OR IGNORE INTO dossiers(slug,title_en,title_id,summary_en,summary_id,category,status_en,status_id,source_issue_slug,active,created_at,updated_at)
SELECT slug,title_en,title_id,summary_en,summary_id,category,status_en,status_id,slug,active,created_at,updated_at FROM issues;

INSERT OR IGNORE INTO dossier_issues(dossier_slug,broad_issue_slug) VALUES
('mining-raja-ampat','land-indigenous-rights'),
('mining-raja-ampat','extraction-industrial-development'),
('mining-raja-ampat','environment-biodiversity'),
('lake-sentani-watershed','environment-biodiversity'),
('lake-sentani-watershed','climate-disasters'),
('lake-sentani-watershed','health-food-public-services'),
('south-papua-food-energy-estate','land-indigenous-rights'),
('south-papua-food-energy-estate','extraction-industrial-development'),
('south-papua-food-energy-estate','environment-biodiversity'),
('south-papua-food-energy-estate','climate-disasters'),
('south-papua-food-energy-estate','economy-livelihoods'),
('south-papua-food-energy-estate','health-food-public-services'),
('conflict-displacement-access','human-rights-conflict-security'),
('conflict-displacement-access','health-food-public-services'),
('political-status-representation','politics-governance-representation'),
('political-status-representation','human-rights-conflict-security'),
('women-gender','women-gender-social-inclusion'),
('women-gender','land-indigenous-rights'),
('women-gender','human-rights-conflict-security'),
('culture-memory-expression','education-language-culture'),
('culture-memory-expression','land-indigenous-rights');

-- Existing Dossier relations imply umbrella Issue relations. Runtime re-indexing
-- adds direct broad links for stories that do not belong to one of the seeded dossiers.
INSERT OR IGNORE INTO development_broad_issues(development_id,broad_issue_slug,score,relation,created_at,updated_at)
SELECT di.development_id, dmap.broad_issue_slug, MAX(di.score), 'dossier',
       COALESCE(MIN(di.created_at),strftime('%Y-%m-%dT%H:%M:%fZ','now')),
       COALESCE(MAX(di.updated_at),strftime('%Y-%m-%dT%H:%M:%fZ','now'))
FROM development_issues di
JOIN dossier_issues dmap ON dmap.dossier_slug=di.issue_slug
GROUP BY di.development_id,dmap.broad_issue_slug;

ALTER TABLE resource_candidates ADD COLUMN languages_json TEXT NOT NULL DEFAULT '[]';
