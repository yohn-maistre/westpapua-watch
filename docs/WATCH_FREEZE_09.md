# West Papua Watch — Freeze 09

**Base:** `86ab0036a91efe66ca8ed2942d7409d1f71b9dd9` (`add bounded provider failover`)
**Theme:** trust, population, and knowledge model
**Status:** implementation bundle; verify against production before merge/push

## Goals

Freeze 09 keeps the request-budgeted newsroom from Freeze 08.10/08.10.1 intact while fixing the first product-level failures visible after the engine went live:

- publisher scope is no longer treated as article relevance;
- ambiguous relevance is deferred rather than silently dropped or published when the fast model is unavailable;
- operational HTTP endpoints fail closed behind `WATCH_ADMIN_TOKEN`;
- a bounded 14-day (max 31-day) backfill can populate the durable ingestion backlog;
- the existing editorial batch produces bilingual key points at no additional provider-call count;
- Current distinguishes Reports inside the lead Development from other Developments;
- Issues become D1-backed seed dossiers with many-to-many Development relations;
- canonical Places become shared identifiers before Freeze 10 adds geometry/PMTiles;
- existing recent irrelevant Developments can be conservatively cleaned and existing Development knowledge can be re-indexed.

## Preserved invariants

Do not weaken these to make a test pass:

- five checkpoints per day: 06/09/12/15/18 WIT;
- maximum four Developments per editorial writer batch;
- one writer batch followed by one critic batch;
- model-node retries remain zero;
- no same-cycle LLM JSON repair;
- provider/model failures become durable state;
- stale editorial messages require a valid dispatch token;
- Vectorize is optional;
- D1 FTS remains the always-on retrieval layer.

## Relevance policy

Source configuration is a prior, not a verdict.

`prefilterArticle()` returns:

- `keep` for strong Western New Guinea evidence;
- `drop` only for strong foreign-only evidence with no Western/Papua signal;
- `ambiguous` for everything else.

Ambiguous material reaches the existing batched Qwen Story Packet extraction. The model prompt explicitly states that a Papua-focused publisher can publish unrelated national/Pacific/international news.

If structured extraction fails:

- deterministic Western matches continue;
- ambiguous items become `relevance_deferred`;
- normal checkpoints retry a bounded number of deferred items;
- they are never converted into relevance just because the publisher is Jubi/Aneta/Suara Papua.

## Backfill

Backfill uses the same ingestion path as live reporting.

Discovery attempts:

1. RSS/Atom, up to a larger bounded history;
2. `/sitemap.xml`;
3. bounded sitemap-index child traversal.

A backfill Workflow only queues ingestion. It does **not** dispatch the editorial backlog in the same Workflow instance. Normal newsroom checkpoints drain pending Developments in batches of four.

To protect the Groq fast-lane token budget, backfill ingestion is queued in four-article batches with a 60-second stagger. One trigger admits at most 120 previously unseen URLs after scanning up to 300 discovered candidates. Re-running later continues through still-unseen candidates because known URLs are removed before the enqueue cap is applied.

Production trigger after deploy:

```bash
npx --no-install wrangler workflows trigger westpapua-watch-news-cycle \
  '{"backfillDays":14,"reason":"freeze09-backfill"}' \
  --config services/watch-engine/wrangler.generated.jsonc
```

Maximum supported `backfillDays` is 31.

## Freeze 09 maintenance pass

After migration/deploy, run one conservative cleanup/re-index pass:

```bash
npx --no-install wrangler workflows trigger westpapua-watch-news-cycle \
  '{"maintenance":"freeze09","days":30,"limit":1000}' \
  --config services/watch-engine/wrangler.generated.jsonc
```

This:

- filters only recent Developments that lack Western New Guinea evidence and are either clearly foreign-only or composed entirely of high-confidence model-negative packets;
- backfills Issue and Place relations from existing Story Packets.

It does not delete source articles or provenance.

## D1 knowledge model

Migration `0011_freeze_09_trust_knowledge.sql` adds:

