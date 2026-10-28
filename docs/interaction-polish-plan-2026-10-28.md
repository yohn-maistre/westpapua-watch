# Interaction polish plan — 28 October 2026

Status: implemented on `preview/investigative-explorer`, following the user’s approval of the planning notes below. Based on the released `e920a8a` experience. See the implementation record at the end for verification and rollout boundaries. The original audit and recommendations are retained as historical context.

## Evidence and limits

Current live captures and measurements: `/workspace/scratch/interaction-polish-2026-10-28/`. Tested at 1440px desktop and 390px phone. The ticker measures 75px / 83.69px respectively. Current type/date metadata is stacked beside titles that can wrap to two lines; the permanent pause panel adds another bounded control to the strip. The compact nav has a separate gradient pseudo-element.

1. Ticker: working rotation and interaction, but excessive mobile height and crowded metadata. Restore a single-line reading rhythm.
2. Scroll surfaces: normal page scrolling works. The case switcher has substantial horizontal overflow (1175px desktop / 1820px phone in the measured Merauke view). The inline SVG itself did not need a horizontal scroll container in that capture. Native scrollbar appearance varies by OS; headless Chromium does not reproduce the user's Windows chrome exactly. Audit the expanded graph, readers, dialogs, filters and source lists as distinct surfaces during implementation.
3. Ask: opening, answer display and citation expansion worked in the audit. Its fixed 84dvh desktop / almost-full-height phone shell leaves a large empty middle before a conversation. Large prompt pills, separated composer/action/footer rows, small session-copy and literal citation labels weaken hierarchy. Inspecting the client also found whole-thread replacement and unconditional scrolling to the bottom in `render()`.

The populated/loading Ask screenshots use an intercepted local fixture with actual catalogue source URLs, not a live AI answer or production write. They test presentation and interaction only. No model request was made. The screenshot set includes `ticker-*`, `ask-empty-*`, `ask-answer-fixture-*`, `ask-sources-fixture-*` and `case-scroll-*`. No accessibility or actual Samsung A12 certification is implied.

Product Design context preflight found no saved context; repository guidance and the current user screenshots supplied the brief. Mobbin refused search because its MCP requires a paid plan; no Mobbin reference was used. Component research below is from official documentation, not a substitute claim about Mobbin results.

## Recommended ticker

- Keep the four-hour discovery edition and separate current-news selection. This is a presentation pass, not a new selection algorithm or visitor inference path.
- One inline row on desktop and phone. Start around 44–48px desktop and 40–44px phone; preserve usable link targets and verify increased text size rather than forcing an inflexible height. Use roughly 15–16px title text instead of reducing readability to fit.
- Anatomy: small type marker + short type label + title, then one quiet separator. Put only essential freshness information inline, primarily news/event dates. Author/publisher/bibliographic detail belongs at the destination or an accessible preview, rather than a second ticker row.
- Give titles most of the space. Use deliberate short display labels where accurate, preserving full original titles in the destination/accessibility metadata. Avoid an oversized fixed item width or a whole row of metadata competing with titles.
- Retain the lilac/blue animated background as one continuous field. Add restrained per-type colour on a marker/label. Reuse existing type colours where coherent; group related types into a small tonal family rather than seven saturated badges. Text labels remain the primary distinction.
- Compare the continuous wash with a very low-opacity local tint underneath each type. Avoid hard pill boundaries, separate animated tiles and layered per-item shaders. Use one shared motion clock or CSS transform layer, with static reduced-motion behaviour and offscreen suspension. Tune contrast against every gradient extreme.
- Remove the permanent right-hand pause panel, as requested. Preserve hover/focus pause, explicit keyboard pause/resume and a discoverable contextual touch pause/resume action. A swipe should remain usable and reading should not restart immediately after a touch. Resolve the exact contextual affordance in preview; hover alone does not cover keyboard/touch readers. Reduced-motion is static and manually scrollable.
- Keep one separator vocabulary: a restrained dot or the existing Watch star, with enough spacing to mark an item boundary. Do not combine a badge border, pipe, star and multiple metadata separators in every item.
- Remove the compact-nav gradient spine. The full masthead ticker already owns that colour; the compact bar should retain its translucent surface and quiet navigation. Compare in preview before adding any stronger animation back.

