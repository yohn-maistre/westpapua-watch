# Hermes handoff

This repository is ready to push and connect to Cloudflare Pages. Preserve the
existing four-commit history and push `main` as-is.

## Repository

- GitHub: `https://github.com/yohn-maistre/westpapua-watch`
- Branch: `main`
- Visibility: public
- Commit author: `yohn-maistre <33504511+yohn-maistre@users.noreply.github.com>`
- Co-author trailer: `OpenAI Codex <codex@openai.com>`

If the repository was restored from the Git bundle, set the remote and push:

```sh
git remote set-url origin https://github.com/yohn-maistre/westpapua-watch.git
git push -u origin main
```

Use the user's existing GitHub authentication. Do not create, print, or commit a
personal access token.

## Verification

The project was validated with:

```sh
npm install
npm run check:content
npm run build
```

The build currently succeeds. A non-blocking Shiki/CSP warning may appear during
the Astro build.

## Cloudflare Pages

After the GitHub push, create a Pages project through Cloudflare's Git integration
with these settings:

| Setting | Value |
| --- | --- |
| Repository | `yohn-maistre/westpapua-watch` |
| Production branch | `main` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | repository root |
| Node.js version | `22` |

No deployment token belongs in the repository. Cloudflare account operations
should use OAuth through the MCP endpoints in `.codex/config.toml` when available.

## Context map

- `README.md`: product overview and local setup
- `AGENTS.md`: product, visual, engineering, and Cloudflare rules
- `docs/NORTHSTAR.md`: product direction
- `docs/DESIGN_GRAMMAR.md`: visual and interaction system
- `docs/ENGINEERING_PLUMBING.md`: architecture notes
- `docs/NEWS_PIPELINE.md`: ingestion and editorial pipeline
- `docs/DEPLOYMENT.md`: deployment procedure
- `docs/SECURITY.md`: security model and operational safeguards
- `docs/RESEARCH_NOTES.md`: research and sourcing notes

Before changing UI, read `AGENTS.md`, `docs/NORTHSTAR.md`, and
`docs/DESIGN_GRAMMAR.md`. Keep English and Papuan Malay routes first-class, keep
the site useful on low-end Android devices, and do not publish generated dossier
content without editorial review.