- `areas`
- `issues`
- `issue_areas`
- `development_issues`
- `places`
- `place_aliases`
- `development_places`
- bilingual Development key-point fields on `development_syntheses`

The existing `developments.issue_slug` remains temporarily as a compatibility field. New code treats `development_issues` as the durable relation model.

The seven existing static Issues are seeded into D1. Static TypeScript content remains a build-time fallback for the current static Astro routes until a later freeze changes route generation.

## Places

Freeze 09 establishes stable IDs, aliases, and Development relations only.

Geometry is deliberately deferred to Freeze 10, where the PMTiles pipeline becomes canonical. Unknown Story Packet place strings receive stable `reported` Place records so their relations are not discarded.

## Current and Development UX

`/current` now exposes `lead_reports`, the individual source Reports belonging to the lead Development.

Frontend behavior:

- `Latest reports` = Reports inside the hero Development;
- `More developments` = different Development IDs;
- metadata is shortened;
- Development pages render `At a glance` from the same editorial writer call;
- multi-source `Across sources` only appears when multiple original publishers exist;
- Issue and Place relationships appear as compact relations;
- Issue pages gain a real `← Issues` link.

## Emerging Issues

Emerging Issues remain an internal discovery layer. The public Issues index no longer automatically renders every machine-detected emerging candidate.

The `/emerging-issues` Worker endpoint is protected by the same admin token as review/maintenance operations.

## Operational endpoint security

The Worker now protects:

- `/run`
- `/backfill`
- `/review/critic`
- `/review/status`
- `/emerging-issues`
- `/maintenance/freeze09`
- candidate Resource reads

with:

```http
Authorization: Bearer <WATCH_ADMIN_TOKEN>
```

If `WATCH_ADMIN_TOKEN` is missing, these endpoints fail closed.

The deploy workflow syncs the GitHub Actions secret `WATCH_ADMIN_TOKEN` into the Worker using `wrangler secret put`.

## Deployment order

1. Add a strong random `WATCH_ADMIN_TOKEN` as a GitHub Actions **production secret**.
2. Apply this patch at the exact guarded base commit.
3. Run CI/build.
4. Push/merge and allow the Cloudflare deploy workflow to:
   - render config;
   - apply migration 0011;
   - deploy Worker;
   - sync AI Gateway token;
   - sync admin token;
   - deploy Pages.
5. Trigger the Freeze 09 maintenance Workflow.
6. Verify unrelated published Developments are hidden while relevant ones remain.
7. Trigger the 14-day backfill Workflow once.
8. Inspect ingestion/FTS/Development counts before manually forcing any editorial drain.
9. Let normal 3-hour checkpoints drain the backlog, or trigger a small normal run only when request budgets are known healthy.

## Production checks

Verify:

- an unrelated Jubi Pacific/world item no longer reaches Current;
- a clearly Papua-related Jubi article still gets through even if title wording varies;
- a deliberately ambiguous item becomes deferred when fast inference is unavailable;
- `/review/status` returns `401` without admin authorization;
- `/run` returns `401` without admin authorization;
- backfill does not immediately dispatch all pending editorial work;
- writer batch telemetry still shows one synthesis Gateway operation per batch;
- critic remains one fast Gateway operation per successful draft batch;
- `key_points_en_json` and `key_points_id_json` are populated for new published syntheses;
- `/current` returns `lead_reports` from the lead Development;
- `/issues` is D1-backed;
- `/issue/:slug` resolves Developments via `development_issues`;
- `/places` returns canonical Place records;
- no regressions occur when Vectorize enrichment is disabled.

## Deliberately deferred

Freeze 09 does not include:

- PMTiles or MapLibre;
- geographic coordinates for all Places;
- dynamic creation of arbitrary new static Issue routes;
- fully autonomous promotion of Emerging Issues;
- the homepage map reframe;
- History scrollytelling;
- Exhibition/Resources population pipeline.

Those remain in the canonical Freeze 10–14 roadmap.
