# Watch restoration and visual refinement

22 September 2026. Incremental changes against `dfb07eb1045164eafa76a745c675b15b3b671c69` (current main inspected this session). The local upstream snapshot was verified identical using git diff after fetch completed.

## What changed

Shared styles are imported explicitly by BaseLayout. Removing the old banner had also removed polish-01/02/03, including the watercolour brand and the News hero's positioned image container. These foundations no longer depend on a banner component being rendered.

Home returns to Map → News → Following → Library. The redundant Following hero is removed. Homepage News loads independently from Following. Four coloured Following cards use circular texture. The sidebar remains, with the Exhibition star restored and reduced-motion handling.

The ticker shows one published update at a time over a persistent lilac watercolour wash. Three softly blurred colour fields move independently; palette changes interpolate over 2.4 seconds without restarting their motion. Headlines rotate every nine seconds, with previous/next/pause controls. Rotation pauses for hover, keyboard focus and hidden tabs. Reduced motion defaults to manual stepping with static backgrounds. Source dates stay visible. Missing service data falls back to a Following link; duplicate developments are removed from the rotation. Headlines get a short opacity/position entrance; the background transition continues across that change.

Data uses concise headings and direct maps. The numerical grid is replaced with:

- Separate attributed displacement/event figures; no summed estimate or misleading comparative axis.
- Forest-loss bars with a common scale, dates, geography and source notes.
- A ring showing remaining ice relative to the stated 1988 baseline; no invented time series.
- A dated thermal-detection figure, with scope/method in a disclosure.
- Existing Otsus budget/transfer comparisons.
- One provincial budget/expenditure chart, with expandable spending composition and profile links.
- HDI comparison with a labelled detail-scale toggle (40–85 versus 0–100), retaining exact values and the table.
- Restored MBG map, using the same deduplicated records as the table and headline count.

Upstream observation values, sources and history/archive work are retained. This pass reorganizes those records; it is not a new source-verification or data-refresh exercise. Methodology remains available beside each chart. Some inherited source descriptions remain English on the Indonesian page; this is not a complete translation pass.

## Plumbing and classification

Following-case relations are matched within individual member reports before being combined. A place in one unrelated article and a subject in another no longer jointly qualify a case. The read-time guard is restored on the case endpoint, using original member titles/summaries. The ticker endpoint now selects a small headline projection from up to 40 recent candidates per configured case, without loading every case history and image. Held stories are excluded. Existing source deduplication, queue fairness, writer/critic gates and dated publication semantics remain.

`FollowingCase` and `followingCaseBySlug` provide the new internal naming boundary. Historical dossier tables, IDs, API kinds and URLs remain compatible; this is not a destructive database rename. Case relations already persisted in production are not automatically rewritten by this patch. The read guard takes effect on the patched endpoints; Hermes can schedule the existing bounded knowledge reindex after reviewing examples. No production jobs or migrations were triggered here.

## Verification

Passed: Astro build (330 pages), content checks, system checks, polish checks, recovery tests, v7 publication tests, Worker bundle and Pages Functions compilation. New `scripts/tests/restoration.mjs` runs the actual client scripts against a DOM fixture to test independent News rendering, headline/palette stepping and pause/reduced-motion state. It also tests the Following SQL with SQLite, including a deliberately mixed false-match cluster and a held story.

The DOM checks are not browser screenshot certification. Chromium installation was attempted but returned corrupted/truncated archives. After applying, check 390px/1440px and reduced motion: wash blend/contrast, full headlines, News image bounds, watercolour lettering, sidebar focus/Escape, long province labels, budget disclosure, HDI scale labels, MBG points/table counts, map attribution and desktop exhibition. Check real `/api/current` and `/api/following` responses independently; do not trigger repeated editorial runs as a UI repair.

## Apply and deploy

From a clean checkout based on the SHA above:

```sh
git apply --check /absolute/path/to/changes.patch
git apply /absolute/path/to/changes.patch
npm run build
npm run check:content
npm run check:system
npm run check:polish
node scripts/tests/recovery.mjs
node scripts/tests/v7.mjs
node scripts/tests/restoration.mjs
```

No new dependencies or migrations. Deploy the Worker and Pages through the existing workflow. Preserve newer unrelated changes if the apply check finds conflicts. Do not reset the repository. No provider routing or publication bypass changes are included.
