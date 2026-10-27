# Final polish and main release plan — 27 October 2026

Status: final direction accepted and implemented on the preview branch. The user has authorised verification, merge to main and production deployment. The initial static-strip/preamble proposals below were replaced by the accepted decisions recorded here. Do not introduce an additional generic permission step before the already-authorised release.

Baseline: `b63d71d`, `preview/investigative-explorer`. Preserve the map-first Home, image-led Issues overview, eleven case files, all twenty research threads, source provenance, History reading content/paths and existing URLs.

## Current evidence

Fresh Chromium captures at 1440, 1150 and 390px are saved in `/workspace/scratch/pre-main-audit-2026-10-27/`. This is a separate cloud browser, not control of the user's in-app tab. Product Design's context preflight found no saved plugin context; the repository and current user brief supply the direction. No new source research or content claims were added.

1. **History entry — needs hierarchy and legibility.** Desktop shows two films plus a New Guinea Council archive teaser. Mobile compresses all three into roughly equal tiny columns; descriptions disappear and metadata is very small. In this capture both external YouTube thumbnail requests completed without decoded images, leaving gradient title-cover fallbacks. This establishes a failure in the capture environment, not proof that every visitor's thumbnail requests fail.
2. **Updates — overexposed and weakly prioritised.** The identical following strip is mounted by BaseLayout above Home, News, History and case pages. After the API loaded, the lead was a 27 October Freeport event-hosting story. Code accepts any Freeport/Grasberg/PTFI mention as case relevance, then chooses the latest reviewed report. That is useful retrieval but insufficient editorial significance for the site's lead update. The fresh News screenshot was recaptured after its loading state resolved; the earlier loading screenshot was rejected.
3. **Investigation source cards — confirmed internal overflow.** At 1150px, the Merauke `Pemerintah Bentuk Satgas…` label measures about 157.7px inside a 145.2px card. At 1440px, two Freeport labels measure about 184.8px inside 176.7px cards. Overall document width still fits the page. Previous page-overflow and participant-label-collision checks therefore did not cover this defect. At 390px the sampled source labels fit but become tiny and lose most of their titles.

Strengths retained: shared navigation, source readers and complete case overviews; the main History paths and contextual media; the prominent Home Atlas and case invitations. These captures do not establish accessibility conformance, actual video playback quality or real-device performance. Those interactions remain release checks.

## History opening

- Keep just **Cogito — Inside the World's Most Hidden Conflict** and **Frontier War — Paradise Broadcasting** in the opening.
- Desktop: an editorial two-film spread, approximately 7/5 columns. Cogito leads; the second film has a clear supporting position. Preserve authentic poster proportions and use the right-hand title/byline area to balance the unequal widths, not padded empty panels.
- Phone: full-width Cogito, then a compact but readable Frontier War row. Do not squeeze both players into the existing three-column strip.
- Present full titles, creator, year and duration once. Use verified local poster images where feasible, meaningful source links and one clear play affordance. Mount the player only on request; no autoplay or two preloaded iframes.
- Remove the Council teaser only from this opening. Keep that media in its relevant 1961 narrative and archive gallery. The quiet Archive link remains.
- Omit the preamble. The user preferred the cleaner entrance after reviewing the proposed language; the two films and existing editorial reader carry the introduction.
- The sandbox blocks the official YouTube thumbnail host. Keep original thumbnails as progressive enhancement and deliberate, readable film-title covers as fallback; do not fabricate documentary imagery or bypass network policy. Keep original film links available without JavaScript.

## Discovery ticker — accepted direction

The user explicitly retained the colourful strip as part of Watch's identity. It now discovers content across the site rather than repeating the same followed-story summary everywhere: a developed case, the weekly review and three varied Library/archive/art/upcoming-event selections, plus one current reviewed news item when eligible. Content types have distinct labels; news selection excludes event-hosting/congratulations filler from this narrow surface while the full news feed remains available.

The discovery edition stays stable in browser storage for four hours, with repeat avoidance at renewal. Current news and the accepted weekly edition refresh from existing read-only APIs. Expired events and the case/book/story already being read are excluded. No visitor triggers an AI call. The top strip is not sticky; the compact navigation carries a thin gradient accent. Use slow transform-only colour movement, readable titles, explicit pause, focus/hover pause, touch exploration and a static reduced-motion/no-script alternative.

## Weekly synthesis — accepted direction

Case-specific analysis stays inside the case. Home previews the accepted weekly review instead of duplicating Merauke analysis. The scheduled review should connect supported patterns across distinct episodes and time, including Papuan agency, documented effects and relevant counterevidence. Historical context is useful where it explains a documented mechanism; a shared name alone does not establish causation. Forward-looking passages identify observable developments to watch rather than forecasts.

Strengthen the existing writer/critic workflow and per-thread source checks. Require two independent publisher families and distinct episodes or context records; reject exact repetition of the introduction or previous accepted edition. Bound original excerpts and pass cited evidence to the critic. Unsupported drafts remain held and the last accepted edition remains visible. Existing editions are not rewritten by this release. Keep the existing routes, model configuration, budgets, schedule and database schema unchanged. Mocked checks establish workflow behaviour, not the factual quality of a future generated edition.

## Investigation source-card fit

Fix the source-card component across every case and both languages, not only the examples captured.

- Use actual available text width rather than a character-count approximation. Wrap long/hyphenated words safely.
- Prefer a concise, accurate display label with publisher/year where it clarifies the record; keep the complete bibliographic title in the accessible name and evidence reader.
- Size the title area for its content, with deliberate line limits and an explicit continuation only where needed. Do not solve it by shrinking everything, squeezing glyphs or clipping text silently.
- Keep paper previews undistorted. Check label, preview, icon and neighbouring targets together.
- Give phone source cards a readable arrangement instead of scaling the desktop document row until its labels become illegible. Keep the complete participant overview and normal page scrolling.
- Add regression coverage that measures label bounds against each card's internal bounds. Include all eleven cases, EN/ID, 320/390/768/1150/1440 widths and enlarged text. Retain source selection, keyboard access, reload/Back and scroll release.

## Implementation and release sequence

1. Implement the accepted discovery ticker, two-film History entrance, weekly synthesis improvements and source-card component on the preview branch. Maintain an explicit small final-polish scope.
2. Review actual screenshots and interactions on Home, News, Issues, representative/all case networks, History, Library, Events and Exhibition. Check shared/sticky navigation, gaps, long labels, real wheel/touch scrolling, source/film dialogs, close/Back, local poster failures, no-JavaScript access and reduced motion. Protect the low-memory History work.
3. Run content/archive/investigation/system/polish/explorer checks, relevant function/engine compilation and the production build. Re-run the deployed browser matrix after behavioural/layout changes and the new card-boundary checks. Update PR title/body around the final change.
4. Review the complete diff to main, including migrations and production AI configuration. The main workflow deploys the Watch Engine and geographic assets as well as Pages: confirm the new retrieval corpus is bundled, existing model/budget/schedule settings remain intended, and any migrations are idempotent. No unrelated model/config changes are part of this polish.
5. Merge the already-authorised release to main, monitor the production deployment, and check the actual production domain, both languages, representative source/story URLs, APIs, weekly review availability and publishing-worker health. A successful build alone does not complete shipping. Record the deployed SHA and keep a clear rollback reference.
