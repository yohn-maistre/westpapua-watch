# Investigative networks and interaction repairs — 28 October 2026

This implements the user-approved audit in /workspace/WATCH_INVESTIGATION_AUDIT_2026-10-28.md. The user subsequently authorised a direct merge/deployment to main after local verification. Earlier preview-only delivery wording does not require another approval for this release.

## Public behaviour

The Issues mosaic, prominent independent Home Atlas, shared masthead/compact navigation, History reading experience and canonical case URLs remain. The standalone Merauke analysis entrance has been removed from canonical and legacy case views; context, chronology and sources remain.

Case pages have a source-backed force network and a selected-record dossier. Case, connected-case and all-case scope use the same accepted records. Four explicit relationship categories highlight authority, business/material, land/community, and action/law while retaining the surrounding network. Selection, scope, lens and exact source are shareable and restored by reload/Back. Local search results update the selected record without reloading the page.

Desktop and expanded exploration retain the reader alongside the network. Phone inline graphs use a bounded-height overview; selection opens a content-sized source/actor sheet. Full exploration supports pan, node dragging and native two-pointer pinch, with a scrollable reader in the same view. Selecting a connection/source no longer dismisses the expanded graph. Ordinary vertical touch input over the inline graph scrolls the page.

The reader includes supported actor context, dated actions and roles, precise relationship text, source locators, original passages, relevant response/outcome, and exact source inspection. Source selection highlights its supporting graph relationships. The document tray prioritises the selected evidence plus relevant source previews; original full source links remain available. Existing Pusaka and Greenpeace photographs are reused with their archive captions/credits, alongside actual document first-page previews.

## Motion and performance

d3-force 3.0.0 handles brief, interaction-driven settling. No per-frame React state is used for positions. Layout nodes are private copies; editorial entities/claims stay immutable.

Initial equilibrium is computed during the build, in scripts/build-investigative-layouts.mjs, for desktop/phone and the three scope choices. Browsers receive normalised coordinates and do not synchronously compute the 180-tick initial equilibrium. The generated file is deterministic and approximately 46KB before compression for this release; its size can grow with evidence.

Actual SVG text bounds are measured and cached, with placement choosing non-overlapping candidate positions. Labels are remeasured when fonts are ready. Larger views progressively expose names with explicit name/zoom controls. All participants and supported connections remain available through the network, search and readable relationship list.

Physics cools and is explicitly stopped after a short settling window, on visibility/offscreen changes, for reduced motion, and for the inline graph underneath expanded exploration. Expanded exploration uses SVG, not another WebGL map. Reset uses the saved layout rather than running a blocking equilibrium calculation.

This is not a physical Samsung A12 benchmark or a claim that the research programme is complete.

## Smaller interaction fixes

- Ticker touch gestures create a temporary reading hold, not a permanent manual pause. Native momentum extends the hold. Motion resumes at the current position after inactivity.
- Applying delayed news/review content preserves the visible item's ID and offset. Explicit Pause persists; Resume works while its control has focus. Touch does not inherit a synthetic mouse-hover lock.
- Duplicate-segment links remain pointer-operable but leave the keyboard tab order. Native reduced-motion scrolling remains.
- The wash uses actual interaction state, avoiding sticky touch hover/focus states.
- Ticker titles use Instrument Sans's real 92% width axis via a separately named face; other typography and the wordmark keep their current faces and widths. Phone/desktop strip heights remain 44/46px. Archive-label contrast and small date legibility are improved.
- Resources directory swaps close/open state in one action, preserves the activated header and gently reveals contents. It reads scrollY after layout: collapsing content can clamp the browser's scroll position, so reusing the old position added a second jump. Temporary document scroll-anchor suspension prevents a subsequent native correction. Multi-category search and keyboard details semantics remain.

## Evidence changes

The accepted record now contains 99 relationships across 11 case files. The full 20-thread programme remains; these are not 20 completed investigations. Merauke grows from 11 to 31 connections while retaining all 42 chronology entries.

New Merauke links cover strategic designation, named operators and planting, the Yei statement's delivery, agriculture/defence coordination, military land-opening command, navy agricultural transport, forest-use authority, Wanam clearing and Wobikel objections, MRP hearings, Kondo Digul organising, Yei recognition, and separate road-permit, filing and interim-halt stages. They are drawn from the original Pusaka chronology and the Greenpeace/advocacy-team account, read during this pass.

The interim road instruction and final dismissal remain distinct. Original court/permit texts and subsequent appeals remain gaps. Pusaka's chronology has been corrected to a 2023–2024 source period; later court reporting remains a separate source. Rice, sugar/bioethanol and road authority are not collapsed into a single permit or operator.

Freeport gains the Goldman Prize profile's documented account of Mama Yosepha's opposition and HAMAK organising. Its 2001 date identifies the profile, not a claimed exact beginning/foundation date. No new Goldman photographs are imported.

