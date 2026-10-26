# West Papua Watch

Read the current code before changing behaviour; older planning documents describe proposals as well as shipped features.

## Interface work

- Read `.agents/skills/design-taste-frontend/SKILL.md` for substantial public UI work. For the investigative Issues workspace, also read its `references/app-screens.md`.
- Read `docs/investigative-experience-revision-2026-10-27.md` for the current public Issues/case hierarchy and its verification notes.
- Follow `docs/TASTE_INTEGRATION.md` for project-specific choices. The user's established Instrument typography, restrained lilac palette, wordmark and editorial voice take precedence over generic skill palette/style bans. Keep the existing stack and accessible Base UI primitives.
- Check actual screenshots at desktop, tablet and phone widths, then revise. Preserve working routes, sources, bilingual content, keyboard operation and reduced-motion behaviour.
- Read `docs/research/investigations-2026-10-26/README.md` and `RESEARCH-BRIEF.md` when extending investigations. All twenty threads remain in scope; the first six are the current development slate.
- Every published investigative relationship needs evidence, a date/period, precise meaning and any material response or limitation. Offices, people, corporate groups and subsidiaries are distinct. Preserve transaction stage and amount basis.
- Normal editorial/case pages use the shared masthead and compact navigation. Do not reuse the Exhibition immersive body class: it locks normal scrolling. Verify actual wheel/touch input and overlay close/Back.
- Keep graph layouts bounded and deterministic; avoid continuous force simulation, automatic map-camera movement and multiple hidden WebGL maps. Support readable relationship/evidence lists and no-JavaScript access.
- History's reading UI and performance work are established. Do not redesign it incidentally while working on Issues.

## Delivery

- Work on `preview/investigative-explorer` for the current redesign; do not merge or deploy production without the user's instruction.
- Run the relevant content/investigation checks and a production build. Validate the built interface, including shared URLs, Back, empty search, source access and mobile reflow.
- Document research gaps and deferred work plainly; do not describe proposals as implemented or sources as fully audited when only sections were inspected.
