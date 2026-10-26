# Investigative experience preview — 26 October 2026

Branch: `preview/investigative-explorer`. Base: `4687268ecdda1c572c372ea966fdf419d4ea1784`. The user authorised implementation and branch preview, with the homepage combining an editorial spread and the prominent map. Main/production publication is outside this preview.

## Included

- Home pairs a prominent existing Atlas/Satellite/Night map with a selected case. Merauke, Mimika, Nduga and Raja Ampat selection updates the explanation, source, historical link and case URL. URL selection and Back work. A Natural Earth geographic first frame remains until usable geographic data is available, with accurate fallback attribution.
- Merauke has a source-backed interactive canvas with Connections, Timeline, Map and Records. It retains all 42 chronology entries; selected relationships reference those records. Entities and links are separately selectable, support keyboard activation, and open a dated explanation and source sheet. Diagram zoom/pan and a readable relationship list are provided. Mobile defaults to Timeline for readability; shared URLs retain their chosen view.
- The canvas moves the existing contextual Atlas DOM instance into the Map view and restores it when leaving, rather than creating another WebGL map. It does not move the camera for each record. API context is regional; no precise event/concession geometry is inferred from a chronology entry.
- Original short Pusaka excerpts retain their date locators and are separated from Watch's bilingual summaries. Source URLs remain available outside the sheet. Selected view, record, entity and source-sheet state survive shared URLs, reload and Back. New state uses `exploreView`, avoiding the existing Atlas/History `view` parameter.
- Home has a permanent Analysis entry: a deliberately authored, bilingual Merauke review of the existing 2010–September 2026 record. It is not presented as an automatically generated monthly edition. The existing weekly edition remains available; generic model date titles are derived from the actual edition's Papua-time window.
- History retains 75 substantive accounts, 61 sections and the archive, with seven earlier political accounts reassigned to Society/Culture so Political history opens in 1949. IDs, citation anchors and legacy-link behaviour remain. All five paths still work.
- History adds a compact introductory mosaic: Cogito, Paradise Broadcasting's *Frontier War*, and the 1961 Council election archive photograph. Players load only when selected and are removed on close. A source-led 1962/1969 comparison opens within the treaty account.
- Three credited contemporary films are indexed in Library, including *Paradise Bombed* under friendlyjordies. Merauke and Raja Ampat static summaries/reference IDs are repaired using their existing background sources. The old fallback records in `dossiers.ts` had been shadowed by first-match selection.
- `content/research/intake/cogito-2026.json` quarantines the extracted bibliography leads. Its 158 URL leads and 147 URL-free footnotes are not imported into the public Library. The existing candidates file is unsuitable as an unpublished queue because its usable URLs can become public.

## Source and editorial boundaries

This is the first connected preview, not a full implementation of every investigation in the vision. Relationship edges are an edited subset. A shared event can support more than one relationship; the number of relationships is not the number of independent sources. Disconnected groups do not receive invented connecting lines. Company visits, command assignments, legal decisions and community objections retain their specific meaning/date.

The longer-period case analysis reuses already edited sources. New monthly automation, large dataset integrations, graph/database ingestion, the full bibliography audit, reverse citations throughout the catalogue, Ask-generated views and public contributions are later work. No news pipeline, model route, production publication job or D1 schema is changed in this branch.

The public script was used as a research lead; its narration is not republished. Selected excerpts come from the independently consulted Pusaka chronology. New films use canonical viewing links and official thumbnail URLs; no proprietary film footage is mirrored. The cloud network blocks YouTube image requests, so film cards have clean typographic fallback covers. In-browser playback may also be restricted in the test environment; test player creation, consent/no-autoplay and teardown separately from successful streaming.

The full checkout shows CSP is configured in `astro.config.mjs`, a location the earlier partial-code planning read did not inspect. This preview adds only the `youtube-nocookie.com` frame origin, preserving the existing script restrictions.

## Maintenance

- `src/data/investigations.ts`: server-side adapter over the existing chronology/archive previews and the small edited relationship set. Type-only imports keep the full reader/library corpus out of the React canvas bundle.
- `InvestigationExplorer.tsx`: selection, URL history, diagram/timeline/record views, shared Atlas mounting and source sheet. Do not add hidden map instances or infer coordinates from place names.
- `HomeOverview.astro`: selected-case composition and the homepage map selection events.
- `CaseAnalysis.tsx`: authored review and source rows. Distinguish this editorial account from worker-generated editions.
- `HistoryOpeningMedia.astro`, `FilmGallery.tsx`, `HistoryComparison.tsx`: compact media, lazy player lifecycle and document comparison.
- `check:investigation`: evidence/endpoint membership, record retention, modern default, valid case/source links, film catalogue entries and bounded client imports. CI and preview deployment run it with the existing checks.
- New arrows use SVG. Instrument Sans does not reliably supply the diagonal arrow glyph in this environment; avoid introducing text-glyph boxes again.

The existing Pages preview workflow deploys the selected branch and does not deploy the Watch Engine. Its environment currently has no branch restriction/reviewer requirement, as observed read-only before preview. Keep engine, cron, queue and database writes out of preview experiments. Existing public reads can be used to test the frontend. Do not run the main deployment workflow to obtain a branch preview.

## Device review

Start on Home, change case, use Back, then open Merauke. Select a node/link and a timeline record; open/close its evidence, reload its URL, and use Back. Open the Map view twice and check it neither duplicates the Atlas nor forces fullscreen on return. Check the case analysis and weekly edition separately. In History, confirm 1949 opens first, older links reveal their new owning path, and media closes/stops cleanly. Compare the agreement and 1969 record. Test English/Indonesian, 320–390px, text zoom, reduced motion and no-JS reading.

## Verified locally before preview publication

- Production build: 358 routes. Content checks, 77-item archive validation, polish/system/explorer/investigation suites passed. Pages Functions and engine entry point compile; these checks do not deploy them.
- English and Indonesian at 1440px/390px: case selection and Back, authored analysis, explorer defaults, all 42 records, node evidence, source-sheet reload/Back, one deferred shared Atlas, legacy History paths, document comparison, lazy player creation/no autoplay/teardown. No browser exceptions or page overflow in this matrix. No-JS Merauke retains all 42 sourced records.
- Indonesian at 320px, 125% root text size and 6× emulated CPU slowdown: Home, Merauke and History passed reflow and interaction checks. This is browser emulation, not a Samsung A12 hardware benchmark. The narrow pass fixed Analysis/section heading wrapping and explorer tab overflow.
- Directly reaching the original Places map also activates its deferred Atlas as it approaches view. Selecting canvas records does not repeatedly update a camera.
- Successful YouTube streaming was not verified inside the cloud's restricted network. Player lifecycle and clean blocked-image fallbacks were verified.
