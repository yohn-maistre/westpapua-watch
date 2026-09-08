# Production polish handoff — 8 September 2026

Baseline: d8024293be9b370ba201e2f6c0a075e7d6dc09b7. User authorized publishing directly to main for device review.

## Included

- Preserve the oversized Swiss masthead/story typography. Home icon joins the navigation row; named Topics lead the directory, with broad categories available as filters/browse links. Existing URLs remain valid.
- Topic introductions remain distinct from the latest story. Card/source spacing, repeated eyebrows, resource chips and filter state are repaired. Home shows news before a compact selection of topics.
- A four-milestone MIFEE/food-estate timeline with individual citations and explicit scope. Shared timeline data/component supports more editorial milestones. History uses one continuous illustration stage across desktop/mobile and links into topic history. Exhibition remains a scaffold.
- Ask becomes a conversation: tab-session history, the latest six exchanges as bounded model context, page title context, published-source retrieval, citations scoped to each response, related-page search, stop, retry and new chat. No account or persistent server conversation database. No React runtime added; BoardUI and Base UI informed interaction choices. Existing Groq Qwen 3.8 route retained.
- New ingestion compares event evidence across candidate stories and resolves articles sequentially to avoid same-batch fragmentation. Shared region or actor no longer automatically proves a match. Provider failure throws for queue retry, without guessing a merge.
- Recent-cluster reconciliation adjudicates up to eight pairs per run and records decisions to avoid paying to repeat unchanged comparisons. Membership moves are transactional and retain topic/place relations. Merged story URLs redirect.
- Migration 0014 withdraws diagnostic synthesis headlines and preserves all original articles; creates the reconciliation review table. Publication rejects selected diagnostic prose patterns. This is a guard, not a proof of factual quality.
- API pagination forwarded correctly; publication dates compare actual instants; static fallbacks identify themselves; source links track the current story. Published news joins site search.
- Story Pages middleware emits readable HTML and story metadata without JS, with proper unavailable/not-found responses and locale links preserving the story ID. Image selection follows the existing configured rights policy.
- Map: calmer default layers, lazy layer registration, registration race protection, raster ordering, single region label anchors, panel stacking/focus, explicit empty layer state and place preservation, contextual reset, missing-coordinate rejection, reduced motion. Sources remain available when WebGL fails.
- Climate view exposes existing rainfall/fire layers. FIRMS failures differ from zero detections; thermal anomalies are not labelled confirmed wildfires. Upload time is distinguished from observation time. ENSO, daily imagery and coral heat-stress reference links are included.

## Verification

Local Astro build: 54 pages. Content validation passes. Pages Functions and Watch Engine bundle compilation pass. Focused runtime checks cover chat bounds/roles, explicit empty map state, pagination forwarding, real Workers HTMLRewriter output, canonical story ID and invalid-ID 404. All migrations and 53 static engine SQL statements prepared successfully against SQLite.

CI repeats build/content checks, the focused runtime checks, Pages Functions compilation and Engine bundling. The deployment workflow checks the public response regression suite before migrations/deploy. Lockfile makes npm ci reproducible.

The cloud browser could not create WebGL, and its connection to the local preview was blocked. Map rendering, mobile touch ergonomics and the revised visual stage therefore require device review. Geo label compilation relies on GDAL/python3-gdal in Actions; no synthetic geometry has been substituted.

## Review on phone

1. Home navigation, portrait and landscape; scroll into/out of compact header.
2. Topics → South Papua food/energy → Timeline. Check anchors clear the sticky header.
3. Resources: swipe category chips, combine language/search, clear filters.
4. Ask two related questions, follow a citation, close/reopen, navigate and reopen, stop a request, start fresh.
5. News Load more: no repeated IDs. Open a story and change language; ID must survive.
6. Map: Atlas/Satellite/Night; Climate; layer sheet; turn all layers off; share/reload URL; expand/close; reset; feature source links.
7. Check Actions deployment completes. Cached feed data can take a few minutes to expire; clustering changes require subsequent ingestion/reconciliation and are not an immediate rebuild of the whole corpus.

## Boundaries / next iteration

This revision is for public-device review, not a claim that the full production corpus was audited. No production model calls were made locally. Recent reconciliation is bounded and model-mediated; verify the Nawipa reports after a processing cycle. Historical topic associations are not comprehensively rebuilt. The old cluster repair path still splits flagged mixed groups; a richer regrouping evaluation remains future work.

The new matching strategy spends more adjudication calls per ambiguous batch; monitor quota/backlog telemetry. Rate limiting on Ask still has only the existing isolate-local brake; distributed Cloudflare rate limiting remains an operational follow-up. Session context is not verified evidence and source-text prompt injection cannot be eliminated by a prompt alone.

Not included: AR, live smoke transport overlay, a complete historical archive, Freeport's custom timeline, per-claim source alignment, synthesis version diffs/“since your visit”, or an automatic page-changing agent. These need additional content/data validation rather than guessed facts or placeholder interactions.

## Research directions

- BoardUI: https://github.com/BoardUI/boardui — history/composer/citation interaction inspiration, not copied component code.
- Base UI: https://base-ui.com/react/components/dialog — accessible dialog reference.
- FIRMS: https://www.earthdata.nasa.gov/data/tools/firms — satellite detections, not zero-latency fire confirmation.
- GIBS: https://nasa-gibs.github.io/gibs-api-docs/access-basics/ — public imagery services for a future date-controlled overlay.
- ENSO: https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml — basin-scale context, not a local hazard map.
- Coral heat stress: https://coralreefwatch.noaa.gov/product/5km/ — thermal stress, not observed bleaching.
- RADD: https://www.wur.nl/en/research/products-services/radd-forest-disturbance-alert — future forest disturbance layer.
- NASA smoke visualizations: https://svs.gsfc.nasa.gov/5624 — investigate the current forecast service and licence before integration. Do not reuse discontinued CAMS dataset endpoints.

## Hermes fallback

Use the ZIP's apply.sh from a clean repository at the stated baseline. It validates the base and patch before changing files. If main already contains this release, do not apply it again. The phone only needs git, bash and unzip: let Actions install/build. Review git diff, commit and push normally. Never force-push over concurrent work.

Rollback the code with git revert of the release commit. Migration 0014 preserves articles but changes selected publication statuses and adds a table; a code revert alone intentionally does not republish withdrawn diagnostic content. Re-review held stories before restoring publication.
