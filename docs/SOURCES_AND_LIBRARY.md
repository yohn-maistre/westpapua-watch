# Sources and Library

Watch uses one item contract across the Library, topic resources, History citations, map provenance and Ask. The public label is **Library / Pustaka**; `/resources/` stays stable.

## Decisions

| Concept | Meaning | This implementation |
| --- | --- | --- |
| Publisher | Who produced the material | Existing source registry and publisher records; proper names in API responses |
| Item type | What the material itself is | `reporting`, `analysis`, `statement`, `report`, `research`, `document`, `dataset`, `map`, `book`, `film`, `audio`, `archive`, `collection` |
| Evidence roles | What the material can establish | Multiple values: `reporting`, `primary_source`, `investigation`, `monitoring`, `research`, `testimony`, `analysis`, `reference` |
| Format | How it is delivered | Web, PDF, video or audio metadata; never used alone to infer intellectual type |
| Relationships | What it concerns | Topics, places and stories; curated relationships and classifier relationships are distinguishable |
| Surface | Where it appears | Library inclusion is curated or reviewed; Exhibition remains independently curated |

A statement establishes what its author said. Its existence does not independently corroborate the claim. Publisher ownership does not turn an article into a primary document or determine credibility. Evidence roles are descriptions, not confidence scores. A resource can perform multiple roles; claim-level evidence relationships would be a later refinement.

## Shared pool

- `shared/library.ts` owns normalization, legacy aliases, URL deduplication, filter groups and bounded Library retrieval.
- `src/data/library.ts` composes existing references with explicit metadata and existing topic/story relations. It does not copy reference text into each page.
- `content/library-metadata.json` holds reviewed item-type overrides and place/topic links.
- `src/components/resources/ResourceList.astro` renders the same rows on Library and topic pages.
- History citations and map record provenance resolve through the same pool.
- The API merges curated items with published live items, preserving curated metadata. Normalized URLs strip tracking parameters; translations and different editions are not guessed to be the same work.

URL identity is a practical first step, not a universal work identifier. Later, add an explicit `work_id` and edition/translation/alternate-format links when the corpus needs them. Do not use title similarity to silently combine editions.

The API currently loads at most 300 live records plus curated references with two database reads. Introduce proper indexed pagination/search before that limit becomes a real corpus constraint. Static references and D1 remain separate storage locations but share one contract; this patch is not a bulk migration into a new universal items table.

## Selective inclusion

`libraryPolicy` replaces the publisher-wide nomination boolean. `none` opts out; `selective` and `preferred` both require affirmative item-level classification and an inclusion reason. `preferred` does not bypass review and currently has no ranking effect.

The existing article-extraction call supplies item type, evidence roles, Library suitability and reason. No extra per-article model call is introduced. A news article **about** a report remains reporting; it is not the report itself. A routine update from a monitoring organisation is not automatically a Library entry.

New entries retain `candidate` status. Existing reviewed/published entries are not silently promoted or demoted by a refresh. Curated films do not automatically enter Exhibition. An editorial review UI is still a future task; this patch does not auto-publish the candidate backlog.

## Dates and geography

- `publishedAt` is the item's publication date, with year/month precision preserved where that is all we know.
- `updated_at` is processing metadata, never a replacement publication date.
- Observation/coverage periods belong to the dataset or event record. A July report about April–June is shown in the April–June map period.
- Unknown dates remain unknown. Place names are descriptive metadata, not inferred exact coordinates.

Migration `0015_library_contract.sql` adds explicit item type, format, publication date, evidence roles, topics, places, inclusion reason and `resource_relations`. Legacy `kind` stays in storage for compatibility. Only article publication dates are backfilled.

## Public filters

Reports; Research; Documents & statements; Data & maps; Books; Film & audio; Archives & collections; Articles & analysis. Topic, place and language are independent multi-select filters. Choices use OR within a filter and AND across filters. Format and publication year remain quiet row metadata.

Named topics and broad categories are both filterable. Topic pages query related resources directly. Live story links are derived from current article memberships, so a later merge or split does not leave stale classifier links. Ask retrieves from the same corpus and receives publication and evidence-role metadata, while remaining explicit that an index entry is not the full linked book, paper or film.

## Publisher scope

The 16 enabled ingestion configurations remain enabled. ACLED stays disabled pending a dedicated structured-data access path. Enabled configuration is not proof that a publisher's feed, extraction and backfill are currently healthy.

Keep the operational registry in `content/news-sources.json` authoritative for ingestion. The older `src/data/publishers.ts` catalogue already contains some richer provenance fields but is not a second operational registry. Further publisher decomposition should reconcile those records into one reviewed catalogue, rather than inventing ownership/origin/focus values in this patch.

## Story quality

The old gate accepted generated text containing “Papua,” including “not connected to Papua.” It now honours confident explicit rejections first and requires an affirmative classification with an excerpt present in the original article before acceptance. Failed or ungrounded extraction is deferred.

Scheduled cleanup repairs up to three affected developments per checkpoint, preserves source records, withdraws invalid summaries and rebuilds surviving relationships. A mixed story is queued for a new synthesis. An all-rejected story is filtered. More complex older false positives still require reprocessing/review.

Editorial context includes dates, item types, evidence roles and previous headlines. Headlines describe the bounded episode and remain stable when the scope stays accurate. “What changed” compares with the previous publication and stays empty on first publication/repetition. A disputed cluster is partitioned into episode groups, validated for complete and nonduplicated article membership. Invalid partitions and clusters exceeding the 24-report repair window are held. The oldest group's public URL is retained.

Prompt changes improve the decision process; they are not evidence that every production cluster is already fixed. Validate the next ingestion/editorial runs against actual source articles.
