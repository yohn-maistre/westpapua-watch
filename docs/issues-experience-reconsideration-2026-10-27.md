# Issues experience: revised direction

27 October 2026 (Asia/Bangkok). Planning and inspection only; no interface changes or deployment in this pass. This supersedes the assumption that the Issues landing page itself should be a dedicated app shell. Preserve the investigative record, all twenty research threads, existing case URLs and the established History experience.

## What the live inspection established

Screenshots and measurements captured from the branch preview with Chromium at 1150, 1440 and 390px; this is a separate browser session, not control of the user's embedded browser. Evidence lives locally in `/workspace/scratch/issues-reconsider-2026-10-27/`.

1. **Narrow desktop Issues — poor.** At 1150px the 1200px breakpoint hides the visible site links and case index, substitutes a select and renders two of Merauke's seventeen actors. The user's desktop window beside chat therefore receives the simplified layout. The problem is our responsive choice, not missing source data.
2. **Wide Issues and scrolling — blocked.** At 1440px all seventeen actors appear, but the page still cannot wheel-scroll. At all three checked widths, wheel input over the graph left window scroll at zero despite 2140–4739px of document content. `BaseLayout` gives immersive pages `exhibition-view-body`; `src/styles/polish-01.css:66` sets that class to `overflow:hidden`. Previous programmatic-scroll checks failed to detect user-input blocking. The inherited shell also suppresses the shared ticker, Masthead, CompactNav and footer. Keyboard/page reachability and genuine wheel/touch scroll need explicit regression checks. Screenshots alone do not establish accessibility compliance.
3. **Homepage — hierarchy mismatch.** The current desktop HomeOverview deliberately places editorial copy beside the map. It does not meet the requested map-first hierarchy. The captured map used its static fallback; this is not evidence that every live Atlas layer failed.

![Narrow desktop Issues](/workspace/scratch/issues-reconsider-2026-10-27/issues-1150.png)

![Wide desktop Issues](/workspace/scratch/issues-reconsider-2026-10-27/issues-1440.png)

![Current homepage overview](/workspace/scratch/issues-reconsider-2026-10-27/homepage-overview.png)

## Recommended information architecture

Home: shared masthead/navigation → prominent full-width monitoring Atlas → followed-case/editorial spread → current news → review/analysis → supporting material.

Issues: shared masthead/navigation → compact opening/search → image/document-led followed-case mosaic → broader topic directory and research access. This is an editorial browsing page. A network is available through its cases and search, rather than a compulsory first-screen workspace. Do not recreate the old tiles literally: improve imagery, hierarchy, spacing and metadata while retaining their browsing role.

Individual followed case: concise opening → full case network with visible evidence → compact dated timeline and document previews → deeper background, sources and related cases. Reuse the record and source machinery already built. Preserve existing URLs, Merauke's full chronology, source locators, URL state and Back. Avoid a parallel duplicate version of each case with inconsistent copy.

Political finance and military business are cross-case investigative threads. They should lead to reviewed relationships across cases rather than competing with place/event dossiers as if every thread were a separate followed story. All twenty remain in the research programme; their existence does not imply twenty finished investigations.

## Network and reading composition

- Show the case's complete reviewed network initially on desktop and portrait tablet. Arrange meaningful, named groups; avoid a handful of small marks scattered through a large empty field. Shared context is not itself a sourced relationship.
- Keep people, companies, offices, decisions, statements, observed effects and evidence distinct. Reveal the selected claim's documents/excerpts alongside its relationship; do not invent links to make groups join.
- At narrow desktop widths, move evidence beneath or into a compact visible tray before removing the network. A desktop panel beside chat must not become a two-node slideshow.
- Phones retain a compact overview of the whole case with legible key labels, tappable clusters and a normal relationship list. Expanding a group reveals a useful neighbourhood, not a single pair by default. Expanded pan/zoom is an explicit mode; ordinary page gestures keep scrolling. Profile actual source-backed scenes before choosing renderer or density limits.
- Default case selection should already expose useful evidence: one readable record/excerpt and document previews. Do not require a tab or modal to discover that sources exist.
- Timeline and sources have visible first entries below/alongside the graph. Expand the long chronology or source catalogue progressively. View controls may change the graph's lens, but must not hide the page's only chronology or source access.
- Keep the broad network and geography linked. Prefer one main network plus a quiet locator/Map view or expandable map, rather than permanent equal-size competing canvases. Selection may locate the relevant place after an explicit action; no scroll-driven camera animation and no multiple hidden WebGL maps.
- Preserve ordinary page flow, credited imagery, sourced document thumbnails, Instrument type and lilac signal. The shared Masthead becomes the usual CompactNav on scroll. An explicitly expanded investigation can use the compact shell without permanently hiding site links.

