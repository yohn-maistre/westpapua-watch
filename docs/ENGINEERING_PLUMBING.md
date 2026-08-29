# West Papua Watch — Engineering Plumbing

**Status:** architecture direction, not frozen vendor selection  
**Date:** 2026-08-28

## Executive recommendation

Separate the project into two planes:

```text
PUBLIC READ PLANE
fast, cacheable, mostly static

EDITORIAL / INGESTION PLANE
dynamic, authenticated, model-assisted
```

The public website should keep working if the crawler, clustering pipeline, database write path, or LLM provider is temporarily unavailable.

That architecture is good for performance, reliability, cost, and resilience.

---

## 1. Core data model

Do not model the site as a collection of pages first.

Model the underlying information objects:

```text
Source
Article / Source Item
Development
Issue
Issue Snapshot
History Entry
Resource
Event
Exhibition Work
Entity / Place (optional structured metadata)
```

### Article / Source Item

One upstream item from a publisher or source.

Suggested fields:

```text
id
source_id
canonical_url
title
published_at
updated_at
language
summary_or_excerpt
content_hash
image_url
places[]
entities[]
embedding
fetch_status
provenance_metadata
```

Do not publicly republish full copyrighted articles by default. Public surfaces should favor metadata, short excerpts where appropriate, original synthesis, and links back to sources.

### Development

A persistent cluster representing one real-world event/change covered by one or more source items.

```text
id
canonical_title
summary
first_seen
last_updated
status
source_count
confidence
places[]
issue_ids[]
```

### Issue

A long-lived dossier.

```text
id
slug
title
current_summary
status
last_updated
places[]
related_issue_ids[]
```

### Issue Snapshot

Immutable version of an Issue at a point in time.

```text
issue_id
version
created_at
summary
material_changes[]
source_refs[]
model_version
editorial_status
```

This is important for provenance, rollback, and "what changed?" views.

---

## 2. Ingestion

Start with a curated source catalogue rather than attempting to crawl the whole web.

Potential inputs:

- RSS / Atom;
- publisher feeds;
- sitemaps;
- selected public APIs;
- manually submitted resources;
- campaign documents;
- public statements;
- datasets/maps;
- eventually targeted search for missing coverage.

Each source should carry metadata such as:

```text
name
publisher
homepage
feed_url(s)
language
country/region
source_type
enabled
poll_interval
notes
```

Keep editorial/source metadata explicit and human-editable.

---

## 3. Deduplication

Deduplication and clustering are different jobs.

### Deduplication asks

> Are these two records effectively the same article/item?

Use multiple cheap layers:

```text
canonical URL
→ normalized URL
→ title fingerprint
→ content hash
→ SimHash/MinHash for near duplicates
→ high-threshold embedding similarity when needed
```

This removes syndication copies and repeated ingests before the more expensive event-clustering pipeline.

---

## 4. Development clustering

### Do not use one-shot HDBSCAN as the whole solution

Recent 2026 production/research systems increasingly use multi-stage retrieval and graph clustering because semantic similarity alone often merges articles that discuss the same topic but different real-world events.

A strong target pipeline is:

```text
new article
    ↓
multilingual embedding
    ↓
ANN/KNN retrieval of recent candidate neighbors
    ↓
cheap multi-signal score
    ↓
strong same-event verification for borderline candidates
    ↓
attach to existing Development OR create pending Development
    ↓
periodic graph reconciliation
    ↓
Leiden community detection / merge-split review
```

### Candidate signals

Use some combination of:

- embedding cosine similarity;
- temporal proximity;
- shared named entities;
- shared places;
- title similarity;
- event/action terms;
- source independence;
- same-event cross-encoder score or constrained LLM verifier.

Entity overlap should be a supporting signal, not an absolute requirement.

### Why graph clustering

