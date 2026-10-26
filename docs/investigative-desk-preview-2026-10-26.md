# Investigative desk preview

Branch: `preview/investigative-explorer`. Production/main is not changed by this work.

## Scope

Issues now opens a shared investigation workspace instead of the previous large opening and gradient-tile directory. Six bilingual case files cover Merauke, political access, military business, Freeport, Kiwirok and information control. The edited record contains 42 supported claims, 56 participants and 34 registered source/reading entries. All twenty research threads remain in the Research index and the repository programme; queued threads are not described as completed investigations.

Desktop uses a case index, broad connection scene and reading/evidence pane. Phone and portrait tablet use one legible relationship at a time with local previous/next controls, a full relationship list and the same reading content. There is no continuous force simulation, per-query LLM call, map-camera movement or hidden WebGL map.

Name/alias/related-term search, timeline and original source lists work across the six files. Shared entities and claims link to their other case contexts. Case, view, participant, claim and source-sheet state survive URL sharing, reload and Back. Invalid/stale identifiers cannot show another case's evidence. Currency records retain period and transaction/accounting stage; ordered machinery has no fabricated price.

Sources have section/clause locators. Five selected records include short original-language passages, separated from Watch's bilingual summary. Other references link to the source and its locator without an invented excerpt. The source sheet uses Base UI focus/dismissal behaviour; the ordinary Ask dialog is reused.

The original topic directory and existing topic URLs remain. No-JavaScript reading includes all six narratives, supported claims and source links. The 42-entry Merauke chronology, established History UI, Homepage Atlas and original case pages are retained.

## Research and maintenance

- `content/investigative-record.json`: reviewed source/claim/case data, separate research threads, explicit source families, original passages and preset scenes.
- `src/data/investigative-record.ts`: server-only archive-media adaptation; the client does not import the entire History/Library/archive corpus. Actual image dimensions reserve media space.
- `src/lib/investigations.ts`: bounded search, source membership and validated URL state. People, offices, communities, corporate groups and related search names remain distinct.
- `InvestigativeDesk.tsx` and `investigative-desk.css`: shared reader, scene, source sheets, search, keyboard controls and responsive composition. The workspace is inert/aria-busy until hydrated; no-JS has its own equivalent reading.
- `docs/research/investigations-2026-10-26/`: the twenty-thread brief, information model, queue, initial source/query registers and the later `DEEPENING.md`/supplemental ledgers.
- `.agents/skills/design-taste-frontend/`, `AGENTS.md` and `docs/TASTE_INTEGRATION.md`: pinned Taste Skill installation and project-specific guidance. Preserve the established type/palette rather than applying generic palette bans site-wide.
- `src/data/search.ts`: the new public accounts and claims enter the build-time retrieval corpus, including original URLs/locators. The bound production Watch Engine retains its own bundled corpus until its next normal rebuild/deploy; this Pages preview does not redeploy it. No AI route, model, quota, cron or database-schema changes were made.

## Quirks resolved

- Multi-part React text inside an SVG `title` produced a hydration mismatch because the browser parsed its server output differently. Keep each SVG title as one interpolated string. Do not suppress hydration warnings to conceal this.
- BaseLayout's locale-link script changed React-owned anchor hrefs before hydration. It now leaves island anchors to LanguageControl, which already preserves current query/hash state on activation.
- Shrinking a whole network on phones produced illegible labels. The focused relationship view preserves readable names and 44px controls without blocking page scroll.
- Node layout initially left labels cramped while wasting surrounding space. Scenes are now authored presets, not an unstable runtime simulation.
- Long rupiah amounts need the full amount row rather than sharing a narrow column with their label.
- Existing tests expected the old “Browse topics” copy. The directory check now accepts the new “All topics” label and still requires the topic anchor.

## Verification

The 358-route production build and content, polish, system, explorer, investigation and 77-item archive validation passed during implementation. The new integrity suite verifies all twenty threads, bilingual supported claims, source membership, person/office/community distinctions, financial semantics, URL validation, original evidence in retrieval and bounded client imports.

The browser matrix covers all six cases and three views in English/Indonesian, original source links, source-sheet reload/Back, name aliases, keyboard entity selection and search, cross-case navigation, twenty-thread index, mobile navigation at 768/390/320px, Ask opening and no-JS reading. The production matrix completed without page exceptions after the hydration fix. The final local matrix passed 19 grouped checks with no page errors. Publication notes distinguish local checks from remote CI/deployment status.

At 320px with 6× CPU slowdown and text enlarged to 125%, the checked page had no horizontal overflow, page exceptions or map canvases. This is emulation, not a Samsung A12 hardware measurement. Frame-wait samples are diagnostic and must not be presented as INP or a 60fps guarantee.

Taste's production inspector reported zero failures at 1440/768/390px and one below-fold warning. That warning concerns the retained long topic directory below a deliberately full-height investigative workspace; moving every topic above the canvas would defeat this screen's main task. Lint's shadow warnings concern actual floating menus/dialogs. Neither result is a claim of accessibility conformance or an external design award.

## Visual review

The final desktop/tablet/phone captures were inspected after the automated report. The quieter 24px opening makes the case index and search immediate. Preset desktop scenes leave room to read each relationship; the phone composition shows two endpoints with local arrows rather than shrinking the whole network. Source excerpts, the long currency rows and enlarged text were checked separately. Colour marks the active record; editorial photos remain credited, and counts come from the record. The retained topic directory is secondary and below the workspace. The six-case 320px/125% text/6× CPU pass completed without overflow or page errors. The interface is ready for preview review; a larger all-case network and more original records remain separate work.

## Next scope

Continue original corporate/financial records and the open questions in the research ledger. A larger global network, reviewed incident/concession geometry, saved selections, broader reverse citations and assisted research/contribution intake remain future work. Keep new allegations as research leads until supported and reviewed; do not fill missing transfer, donation, ownership or command links for visual continuity.
