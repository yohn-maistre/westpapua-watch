# Investigative experience revision — 27 October 2026

This records the implementation on `preview/investigative-explorer`, following the user's review of the first immersive desk. It supersedes the public-page hierarchy in the original desk proposal. Main remains unchanged; the preview must be reviewed before a production merge.

## Public hierarchy

- **Home:** ordinary shared masthead/navigation and ticker; prominent full-width monitoring Atlas first, followed by a selected editorial case and two dated evidence previews. The Atlas remains independent of an editorial story. The four lower case invitations differ from the Atlas's case choices.
- **Issues:** shared shell, search, nine photographic/document-led followed cases, two cross-case investigations, the broad topic directory, and the twenty-thread research index. The landing page is an editorial browsing page, rather than a mandatory application shell.
- **Individual case:** credited opening, visible horizontal case index, complete source-backed network, selected evidence reader, compact/full chronology, document shelf, context, linked reporting, one deferred contextual map, library and related cases. The same canonical case routes serve discovery, search and sharing.
- **History:** its established five-path reading experience is preserved. Changes to the reusable archive dialog only reduce unrelated metadata in topic timelines.

There are eleven case files, sixty-nine supported relationships and fifty-two distinct source URLs in this revision. Nine are followed topics; political access and military business are cross-case threads. The twenty research threads are preserved as a programme, not represented as twenty completed investigations. Merauke retains all forty-two chronology entries. Kiwirok gains a canonical followed-case route and a source-attributed dated baseline.

## Interaction and evidence

The network uses a deterministic native SVG layout, not a perpetual force simulation. All participants remain available at narrow desktop and phone widths. Portrait phones reflow the overview to three columns; selecting a participant, relationship or source opens the evidence reader. Expanded pan/zoom is an explicit dialog. Ordinary touch gestures on the inline graph keep scrolling the page.

Search includes participants, claims, cases and source documents. URLs preserve entity/claim/evidence state; reload and Back restore the selected source. The document shelf shows its first entries without a tab; the chronology exposes representative entries and expands in place. No-JavaScript readers retain the case text, records, original source links and the full Merauke chronology.

Source paper thumbnails are rendered first pages of the original public documents, or exact-source existing covers. There are no invented source facsimiles. Images are local, credited and linked. Financial evidence preserves year, transaction stage, amount basis and material responses; an appointment, meeting or related company is not proof of a donation or incident responsibility.

## Following freshness

`shared/following-state.ts` chooses the newer valid curated state or accepted stored synthesis. Newer reviewed reporting is an independently dated ticker update; it does not replace the accepted case analysis. Eligibility requires bilingual titles, the reviewed publication kind, a safe local story URL, a publisher, a matching case scope, and a nonfuture **source publication date**. Editorial `updated_at` cannot make an old report appear new.

The Pages endpoint performs two bounded service-binding reads, caches briefly and falls back to local accepted records. It makes no model calls, writes or schedule changes. The ticker uses larger type, clearer separators and a nonblocking introductory wash; offscreen work is reduced. The shared selector is also wired into the engine source, but a Pages preview does not deploy that engine. Model routes, budgets and production schedules are unchanged.

Authenticated operator telemetry was extended to include bounded weekly job states. Its read-only workflow mode can inspect the preview's binding without triggering discovery, inference or publication. General editorial quota errors are not sufficient evidence of a weekly-review failure; inspect the actual weekly jobs before diagnosing or changing that pipeline.

## Bugs and verification lessons

1. The original immersive layout reused Exhibition's `overflow:hidden` body class. Programmatic scrolling concealed the failure. Ordinary case/Issues layouts now use the shared editorial shell. Regression checks must send real wheel and touch input, including after closing dialogs.
2. A 1200px breakpoint previously replaced the complete network with two nodes and hid site destinations. A browser panel beside chat triggered it. Keep the complete network at 1150px, 768px, 390px and 320px.
3. Astro's empty static children slot is truthy on the server and absent on the client. Branching on `children` caused React hydration failures on the two cross-case pages. The explicit boolean `chronology` prop now determines that branch.
4. A production build can invalidate a concurrently running Astro development optimizer, producing stale-dependency 504s. Verify the built site, and restart development after building if needed. Do not interpret an interrupted build's asset errors as a deployed regression.
5. CSP intentionally blocks eval. Browser tests should use evaluated functions or bounded polling, without relaxing the site's policy.
6. Only referenced archive metadata is sent with topic timelines. Avoid importing the entire archive into every client island or creating hidden maps. Maps mount near their location in the reading flow; no scroll-driven camera updates were introduced.

The portable browser matrix is `scripts/verify-investigative-preview.py`. It covers EN/ID, all eleven networks, source links, keyboard selection, source reload/Back, scroll unlock, shared legacy URLs, responsive reflow, full Merauke chronology, home map/story hierarchy and no-JavaScript access. Run after a production build, with `BASE_URL` for a deployment. Local low-end testing additionally uses 320px, increased text size, touch input and CPU throttling. These are browser simulations, not a Samsung A12 device benchmark or accessibility certification.

## Design review

Taste's page inspector was run at 1440, 1150 and 390px, with screenshots reviewed. It found no horizontal overflow, broken mosaic images or page console errors in that inspection. Its useful findings led to larger photo credits and a quieter secondary headline scale. The established gradient wordmark/wash, lilac signal, Exhibition star, shared masthead and ordinary editorial heading size are deliberate project conventions. They are not silently removed to pass generic app-screen/style heuristics. A modal shadow is an intentional overlay treatment. Inspector findings are not a claim of zero design or accessibility issues.

## Remaining scope

The research slate remains much larger than the published record. PM2.5 needs a separately verified source, coverage, units and time model; hotspot detections are not a substitute. No new PM2.5 layer or live generative interface is represented as shipped. Cross-case pages expand only when original evidence supports the additional relationships. Production weekly synthesis operation remains separate from this preview release.

## Local release checks

The production browser matrix passed all 35 grouped checks with zero page errors, across both languages and all eleven cases. The separate 320px/125% text/6× CPU check passed all eleven cases with no overflow/errors and confirmed actual touch scrolling over the inline graph (scroll position 1073 → 1448). Content, investigation, polish, system, explorer, archive and compilation checks passed. The final build generates 364 routes. The last visual adjustments balance the lower mosaic rows and use SVG link arrows; deployment verification must check the resulting preview as well.

A final Indonesian network-label pass checked all eleven cases at desktop width for intersecting participant text boxes. Shorter wrapping eliminated the Merauke collision; edge captions only render when the link has room, with complete claim wording retained in the evidence reader and connection list. All eleven checks found no participant-label overlaps.
