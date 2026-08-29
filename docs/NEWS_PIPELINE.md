# News aggregation and issue-dossier pipeline

The launch build keeps `Now` in static data so the public site is reliable next week. The ingestion pipeline is deliberately separate and can begin feeding reviewed snapshots afterward.

## Core objects

- **Article**: one publisher's item.
- **Development**: multiple sources describing the same real-world event/change.
- **Issue**: persistent dossier that can last years.
- **Issue snapshot**: immutable summary/status captured at a point in time.
- **Resource**: report, official document, journalism, map, research, film or cultural reference.

`Now → Development → Issue → History → Resources`

## Recommended pipeline

```text
RSS / feeds / APIs / manual URLs
        ↓
normalize URLs + metadata
        ↓
exact + near duplicate detection
        ↓
multilingual embedding
        ↓
ANN/KNN candidate retrieval in a recent window
        ↓
same-event verifier + entity/place/time signals
        ↓
weighted similarity graph
        ↓
Leiden community reconciliation
        ↓
DEVELOPMENTS
        ↓
issue matching + editorial review
        ↓
delta update to persistent issue dossier
        ↓
immutable issue snapshot
        ↓
static publish/export for Astro
```

## Why not embedding + HDBSCAN alone?

Recent 2026 work and production systems increasingly separate topical similarity from actual event identity. A semantic-only cluster can merge two different events about the same organization/place. Candidate retrieval followed by a stronger same-event classifier and graph reconciliation is a better fit.

Useful architecture donors reviewed for this project:

- NewsPrism: multilingual collection, cross-source event grouping, source/editorial configuration, static publishing, storyline continuity.
- JuaniLlaberia/news_articles_grouping_research (March 2026): KNN → cross-encoder → entity overlap → weighted graph → Leiden; explicitly documents semantic-only HDBSCAN failure modes.
- NewsCatcher's current clustering design: Qwen embeddings + similarity graph + Leiden.
- GDELT Pulse: incremental ingest, pgvector + PostgreSQL full-text hybrid search, entity-aware clustering and API separation.
- Baidu QDET research: persistent event representations and timeline reasoning over event clusters rather than repeatedly processing all raw documents.

These are references, not dependencies to blindly copy.

## Storage

Start with PostgreSQL + pgvector. A graph database is not required merely because clustering uses a graph. See `db/schema.sql`.

Use PostgreSQL for:

- article/source provenance;
- embeddings and ANN retrieval;
- development membership;
- issue/development relations;
- issue snapshots;
- editorial state;
- keyword/FTS search.

Add a dedicated graph store only when actual product queries require rich entity traversal that is painful in PostgreSQL.

## Ranking is separate from clustering

Clustering answers **which reports describe the same development?**

Editorial ranking answers **which developments should Watch surface?**

Do not rank solely by number of articles/social attention. Candidate ranking can consider recency, source diversity, novelty/delta, geographic scope, corroboration, severity/public consequence and explicit editorial weighting. Preserve human override and provenance.

## Suggested source tiers

Initial sources already represented in `src/data/sources.ts` include:

- Jubi / West Papua Daily
- Suara Papua
- PUSAKA Bentala Rakyat
- Human Rights Monitor
- Mongabay Indonesia
- relevant official Indonesian records
- United Nations Treaty Collection / Digital Library
- established research publications
- current Read My World programme pages

A source tier is an editorial configuration, not a universal truth score. Store publisher identity, article byline, date, URL, language and content checksum separately from assessments.

## Review gates

Automated stages can propose:

- deduplication;
- event membership;
- issue association;
- entity/place extraction;
- a draft neutral development title/summary;
- dossier delta candidates.

Human review should remain available for:

- homepage prominence;
- sensitive allegations;
- changes to persistent issue status;
- historical narrative;
- corrections/retractions;
- newly added source organizations.