## Scrollbar system

Use two implementations with one appearance, keeping native scrolling and page structure intact.

**Document/root:** CSS styling of native scrollbars. Quiet neutral thumb, transparent track, consistent dark/light surface tokens and stable gutter where appropriate. Browser/OS control limits exact appearance: don't promise the same animated width everywhere. Do not wrap the whole document in a custom scrolling div or smooth-scroll library; that risks sticky History/nav, anchors, Back, keyboard, Find and low-memory performance.

**Bounded components:** Base UI Scroll Area where it is already a React surface or where a reusable component genuinely helps. Visual thumb around 3–4px at rest, widening within an unchanged 10–14px interaction track on hover/focus/drag, and fading after use. Keep thumb size/hit area sufficient for dragging. Animate opacity/inner-thumb thickness rather than changing layout width. Use unobtrusive horizontal scroll indicators and edge fades only where more content actually exists. Fades must not obscure citations, labels or controls.

Touch should keep OS-native gesture behaviour. Keyboard focus, scrolling and visible position must remain available; forced-colour and always-show-scrollbar preferences need a visible fallback. No permanent RAF loop per scroll area and no continuous layout measurements. The graph's pan/zoom is separate from scroll chrome; do not change its navigation incidentally.

## Ask design

Keep the recognisable Ask/Tanya entry and source-grounded purpose. Recommended initial direction is a compact research conversation, rather than another full investigative app shell.

- Desktop: a smaller centred opening that grows with a conversation up to a comfortable viewport maximum; optional explicit expand for longer reading. Keep docking as a possible later experiment, not an automatic page reflow that squeezes History or resizes the Atlas.
- Phone: deliberate full-height reading sheet, compact header, one scrolling conversation and a bottom composer that respects dynamic viewport, safe areas and the keyboard. Test a real/representative virtual keyboard during implementation.
- Empty state: one welcoming sentence and three short, purposeful suggestions, informed by the current page (understand it / find sources / connect it to wider history). Avoid a large unfilled middle and several oversized pill rows. Suggestions can populate the field without spending an inference call.
- Header: Ask Watch, current-page context when relevant, quiet new-conversation action and close. Move the six-exchange/session explanation into accessible information instead of always occupying a footer row.
- Composer: one integrated auto-growing field, send arrow button, stop in the same action position while running. No browser resize grip or duplicate action bars. Keep a restrained focus treatment and clear errors/retry.
- Conversation: small user turns and readable editorial answers, consistent paragraph/list rhythm, compact inline numbered citations and a source summary. Citation focus/tap opens a real source preview or the relevant source list; exact quoted excerpts appear only if the backend returns them. Retain full source links and attribution.
- Useful result components: source/reference row, Library item, dated timeline, entity/case connection and a comparison of sourced accounts. Start with two or three whose data already exists; no chart/graph merely for decoration.
- Preserve reading position when someone scrolls up; show a return-to-latest control. Append/update turns instead of replacing the entire thread and forcing bottom scroll. Preserve keyboard operation, cancellation, locale, bounded history and session behaviour.
- Show honest progress. The current API returns a completed JSON answer, not token streaming. Keep a real pending state for the first pass. Progressive text/tool-phase events require a backend change; do not fake streaming or claim tools ran that did not.

## Component fit

| Reference | Fit | Proposed use |
| --- | --- | --- |
| Base UI Scroll Area | Already available in the installed package; native scroll with custom chrome | Bounded readers, source panels and Ask transcript |
| shadcn AI Elements, Base UI variants | Current composable source patterns; not a mandatory hosted service | Message Scroller, Prompt Input, Sources, Inline Citation, Suggestion, Message |
| assistant-ui LocalRuntime | A custom `ChatModelAdapter.run` can call a REST endpoint | Alternative if its state/history runtime is worth the additional integration; do not layer two chat runtimes |
| Cult UI | Registry of copied React/Tailwind components; no independent Cult runtime | Inspect selected prompt-input details as references; avoid installing a marketing animation stack into Ask |
| OpenUI | Custom components generated through OpenUI Lang, with provider-independent runtime | Separate bounded experiment after the new conversation UI and evidence blocks work |