NewsCatcher's 2026 clustering architecture uses Qwen3 embeddings, builds a similarity graph, and applies Leiden community detection. A March 2026 news-grouping research implementation similarly combines semantic retrieval, a same-event cross-encoder, entity similarity, score fusion, and Leiden.

This is a better conceptual fit than assuming embedding geometry alone perfectly represents event identity.

---

## 5. Real-time assignment vs batch reconciliation

We need both.

### Online assignment

When a new article arrives:

1. embed it;
2. retrieve nearest recent developments/articles;
3. apply multi-signal match scoring;
4. attach confidently matched items immediately;
5. send uncertain items to pending state or a verifier.

This keeps `Now` fresh.

### Periodic reconciliation

Every N minutes/hours:

- rebuild a local similarity graph for the recent window;
- detect accidentally split developments;
- detect over-broad clusters;
- run Leiden or a similar community algorithm;
- produce merge/split suggestions;
- retain stable Development IDs wherever possible.

This prevents mistakes in a streaming classifier from becoming permanent structure.

---

## 6. Development summarization

Summarize at the **cluster** level after clustering, not article-by-article and then blindly concatenate.

The model should receive:

- representative source items;
- publication times;
- publisher names;
- extracted claims/facts;
- existing development summary if one exists.

Ask it for structured output:

```text
headline
short synthesis
what_changed
known_uncertainties
key_entities
places
source_refs
```

Every user-visible factual synthesis should remain traceable to the source items.

---

## 7. Issue matching

Issue matching is separate from development clustering.

One Development can relate to multiple Issues, and one Issue can accumulate many Developments over years.

Suggested pipeline:

```text
Development summary + entities + places
    ↓
retrieve candidate Issues
    ↓
classification / similarity
    ↓
auto-link high-confidence matches
    ↓
editor review for uncertain or new issues
```

Do not automatically create a new public Issue every time the model invents a slightly different label.

Issue taxonomy should remain human-governed.

---

## 8. Living dossier updates

This is one of the most important pieces.

Do not periodically ask a model:

> summarize everything about this issue again

Instead:

```text
current Issue snapshot
+
new Developments since snapshot
        ↓
delta extraction
        ↓
proposed material changes
        ↓
updated summary with source refs
        ↓
review / publish rule
        ↓
new immutable Issue Snapshot
```

The model's job is to identify **what is materially new**.

That reduces summary drift and makes the dossier auditable.

Possible future UI:

- What changed this week?
- What changed since July?
- View previous version.

---

## 9. Ranking `Now`

Clustering decides what belongs together.

Ranking decides what deserves attention.

Do not conflate them.

A practical ranking model can combine:

```text
recency
novel information
source diversity
cross-source corroboration
impact / affected scope
relationship to tracked Issues
editorial priority
confidence
persistence / velocity
```

Article count should be a signal, not the definition of importance.

Store ranking reasons internally so humans can inspect why something surfaced.

---

## 10. Search

Start simple.

### V1

PostgreSQL full-text search over:

- development titles/summaries;
- issue titles/summaries;
- history;
- resource metadata.

### Semantic layer

Use the same multilingual embedding family for semantic search where possible.

### Later

Add a dedicated search engine such as Meilisearch only if the corpus and filter requirements justify the operational cost.

---

## 11. Embedded Ask agent

The agent should be a query layer over the site's corpus.

### Public route

```text
POST /api/ask
```

### Default tool surface

```text
search_site(query)
open_page(id)
find_sources(topic)
find_events(query)
```

Later:

```text
get_issue_updates(issue_id, since)
compare_sources(development_id)
```

### Default epistemic boundary

Corpus-first.

The agent should not silently search the open web and mix uncurated material into an answer that looks like a site answer.

If open-web research is added later, make it an explicit mode.

### Answer contract

- concise answer;
- visible citations/source links;
- links to relevant Issue/History/Resource pages;
- clear uncertainty when the corpus does not support a claim.

Provider choice should remain abstracted behind one server-side adapter. Do not expose provider API keys in the browser.

