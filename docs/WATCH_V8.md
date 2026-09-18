# Watch v8 — navigation, Resources and fair news admission

18 September 2026. Incremental patch on deployed v7 (`8a90a510cb7327771cf16a1de8308fcfb677e99f`). Remote tracked blob hashes matched the local v7 baseline before editing.

## Reader-facing changes

- Mobile masthead keeps the large Watch identity, language switch and Ask, with a Menu button. The compact header has the same entry point. A native modal dialog presents all eight destinations in a two-column grid, highlights the current page, supports Escape, traps focus and returns focus to its opener. Desktop navigation remains visible.
- Resources now starts with four textured category disclosures: News & reporting, Community & advocacy, Research & archives, Arts & culture. All 39 sites remain available. Categories start closed; ordinary browsing opens one at a time. Search expands matching groups; clearing it restores the previous open state. Native disclosures still work without JavaScript. Entries use full-width phone rows and two columns on larger screens, with wrapping names, precise roles and Library counts.
- Library remains directly underneath. Existing filters, organization links and query-based navigation are preserved.
- Data no longer contains the unrelated generic directory. Its existing charts, province detail pages and contextual source links remain. The new download `/data/observations.json` contains only records with observations and their provenance.
- “Updated … ago” now uses `meta.engine_activity.completed_at`, the completion of a normal discovery/admission cycle. It does not claim that a new story was published. Article dates and `last_published_at` remain separate. Until the first completed cycle after migration, the badge has no invented timestamp. Cached API responses may lag by several minutes.

## Engine changes

A normal cycle still dispatches at most four jobs, spaced 180 seconds apart. Up to two slots go to unpublished developments with source publication dates within 48 hours. Other slots go to oldest eligible pending work. Unused fresh slots fall back to the backlog. Unknown dates and far-future dates do not earn fresh priority. Published excerpt upgrades remain eligible in the backlog lane. Cooldowns, lease recovery, rejection exclusions, atomic pacing, writer/critic contracts and provider alternation remain in force.

The returned editorial result adds `freshQueued` and `backlogQueued`. Migration `0020_engine_activity.sql` stores completed normal/backfill cycles separately. Activity is exposed in `/current`, operator review status and worker health. The completion timestamp means orchestration finished, not that asynchronous ingestion and editorial queues have drained. Discovery can fail while backlog work continues; `discoveryFailed` records that fact. A failed workflow does not advance the completed-cycle timestamp.

This resolves an admission bottleneck found in the code. It does not establish that production providers are healthy or that all missing reports have been discovered. Four jobs per hour is a ceiling on attempts, not four guaranteed publications. A backlog of 124 needs at least 31 full cycles if all four slots serve it; it can take longer with fresh work and model retries.

## Hermes deployment and catch-up

1. Apply this patch on v7; preserve unrelated later changes. Run the validation commands below.
2. Apply remote D1 migrations with the existing production configuration (`npm run watch:migrate`). Confirm 0020 is present before deploying the worker (`npm run watch:deploy`) and frontend through the normal deployment workflow.
3. Run the existing **Run Watch cycle** workflow with `run_cycle=false` to capture baseline operator telemetry. Record pending/dispatched counts, oldest pending, last ingestion, latest review and publication, and recent model errors.
4. Trigger **Backfill reporting** once with `days=7` for the current five-day gap. If deployment occurs later, choose the actual gap plus a modest overlap, at most 31 days. Save the returned workflow ID. Discovery is bounded to enabled feeds/sitemaps; it does not guarantee complete publisher archives. A backfill enqueues at most 480 unknown URLs and does not dispatch editorial jobs itself.
5. Allow ingestion to process those URLs, then trigger one normal cycle, or let cron run. Do not repeatedly trigger to hurry it: the pacing/cooldown rules deliberately limit model pressure. Capture the completed normal cycle's fresh/backlog lane counts and compare new source publication dates, not just changed synthesis timestamps.
6. Verify `/api/current` activity advances, eligible fresh reports publish, older pending work drains, leases release, and error rates stay bounded. If publication still stalls, return the workflow IDs, recent writer/critic failures, oldest pending and date range of newly ingested source articles. Do not lift rejection gates or reset every held record.

No production trigger or deployment was performed while preparing this patch. Hermes output is needed to certify live catch-up, not to apply the local changes.

## Validation

- `npm run build` — 328 pages plus data endpoint.
- `npm run check:content`, `npm run check:system`, `npm run check:polish`.
- `node scripts/tests/recovery.mjs` and `node scripts/tests/v7.mjs` — leases, publication transactions, rate pacing, excerpt protection and reviewed replacement.
- `node scripts/tests/v8.mjs` — fresh/backlog allocation, spare-slot fill, cooldown/rejection protection, future-date priority, cycle timestamp semantics, indicator export and bilingual rendered markup.
- Worker bundle, Pages Functions compilation, patch whitespace and clean apply check.

Model responses in tests are fixtures. Browser screenshot verification remains outstanding because this runtime has no Chromium binary. Check 320px, 390px, 768px and 1440px: menu opening/Escape/focus return, all eight links, Ask, both languages, category search/clear, long organization names, Library deep links, and unchanged Data/exhibition layout. No claim of visual browser certification is made.