The project is Astro/React with custom CSS and Base UI, not an existing shadcn/Tailwind app. Copying a block is therefore not automatically a drop-in install. Adapt selected primitives to Watch's Instrument typography, tokens and data contract, and lazy-load added Ask UI when opened. Do not import an entire template, AI SDK or new service just to obtain a composer.

## OpenUI feasibility and staged approach

The official docs describe creating a component library, generating its prompt specification, having a model emit OpenUI Lang and rendering that output. The current endpoint returns `{answer, sources, language}`; that cannot simply be passed into the renderer as generated UI.

Phase A: redesign Ask using the existing endpoint and native/source-backed components. Rendering existing source metadata as cards adds no inference call. Keep Markdown/text as the reliable answer surface.

Phase B: expose a small typed record/block layer referencing actual retrieved record/source IDs. Build timelines, Library rows and connection previews from authoritative application data; components do not invent facts or arbitrary destinations. Define maximum item counts and text fallback. Preserve citation identity through blocks and history.

Phase C: preview OpenUI choosing/composing only approved components for suitable questions. It can use the existing model route directly; the optional Thesys Gateway/Autofix services are separate choices, not requirements to silently add. Direct use needs application-owned parsing/validation and fallback. A component specification adds prompt/output complexity; repair loops can add model calls. Test the actual model roster for formatting validity, citation correctness, latency, payload size and cost before promising production reliability or quota neutrality. No new subscription, model/provider switch or repair pipeline is part of this plan.

## Proposed execution order

1. Preview the one-row ticker and remove the compact-nav spine. Compare type-marker-only colour against a faint shared local wash at 320/390/768/1440px.
2. Establish scrollbar tokens and apply them first to the case switcher, source dialogs and Ask; preserve document scrolling and History's performance.
3. Build the smaller Ask opening, integrated composer, conversation/source states and reading-position behaviour. Review both languages and empty/pending/long-answer/error/citation/keyboard states.
4. Add two or three useful evidence blocks. Then run the separate bounded OpenUI experiment if it improves the experience over deterministic blocks.
5. Inspect built screenshots and real wheel/touch/keyboard interactions on preview before any production release. This turn does not authorise deploying an unreviewed redesign merely because the previous release was approved.

## Official sources

- https://base-ui.com/react/components/scroll-area (live docs currently show v1.9; installed package begins at ^1.8 and exposes Scroll Area. Check exact installed APIs during implementation.)
- https://ui.shadcn.com/docs/ai-elements
- https://ui.shadcn.com/docs/ai-elements/base/chat
- https://ui.shadcn.com/docs/ai-elements/base/prompt-input
- https://elements.ai-sdk.dev/components/conversation (legacy site announces migration/deprecation at end of November 2026; prefer the current shadcn Base UI references)
- https://www.assistant-ui.com/docs/runtimes/custom/local-runtime
- https://www.cult-ui.com/docs
- https://www.openui.com/docs/getting-started
- https://www.openui.com/docs/production

## Expanded scope accepted in the next planning turn: map guidance and News

The user confirmed item-level feathered tint washes moving with ticker titles, subtle type hues compatible with lilac, the scrollbar/Ask redesign first and OpenUI experiments later. They also requested a short map-selection hint and a News experience that prioritises Papuan rights/accountability for diplomatic and activist readers while retaining everyday regional coverage. This was approved for implementation in the subsequent turn; the implementation record below supersedes proposal status.

### Map microcopy

Place a single faint but readable sentence immediately above the place/case choices below the Home Atlas. Suggested EN: **Choose a place to see it on the map.** Suggested ID: **Pilih lokasi untuk melihatnya di peta.** Both are under ten words and work for touch and mouse. Do not repeat it under every card or imply navigation when a control only focuses the map.

### Read-only production source audit

Snapshot: 28 October 2026, 03:53:20 UTC / 10:53 Bangkok. Exact SELECT statements, schemas and results are retained at `/workspace/scratch/news-desk-plan-2026-10-28/source-audit.json`. Query metadata reported zero rows written. No backfill, publishing cycle, model call or source configuration change was triggered.