## Switching cases and organising following

Use a visible compact case index, with real image/document thumbnails and short titles. On narrower screens it can wrap or be horizontally scrollable with an obvious next item; it must not require a select to discover cases. This should be one coherent control, not several floating topic buttons. Keep reading position stable during local graph selection. Switching to another case should use a proper case URL and restore that case's state.

Proposed browsing families to test against the existing evidence:

- Merauke food/energy estates.
- Freeport and Mimika.
- Highland conflict and displacement, with distinct Nduga, Puncak, Intan Jaya and Kiwirok records/routes retained as subcases.
- Indigenous forests/plantations, with Awyu and other locally specific disputes kept distinct.
- Raja Ampat mining.
- Civic space and information control.

These are candidate families, not a commitment to merge distinct histories, communities, timelines or causal claims. Retain separate case pages where the evidence supports their own substantial accounts; use collections to reduce repetitive cards. Investigative threads can cross every family.

## Homepage Atlas

Restore the prominent full-width Atlas as the first main content object after the shared masthead/navigation. Default to a Papua overview; support hotspots and the other reviewed monitoring layers independently of a selected editorial case. Retain timestamp/legend/source access. PM2.5 remains a separate later source/coverage/unit decision, not another name for hotspot detections.

Put the selected story/case spread underneath; pins and the visible case index can update that spread and explicitly focus the map. Preserve the case query and Back. Avoid duplicating the same four case cards again further down the homepage. Keep one map instance and useful fallback content while it loads.

## Ticker follow-up

The live `/api/following` response still supplied the old seeded update wording/dates: Awyu September 2024, Mimika April 2026, several June 2026 monitoring entries. This confirms the user's stale-content observation, but does not by itself establish why the worker has no newer accepted snapshot. Code shows the endpoint uses `readCaseState`, preferring a published snapshot and falling back to the seed. Inspect evidence eligibility, held candidates, validation and publication before changing schedules or model quotas.

Reuse one accepted case-state record for the ticker, followed cards and the case's latest development, retaining evidence dates separately from review dates. Do not restamp old news to look current, or invent a change when no new accepted evidence exists. Group repetitious updates when their underlying report genuinely supports it. Keep topic | update ✦ item separation, increase actual text size (test roughly 16–18px desktop and 15–16px phone), and size the row around readable type. The opening wash stays brief, dismissible/nonblocking and reduced-motion aware. Freshness is an editorial/pipeline task as well as a visual task.

## Implementation order and acceptance

1. Correct shell/scroll inheritance; restore shared navigation and ordinary reading. Verify wheel, touch and keyboard scrolling from graph, whitespace, source rows and after closing overlays. Do not use only `scrollTo` as evidence.
2. Restore/improve the editorial Issues landing and make Home Atlas-first.
3. Build the revised Merauke case as the single representative experience: network, evidence, document previews, timeline, location and narrative together. Check in a 1100–1200px browser panel as well as wide desktop and phone before extending it.
4. Reuse the proven composition across the other case pages and organise cross-case threads/search. Preserve evidence and identity semantics.
5. Audit and refresh the accepted following states and ticker; verify the existing automation instead of assuming a repaint will generate updates.

Before release: visible site destinations at desktop/tablet widths; no default two-node carousel; useful network/evidence/timeline/document content discoverable without a sequence of tabs; natural scrolling; no modal scroll lock left behind; URL/reload/Back correctness; EN/ID copy; keyboard/focus operation; reduced motion; honest source dates; bounded rendering and one active map. Keep main untouched while previewing. History is outside this redesign.