---

## 12. External agent readability

Publish machine-friendly representations from the same content model.

Working targets:

```text
/llms.txt
/sitemap.xml
/feed.xml or feed.json

/issues/<slug>
/issues/<slug>.md

/history/<slug>
/history/<slug>.md

/resources/<id>
```

Also expose structured JSON where useful.

Long-term, the same retrieval layer could be exposed as an MCP server, but that is not necessary for launch.

---

## 13. Storage recommendation

### Source of truth

**PostgreSQL + pgvector** is the current default recommendation.

Reasons:

- relational links fit the product extremely well;
- vector retrieval is available without another database;
- issue snapshots and provenance are natural relational data;
- easy to migrate between hosted and self-hosted deployments;
- no need for a graph database yet.

### Object storage

Use S3-compatible object storage such as Cloudflare R2 or equivalent for:

- optimized images;
- campaign assets;
- PDFs/documents where distribution rights permit;
- generated static snapshots/exports;
- backups.

### Graph database

Not V1.

A graph can be computed in memory for clustering and stored as relational edges.

Revisit a graph database only if entity-level traversal later becomes a central public/research feature.

---

## 14. Frontend/publication architecture

Keep the public site mostly static/cacheable.

A useful pattern:

```text
Astro build
  ├── History
  ├── Issues
  ├── Resources
  ├── Events
  └── Exhibition

Now feed
  → pre-render last known snapshot
  → fetch small current feed JSON after load if newer
```

This gives us:

- useful HTML without JS;
- fast CDN delivery;
- a live-ish Now page without rebuilding every page every few minutes;
- a clean failure mode if the API is down.

Issue pages can rebuild when a new reviewed snapshot publishes.

---

## 15. Worker / automation plane

Keep crawling/model work away from the public request path.

A Python worker is a natural fit because the clustering/NLP ecosystem is strongest there.

Working jobs:

```text
fetch feeds                every 5–15 min depending on source
normalize + dedup          continuous / after fetch
embed                      after insert
online cluster assignment  after embedding
cluster reconciliation     15–60 min
summarize developments     after material cluster change
issue-match proposals      after development update
issue delta proposals      on meaningful new developments
publish feed snapshot      after approved/current changes
backup/export              daily
```

At launch these can be one worker process with a scheduler. Do not create a microservice fleet because a diagram looked lonely.

A queue can be added when there is real throughput pressure.

---

## 16. Editorial/admin surface

Keep admin separate from public UI.

Minimum operations:

- inspect fetch failures;
- inspect source item;
- merge/split developments;
- edit development headline/summary;
- attach/detach an Issue;
- approve/reject dossier update;
- edit source catalogue;
- mark bad source/image/extraction;
- view prompt/model version;
- rollback an Issue snapshot.

This is where a more conventional shadcn/Origin-style interface is completely appropriate. The public website does not need to inherit its visual language.

---

## 17. Observability and provenance

For model-assisted editorial work, log:

```text
pipeline run id
model/provider
prompt version
input source ids
output JSON
confidence / verifier result
human edits
publish timestamp
```

For clustering, retain enough signals to answer:

> Why were these two source items grouped together?

For ranking:

> Why did this development appear high in Now?

For dossiers:

> Which new developments caused this summary to change?

That audit trail is more valuable than pretending models are deterministic.

---

## 18. Reliability and defensive architecture

For a politically sensitive public-interest site, design for ordinary internet failure and hostile traffic without assuming who caused it.

### Public site

- CDN/static-first;
- strong cache headers;
- no database credentials in the browser;
- public read APIs rate-limited;
- Ask endpoint separately rate-limited;
- bot challenge only when necessary;
- static fallback content;
- regular external backups/exports.

### Admin / ingestion

- not exposed on the same public surface by default;
- strong authentication;
- least-privilege credentials;
- separate secrets;
- database backups;
- object-store versioning where available;
- health checks for source fetchers and model providers.