- The checked-in automated registry contains 18 entries, **17 enabled**, with ACLED disabled. The broader Library/History organisation pool is not the automated news registry.
- The latest **24 published story clusters** contain reports from only Jubi (12 cluster appearances), ANTARA Papua (12) and Suara Papua (10). These are overlapping appearances, not exclusive shares; their sum exceeds 24 because clusters can contain several publishers. This establishes the current front-of-feed concentration, not the source composition of every historical story.
- RNZ has **310 stored articles, all missing publication dates**; it nevertheless appears in five published clusters across all time. RRI has 184 stored articles and all lack publication dates. Missing dates must not be interpreted as zero reporting in a publication-date window. Weekly evidence currently excludes undated articles, so this also constrains international context in automated reviews.
- Pusaka has only **two ingested articles**, latest fetched 5 October, with none attached to published story clusters. This does not mean Pusaka has only published two works. The curated Merauke timeline is a separate ingestion/content path. Kalawai is enabled in configuration but has no publisher/article row in this snapshot.
- Other publishers do reach the published corpus: HRM appears in 26 published clusters across all time, Mongabay in 28. Their absence from the first 24 is not proof of total exclusion. ABC/Multatuli filtered items may legitimately be outside Western New Guinea; inspect representative articles before loosening relevance rules.
- Current ordering uses latest linked report time, with `ranking_score` as a tie-breaker. The current hero is a regional government financing announcement, while recent Nduga rights/accountability, Merauke PSN and Nabire mining stories appear lower. Changing only the existing numeric score would be insufficient: even festival coverage can have a high score.
- The public category and latest-source role come from the **newest linked article**, rather than the whole development. This is insufficient for a multi-topic lens or multi-source provenance label.
- Existing `watch_desk` values already cover environment, land, human_rights, politics, culture, regional and other. Development issues include legacy slugs as well as newer subjects, and some relevant clusters have no issue row. For example the Nabire mining cluster has a `land` packet but no `development_issues` match. Build lens membership from canonical aliases and relevant article/development evidence, not only one frontend tag or one latest packet.

The strongest confirmed problems are recency-led prominence, missing dates and thin discovery coverage for some priority sources. Website fetch failures, feed design, extraction errors and publication frequency need source-specific checks; the database alone does not prove which one caused every gap.

### News structure and editorial purpose

Proposed primary selector (one coherent rail, not a wall of chips):

| EN | ID | Purpose |
| --- | --- | --- |
| In focus | Sorotan | Default: consequential rights, land, ecology, conflict, accountability and civic-space developments |
| Rights & conflict | HAM & konflik | Civilian harm, displacement, detention, militarisation, humanitarian access and accountability |
| Land & environment | Tanah & lingkungan | Customary land, concessions, extraction, forests, water, conservation and ecological consequences |
| Politics & civic space | Politik & ruang sipil | Representation, state decisions, courts, protest, expression, organising and information access |
| Across Papua | Kabar Papua | Regional public services, education, livelihoods, community and cultural life |
| All | Semua | Complete chronological stream |

Keep geography as a separate compact filter available to every lens. A reader should be able to combine human rights with a particular area; regional news is a reading purpose, not the only place filter. Keep selection in shareable URLs and preserve it through story navigation/Back. Stories can belong to multiple lenses; deduplicate within the current result set.

Changing a lens updates the lead story and remaining cards, using server-side filtering and pagination. Do not fetch twelve mixed items and hide eleven in the browser. Each lens leads with its own newest qualifying material; In focus additionally applies explicit editorial significance. Do not make administrative publicity a monitoring lead simply because its headline mentions rights or sustainability. Include Papuan testimony and organising, legal action and conservation work alongside reported violations. Official responses remain available with clear attribution. A new official response can update an important case without becoming its entire frame.

In focus ranking should use documented consequence, material new change, significance to the monitoring remit, source support, review status and freshness. Bound the effect of article volume and avoid runs dominated by one publisher family when comparable relevant coverage exists. More reposts do not automatically mean more importance or independent corroboration. Prefer the stronger relevant story over a weak item selected only for diversity; do not hide important Papuan reporting to meet a quota. Distinguish a report's publication date from ingestion/update time. If a lens lacks fresh qualifying coverage, show that state and clearly dated older reporting rather than substituting unrelated items or making old reports look new.

