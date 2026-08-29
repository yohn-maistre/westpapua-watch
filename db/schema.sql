CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE sources (
  id bigserial PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  homepage text,
  language text,
  tier text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE articles (
  id bigserial PRIMARY KEY,
  source_id bigint REFERENCES sources(id),
  canonical_url text UNIQUE NOT NULL,
  title text NOT NULL,
  summary text,
  body_text text,
  language text,
  published_at timestamptz,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  content_hash text,
  embedding vector(1024),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX articles_published_idx ON articles(published_at DESC);
CREATE INDEX articles_fts_idx ON articles USING gin(to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(summary,'') || ' ' || coalesce(body_text,'')));

CREATE TABLE issues (
  id bigserial PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title_en text NOT NULL,
  title_pmy text,
  summary_en text,
  summary_pmy text,
  status text,
  editorial_priority integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE developments (
  id bigserial PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  issue_id bigint REFERENCES issues(id),
  title_en text NOT NULL,
  title_pmy text,
  summary_en text,
  summary_pmy text,
  first_seen_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'draft',
  centroid vector(1024),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE development_articles (
  development_id bigint REFERENCES developments(id) ON DELETE CASCADE,
  article_id bigint REFERENCES articles(id) ON DELETE CASCADE,
  membership_score real,
  membership_method text,
  PRIMARY KEY (development_id, article_id)
);

CREATE TABLE issue_snapshots (
  id bigserial PRIMARY KEY,
  issue_id bigint NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  captured_at timestamptz NOT NULL DEFAULT now(),
  summary_en text NOT NULL,
  summary_pmy text,
  status text,
  source_article_ids bigint[] NOT NULL DEFAULT '{}',
  editor_note text,
  immutable_hash text
);

CREATE TABLE entities (
  id bigserial PRIMARY KEY,
  canonical_name text NOT NULL,
  entity_type text NOT NULL,
  aliases text[] NOT NULL DEFAULT '{}'
);
CREATE TABLE article_entities (
  article_id bigint REFERENCES articles(id) ON DELETE CASCADE,
  entity_id bigint REFERENCES entities(id) ON DELETE CASCADE,
  confidence real,
  PRIMARY KEY (article_id, entity_id)
);