### Degraded states

If the model provider fails:

- existing site works;
- existing feed works;
- sources still ingest if possible;
- new items can remain pending.

If ingestion fails:

- public site remains at last published snapshot.

If Ask fails:

- search/navigation remains available.

This is the behavior we want.

---

## 19. Open-source backbones worth inspecting

### NewsPrism

Current 2026 self-hosted multilingual news analysis project.

Useful patterns:

- collect → dedup → event cluster → quality assessment → synthesis;
- real-world event grouping;
- embedding fallback;
- source tiers;
- cross-day storylines;
- editorial feedback/calibration;
- configurable no-fabrication style guidance;
- static report publishing.

Strong candidate as an **ingestion/editorial architecture donor**, not as the public frontend.

### MuckScraper

Current self-hosted story-first news aggregator.

Useful patterns:

- PostgreSQL + pgvector;
- multi-source story grouping;
- LLM assistance only for borderline grouping decisions;
- stable-story skipping;
- admin regrouping tools;
- source/scrape health tooling.

Again: inspect and port patterns rather than importing the whole worldview.

### March 2026 multi-signal news-grouping research repo

Useful algorithmic reference:

```text
NER/entity normalization
→ semantic KNN
→ same-event cross-encoder
→ entity similarity
→ score fusion
→ Leiden community detection
```

The important lesson is that semantic clustering alone is not enough for precise same-event grouping.

### Baidu QDET (KDD 2026)

Useful production-scale conceptual reference:

- streaming documents become event clusters;
- event clusters receive concise summaries;
- event objects become the unit for later timeline retrieval/summarization;
- event timeline generation is separate from raw document ingestion.

That separation maps well to Source Item → Development → Issue.

---

## 20. V1 versus later

### Launch / next week

Keep it achievable:

```text
Public site
- Now
- a handful of curated Issue dossiers
- History
- Events
- Exhibition
- Resources
- SOS Papua campaign page

Data
- curated source list
- RSS/feed ingestion
- basic exact/near dedup
- multilingual embeddings
- simple development assignment
- manual merge/split fallback
- source-backed cluster summaries
- manual Issue links

Agent
- site search
- Ask over curated corpus if stable enough
- citations
```

Do not block launch on perfect automated clustering.

### V1.1

- multi-signal same-event verifier;
- graph/Leiden reconciliation;
- issue delta proposals;
- issue snapshots/version diff;
- better ranking;
- admin quality dashboard;
- machine-readable Markdown twins.

### Later

- active search for missing source perspectives;
- structured statement/claim comparison;
- multilingual presentation;
- entity/place graph;
- map-centric exploration;
- MCP/API for external agents;
- notification/watch features;
- deeper historical linkage and research workflows.

---

## 21. Current engineering northstar

The whole system can be summarized as:

```text
CURATED SOURCES
      ↓
SOURCE ITEMS
      ↓
DEVELOPMENTS
      ↓
ISSUES
      ↓
ISSUE SNAPSHOTS

HISTORY + RESOURCES
      ↕
linked across every layer

PUBLIC WEB
mostly static/cacheable

ASK
query layer over the same corpus
```

The most important engineering rule is that every layer should preserve provenance and every public experience should survive failure of the layer above it.

---

## Research notes, August 2026

Recent references used for this direction include:

- NewsCatcher's 2026 switch to Qwen3 embeddings plus Leiden graph community detection for news clustering.
- A March 2026 open research pipeline combining multilingual embeddings, KNN retrieval, a same-event cross-encoder, entity similarity, and Leiden.
- Baidu's KDD 2026 QDET production timeline-summarization architecture.
- NewsPrism, an actively developed 2026 multilingual self-hosted news clustering project.
- MuckScraper, an actively developed 2026 self-hosted story-first news aggregator using PostgreSQL/pgvector and LLM-assisted borderline grouping.

These should be treated as references and donors, not product requirements.
