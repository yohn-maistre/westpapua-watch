# West Papua Watch

Production-minded Astro scaffold for the West Papua Watch direction.

## Routes

- `/` — Now
- `/issues/` — living issue dossiers
- `/history/`
- `/resources/`
- `/events/` — programme + SOS Papua campaign material
- `/exhibition/view/` — immersive scroll-controlled exhibition
- `/exhibition/` — accessible artists/works/credits index
- `/pmy/...` — Papuan Malay routes
- `/api/ask` — Cloudflare Pages Function, source-bounded LLM assistant
- `/llms.txt`, `/site.json`, `/search.json`, `/feed.xml` — agent/search surfaces

## Start

```bash
npm install
npm run dev
```

Build:

```bash
npm run check:content
npm run build
```

Cloudflare local preview with Pages Functions:

```bash
npm run cf:dev
```

## Design

The opening masthead exposes the entire information architecture immediately. As it leaves the viewport it becomes a translucent compact navigation bar. `Exhibition` enters the immersive image-field route directly; the standard exhibition index remains linked from that view.

Typography is self-hosted Instrument Sans + Instrument Serif. There are no required analytics, remote fonts, component frameworks or WebGL dependencies.

## Content

Launch content is intentionally stored in typed source files under `src/data/`. It is easy to inspect, review and commit. The future aggregation pipeline is decoupled from the public site and documented in `docs/NEWS_PIPELINE.md`.

## Deployment / security

Read:

- `docs/DEPLOYMENT.md`
- `docs/SECURITY.md`
- `docs/NEWS_PIPELINE.md`
- `AGENTS.md`

The included GitHub Action can deploy the built `dist/` directory directly to Cloudflare Pages on every push to `main`.