Add a modest **Reports & investigations / Laporan & penelusuran** area for slower, substantial NGO/investigative work with honest dates. It should complement the selected lens and supply original evidence, not copy the Issues mosaic or repeat the weekly review. The weekly review retains its distinct cross-event synthesis role; cases retain their deeper context and case-specific analysis.

### Source repair and coverage

Before promising new-source variety, inspect each current source from discovery through extraction, relevance, clustering and publication. Preserve a simple internal health view: last discovery/fetch success, last genuine publication date, candidate/relevant/published counts and error reason. Separate an empty or slow publishing period from fetch failure or metadata loss.

- Repair date extraction using verified feed metadata, JSON-LD and article/time markup, preserving published-versus-modified semantics and explicit unknown dates. The current fast extractor recognises only limited meta tags. Repair existing records selectively after validating the parser; do not manufacture publication dates from fetch time.
- Prioritise Pusaka discovery and the RNZ date path, alongside HRM and other monitoring sources. Inspect Kalawai's missing path and stale sources independently. Use source-specific section feeds, sitemaps or supported public collection pages where generic RSS/homepage discovery misses relevant work.
- National/Pacific feeds can consume scarce discovery/relevance slots with out-of-scope material. Prefer Papua-targeted discovery and bounded source-family fairness; do not relax the Western New Guinea relevance rule just to obtain more logos.
- Evaluate additional monitoring/report sources such as TAPOL, KontraS, Amnesty, HRW and Forest Peoples Programme, verifying their public retrieval routes and useful article types first. These are proposed source candidates, not newly connected feeds.
- Keep reporting, monitoring findings, testimony and official statements distinct. ANTARA national and Papua editions are one publisher family for independence/diversity, even if operational feeds remain separate.
- Reuse the existing scheduled pipeline and corpus. No per-visitor classifier or automatic OpenUI generation is needed for selectors, ranking or source labels. Validate the repaired feeds and retrospective metadata before any bounded backfill; do not silently republish the entire archive.

### Provenance design

Use a quiet named-source row with a small muted provenance marker as the first design. A single coloured rule across an entire story can wrongly imply one origin or a truth score, especially when a cluster combines Jubi, state reporting and an NGO account.

Expose **all contributing original publishers and roles**, not only `latest_source`. A cluster might display “Jubi + Pusaka · 2 sources”, expanding to the attributed reports. Suitable reader-facing families include Papuan newsrooms, civil society/monitoring, independent/investigative, international public-service reporting and Indonesian state/public media. International public-service media should not be conflated with Indonesian state-media provenance.

If a thin image/content-boundary line adds enough visual clarity in preview, keep it low-contrast and pair it with the text label. Mixed coverage can use a neutral mixed-origin indicator or a few short segments, rather than pretending a single hue represents the entire synthesis. These describe origin, not a numerical reliability verdict. Avoid using both news-topic colour and provenance colour on the same card without an unambiguous label.

### Updated implementation order

1. Build the slim one-row ticker with a shared lilac drift and per-item feathered type tint; remove permanent pause chrome and compact-nav spine. Add the Home map hint.
2. Standardise native/component scrollbar appearance, then rebuild Ask's opening, composer, conversation and citations. Defer OpenUI as agreed.
3. Repair priority source/date/classification gaps and define the server-side lens/ranking/provenance contract. Keep raw evidence and source roles intact.
4. Preview the News selector, hero switching, geography, source summary and reports area in both languages. Use actual stories, long/mixed-source cases and explicit empty states.
5. Verify pagination, shared URLs, Back, dates, source-family independence, keyboard/touch behaviour, increased text size and low-memory performance. Review the actual preview before a new main release.

