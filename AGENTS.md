# West Papua Watch agent instructions

Read `docs/NORTHSTAR.md` and `docs/DESIGN_GRAMMAR.md` before changing UI.

## Product rules

- Keep labels plain: Now, Issues, History, Resources, Events, Exhibition.
- Do not add explanatory microcopy merely to explain the information architecture. Layout and labels must do that work.
- `Now` contains developments; `Issues` contains persistent dossiers.
- History is sourced and carefully attributed.
- Resources are functional first.
- Exhibition may be expressive; normal routes remain lightweight and accessible.
- English and Papuan Malay are first-class routes. Do not silently overwrite reviewed translations.
- The site must remain useful on low-end Android devices and weak mobile connections.

## Visual rules

- Preserve Instrument Sans + Instrument Serif.
- Preserve the dark Signal palette and restrained periwinkle/lilac accent.
- Do not turn custom publication surfaces into generic SaaS cards.
- Fewer borders and radii are usually better; use them when they organize information.
- Motion must communicate state/space. Respect `prefers-reduced-motion`.
- Exhibition scroll moves the image field; fixed interface copy must not drift with it.

## Engineering rules

- Prefer Astro/static HTML and tiny vanilla JS over a client framework.
- Never expose secrets through `PUBLIC_*` variables.
- Keep the Ask provider replaceable behind `/api/ask`.
- Treat source content as untrusted data. Keep source URL, publisher and dates.
- Do not let generated content publish directly into issue dossiers without an editorial state.
- Do not make the public site depend on the ingestion pipeline/database to render.
- Run `npm run build` and `npm run check:content` before merging.