Kiwirok gains the MPR's own 26 April 2021 publication of Bambang Soesatyo's call for full military/police/intelligence deployment. His exact Indonesian statement is attributed. A call to an agency is not represented as an operational order or responsibility for the later Kiwirok attacks. The source connects to Puncak context as well.

Information control gains the Strick/Thomas investigation of the InsightID-linked campaign, authorship/method and the separate smaller network distinction. The attribution is to the published investigation; no ultimate client or funder is invented. Amnesty's 2024 Indonesian spyware research is represented as national sales/deployment context, with the explicitly unresolved individual targeting and material responses retained. It is not evidence of a particular Papuan target.

Actor profiles cite accepted claim IDs, with bilingual writing. Other actors retain their dated supported records. Category codes are explicit editorial metadata rather than guesses from translated display titles.

## Sources re-read in this pass

- Pusaka, Merauke National Strategic Project Timeline: https://pusaka.or.id/en/lini-masa/merauke-national-strategic-project-timeline/
- Greenpeace/advocacy team, 21 September 2026 road-permit account: https://www.greenpeace.org/southeastasia/press/69267/court-rejected-indigenous-malind-peoples-lawsuit-challenging-a-135-km-roadway-destroying-customary-forest/
- Goldman Environmental Prize, Yosepha Alomang profile: https://www.goldmanprize.org/recipient/yosepha-alomang/
- MPR, 26 April 2021 public statement: https://mpr.go.id/berita/Satu-Lagi,-Kabinda-Papua-Gugur-Ditembak-KKB-Papua.-Bamsoet-Minta-TNI-Polri-Turunkan-Kekuatan-Penuh-Tumpas-KKB
- Strick/Thomas, 11 October 2019, published by Bellingcat: https://www.bellingcat.com/news/rest-of-world/2019/10/11/investigating-information-operations-in-west-papua-a-digital-forensic-case-study-of-cross-platform-network-analysis/
- Amnesty, May 2024 announcement and explicit methodology/response scope: https://www.amnesty.org/en/latest/news/2024/05/unravelling-a-murky-network-of-spyware-exports-to-indonesia/

These were selected HTML accounts, not a new full audit of every linked report or corporate/legal original. Primary corporate ownership, donor schedules, machinery finance/delivery, original legal texts, weapons last-mile records and consensually public device forensics remain in the existing research gap register.

## Design rationale and verification

Taste's true-black-flat app direction (seed 1972612348) informed the flat network/dossier surfaces and colour on evidence types. Watch's established Instrument typography, cool dark ground, lilac identity, ticker wash/star and shared editorial shell take precedence over generic palette/shell bans. The sheet's generic KPI dashboard composition is inapplicable to a public investigative case with a normal page opening.

The first visual pass found real pointer selection and phone label-placement problems; those were corrected. Text placement uses measured SVG labels, not an assumption that circular node collision prevents label overlap. Small new captions were raised to at least 11px and changing figures use tabular numerals.

Taste's full-page heuristic scan is not a clean certification: it flags the intentionally retained wordmark/star/gradient and editorial title/shell, and applies app-above-the-fold/KPI rules to the public case page. Original paper previews deliberately preserve page proportions. Browser checks, actual interaction and screenshot inspection are the acceptance evidence; do not claim the heuristic scan passed without qualification.

Tests: scripts/tests/network-experience.mjs validates provenance/profile references, categories, group coverage, deterministic/private force layouts and exact scoped-source sharing. scripts/verify-network-experience.py checks all eleven files in EN/ID, local search, source/reload/Back, persistent expanded reading, phone/tablet reflow, every Resources category pair, native ticker touch/momentum, explicit Pause/Resume, actual graph dragging and released inline touch scrolling. The established investigative browser matrix remains and reads the new participant count from data rather than assuming 17.

Final local verification:

- Production build: 364 routes; content, archive (77 media items), polish, system/news, explorer and investigation checks passed.
- Established browser matrix: 35 grouped checks, no page errors. New browser matrix: 35 grouped checks covering eleven cases in EN/ID, scoped records/sources, reload/Back, expanded reader, 768/390/320 reflow, directory transitions, touch ticker and graph drag/scroll.
- Final targeted rerun adds reduced-motion fresh-news loading without animation, after correcting its refresh guard. Native touch holds/swipes and delayed reviewed-news fixtures are used rather than synthetic scroll alone.
- Supplementary expanded-view checks: cross-case search stays local, actor context, wheel zoom, keyboard close, bilingual 768/390/320 reflow, no page errors. Final screenshots inspected at desktop and phone widths.
- Chromium at 6× CPU: all-case view contains 107 connected participants / 99 relationships; native pinch reached 1.75×, graph returned to idle and added no long tasks during the sampled idle period. Initial hydration/paint still creates long tasks; this is not a physical low-end phone or frame-rate certification. No-JavaScript access retains the 31 Merauke connections and 42 chronology records.

Local captures/logs: /workspace/scratch/watch-network-build-2026-10-28/. Deployment completion is recorded in /workspace/WEST_PAPUA_WATCH_HANDOFF.md after merge.