Further implementation notes from the live News capture: verify that region filtering distinguishes the reporting dateline from the affected place; the sampled South Papua financing headline currently displays Jayapura in its metadata. Treat this as a geography-role question, not proof that either place is fabricated. Provide a compact text-led lead treatment when a usable photograph is unavailable, rather than retaining an oversized empty picture area. Correct small count-label plurals and the already-observed English-title language failures as part of bounded editorial/UI QA; do not regenerate every published story.

Home's News preview and the discovery ticker's single news slot should use the same explicit editorial selection as In focus, while All retains the complete chronological feed. This keeps the site's front doors consistent without changing the prominent Atlas or editorial case invitations.


## Implementation record — 28 October 2026

The next user turn explicitly added stronger story clustering and whole-episode summaries to the approved ticker, scrollbars, Ask, map hint and News work. All work is on the preview branch. No production database repair, backfill, regeneration, engine deployment, model roster change or new inference path was run.

### Public interface

- Ticker: one row, measured **46px desktop / 44px phone**. Each labelled type has a restrained tint carried with its item over the shared lilac animation, with one star separator. Essential news/event dates remain inline. Removed permanent pause panel and compact-nav colour spine. Keyboard focus reveals a pause control; Space toggles motion; touch pauses persistently and exposes resume. Hover, reduced motion, inert clones, four-hour edition, offscreen suspension and no-JavaScript links remain.
- Native scrollbars: quiet thumb/transparent track; a wider hover thumb in a fixed track where WebKit supports it, component focus/hover styling, forced-colour fallback. The document and Astro dialogs stay native. No Base UI/React migration or scrollbar library was necessary; this adapts the inspected component patterns to the existing Astro UI rather than adding an unused dependency.
- Ask: fit-content desktop entrance (518px in the English 1440/768px captures), deliberate full-height phone, text-led suggestions, integrated auto-growing composer, existing stop/send contract, safe structured source previews and inline citation links. Incremental message append preserves expanded sources and reading position. An in-progress answer no longer locks typing the next question; stopping/error preserves that draft. Related catalogue/live matches are deduplicated. Native dialog focus/Escape and per-tab history remain. No OpenUI, streaming, new provider or new model call was added. Preview/test answers are intercepted fixtures, not evidence of live answer quality.
- Home: short bilingual map hint above case/location choices. News preview and ticker request the same `focus` selection as News. Full Atlas prominence and case invitations remain.
- News: six visible text lenses, separate place selector, selected lead and pagination, shareable URLs and Back. `Across Papua` selects public-service/regional/everyday subjects; `All news` remains chronological. `In focus` orders rights/land/accountability within dated weekly shelves, with small bounded support/report weights; this is an explicit deterministic first pass, not an assertion of expert significance or an LLM judgement of truth. No source quotas. Type/issue/topic overlap is allowed. Missing-image lead stories use a compact text treatment. Source-family labels and original outlet names use subtle text hues; mixed-source stories are labelled as mixed, and RNZ/BBC/ABC public-service reporting is distinct from Indonesian state media. Reader/server story counts and provenance use the same vocabulary, with English singular/plural counts corrected.

### Clustering and synthesis

- Packet extraction now names incident/proceeding identity separately from the new action and excludes mere newsroom datelines from affected-place candidates. This improves future packets; old geography roles have not been repaired.
- Candidate retrieval now considers a 45-day publication neighbourhood, plus existing FTS/vector candidates. Retrieval never establishes membership. Adjudication must link the same identifiable incident, dated visit, court proceeding or decision; direct testimony/responses/investigation findings can join an existing episode even from the same publisher or after a delay. Shared actor, region or ongoing project is insufficient. Malformed adjudication still fails closed; existing request budgets, batch limits, editorial leases and critic review remain.
- Candidate and writer evidence retain the beginning and recent development instead of newest-only contexts. SQL window strata retrieve early, recent and publisher-representative reports; a deterministic helper bounds model context to 24 reports (16 for candidate context), in chronological order. This does not claim every sentence of an arbitrarily large cluster fits into context.
- Writer summaries may use roughly 65–100 words when needed to establish origin, development and supported outcome. Key points must add detail. Original report excerpts accompany packet summaries, and retrieved dates are explicitly distinct from publication dates. Critic checks the whole episode’s scope, including origin/latest outcome. Existing published stories are not automatically rewritten by a preview deployment.
- ANTARA national/Papua are one publisher family for counts and cross-source agreement. Syndicated copies remain excluded from independent confirmation. A temporal-change citation must belong to the episode and, when the previous publication timestamp is available, have arrived after it; first publication cannot invent a change baseline. Optional unsupported/repetitive sections remain empty.

### Source coverage fixes and actual checks

Live HTML/feed checks on 28 October confirmed:

- `https://pusaka.or.id/feed/` returned a single 16 August workshop entry, whereas `/news/` and the homepage listed newer October reporting. Added bounded discovery of those verified news listings, restricted to `/news/` article paths; the listing itself and unrelated navigation are excluded.
- RNZ’s current article exposes its publication date in a `time dateTime` element, without the previously expected meta date. Added a scoped RNZ template fallback. RRI and Pusaka expose `NewsArticle.datePublished` JSON-LD; support that, `@graph`, publication meta/time markers and validation. `dateModified`, ordinary footer times, `WebSite` dates and obviously future dates cannot substitute for publication. Actual sampled templates are in the scratch directory; the RNZ sample concerned PNG and was used **only to verify HTML format**, not admitted to West Papua reporting.
- RRI discovery now starts at its verified `/papua` listing and ANTARA national at its verified `/tag/papua` listing, rather than their broad front pages. Source limits, relevance rules and inference quotas remain unchanged. Mongabay/Multatuli guessed Papua feeds returned 404/empty and were **not** installed as working feeds. Kalawai and other inactive sources still require a further diagnosis; this pass does not claim all 17 enabled sources are healthy.

### Preview and production boundary

Preview Pages uses the existing production engine service binding. The new native engine route supports filtering/ranking before pagination across published episodes and exposes all contributor roles/types. Until that engine version is released, the Pages adapter reads a **bounded latest 144-story collection**, cached for four minutes, selects before pagination, and retrieves contributors for the selected stories. The UI explicitly discloses that preview lookback when the collection is truncated. It never fetches only twelve mixed stories and hides the rest, and it never calls an LLM per lens/visitor. Native metadata selection currently reads the published-episode metadata collection; revisit SQL indexing/materialised desk membership as this small corpus grows.

Consequently the preview can demonstrate the full UI using real published stories without writing to production. Source discovery, date extraction and clustering/synthesis changes are tested engine code ready for release; they do not retroactively repair the existing production corpus. A bounded date repair/regrouping pilot should be reviewed separately before any bulk maintenance. No such pilot has been run here.

### Verification

- `scripts/tests/news-desk.mjs`: deterministic lenses/ranking, bounded collection selection beyond the first page, provenance families, current-template date fixtures, Pusaka article-only discovery, origin/recent/publisher evidence sampling and temporal-change citations.
- `scripts/tests/news-engine.mjs`: actual public engine route with all migrations in a local Miniflare D1, including selection before pagination, place intersections, regional/all pages, contributor roles and ANTARA family counts. Only the unused Workflow base class is stubbed; route SQL is real.
- These are part of `npm run check:system`; existing content, archive, polish, explorer and investigation checks remain required.
- `scripts/verify-interaction-polish.py`: four widths (1440/768/390/320), ticker height/reflow, Ask empty/answer/source/loading/stop/draft/focus/reading-position flows and News selectors/URL/Back using clearly identified fixtures. Browser evidence stored under `/workspace/scratch/interaction-build-2026-10-28/`. Ask/News fixture tests do not exercise live inference or prove real editorial quality. Actual low-RAM Samsung/Windows scrollbar behaviour remains a device review item.
- Re-run the existing investigative and final-polish browser checks before shipping preview, then record the deployment and live smoke checks below.

Final local verification passed: production build (364 routes), content validation, 77-item archive validation, all polish/system/explorer/investigation checks, four-width interaction fixtures with no page errors, 35 bilingual investigative browser checks, and 110 graph-document layouts across five widths plus the existing 16-group final-polish browser suite. Native ticker motion, keyboard persistent pause, reduced-motion/static links, film lazy loading/Escape, primary-page phone reflow and source-dialog Back were included. No product changes were needed after these final browser runs.
