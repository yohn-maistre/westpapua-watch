# ETNOS forum + Watch integration lab

## Decision and scope

Branch: `feat/etnos-forum-explore`. Experimental entry: `/etnos/`.
Owner direction: forum first, backed by pyfedi/PieFed; Explore combines news,
wiki/reference material and other discovery, with one anchored map whose layers
change with the selected section. Owner subsequently authorized publishing an isolated preview. Existing Watch routes and editorial engine stay intact.

The design source is the supplied ETNOS Design Lab v3 HTML. Use its restrained
warm surfaces, Instrument type, separation of visual axes and responsive shell,
not its invented sample posts or claims of operational federation.

## User experience

- Forum is the initial destination, not a newsroom landing page with a forum link.
- Explore is a second destination: news, wiki/context and library share a stable
  map container and geography, but have distinct content provenance.
- Switching sections updates map features/legend, not the map instance or camera.
- On mobile keep the anchored map compact enough to leave useful list space.
  List access must survive WebGL failure and missing geocodes.
- Not every resource has a location. Never manufacture a coordinate just to make
  a layer look populated. Distinguish regional context from incident locations.
- News links preserve Watch story identity and sources. Discussion is not evidence.
- A curated reference index is not an editable wiki. Label its current scope.
- Missing forum configuration, errors, empty feeds and unsupported write actions
  must be explicit; do not display sample activity as live community activity.

## Integration boundaries

`honai-metro` is a SvelteKit/Photon client, not a Python backend. Its documented
PieFed contract uses `/api/alpha/`; confirm compatibility against the chosen
pyfedi deployment before authentication or write features. No owned backend URL
was supplied for this pass. Public piefed.social is a separate existing service,
not an ETNOS-owned backend.

Reusing its information architecture and API contract does not mean copying its
entire Svelte runtime into Astro. Keep small adapters separate from rendering.
Read-only integration is the first slice; existing Photon forum functionality
must not be represented as migrated until login, posts, replies, pagination,
community navigation, moderation and permissions actually work end to end.

Honai reference: local repo at commit `d247957e`; inspect source rather than
trusting old readiness claims. `docs/CODEBASE_GROUNDTRUTH.md` and `CLAUDE.md`
document unsupported PieFed methods and historical sample-data surfaces.
Photon/Honai is AGPL-3.0-only: any later source port requires retaining license,
notices and applicable source obligations. Do not blindly copy its auth storage.

Watch remains the editorial system: no schema migration, queue, writer/critic,
provider-route or production data changes are part of this lab.

## Preview preparation (NOT deployed)

Dedicated workflow: `.github/workflows/etnos-preview.yml`, triggered on pushes to this
feature branch; manual dispatch retains `deploy=false` by default. It validates and builds an
artifact. Publishing via feature-branch push is now authorized; manual runs publish with `deploy=true`.

Dedicated target project: `etnos-watch-lab` (not created by this work).
Config: `wrangler.etnos-preview.jsonc`, intentionally without production D1,
R2, service bindings or model credentials. No worker deployment or migration.
Credential access still uses the existing protected GitHub `production`
environment; create a dedicated preview environment/token before broader use.
Cloudflare project-level preview bindings and secrets must also be inspected
before first deployment: config alone is not proof of remote isolation.

Intended branch alias, not a verified live URL:
`https://etnos-forum-explore.etnos-watch-lab.pages.dev/etnos/`.
Create/verify the separate Pages project only after approval. Preview deployment
must fail rather than silently fall back to the production Watch project.
Other inherited Watch routes may lack backend services in this isolated project;
the ETNOS read-only endpoints must not rely on production service bindings.

Production deployment is now guarded to main even on manual dispatch. The old
Watch preview workflow excludes main and this ETNOS branch so it cannot be used
accidentally for this experiment.

## Acceptance before sharing a preview

1. Native focused tests pass; CI installs/builds Astro and compiles Pages functions.
2. Inspect rendered desktop/mobile layouts, keyboard navigation, long headings,
   loading/errors, back/forward navigation and reduced motion.
3. Verify the exact Pages URL, JS/CSS assets and read-only upstream responses.
4. Open Explore, move the map, switch news/wiki/library and confirm camera retention,
   truthful legends and no duplicate map initialization.
5. Confirm no production bindings, migrations, queue writes or model calls.
6. Test forum against the selected pyfedi instance separately before claiming
   forum authentication, replies, voting or moderation are migrated.

Do not equate a compiled shell with a completed forum migration, or a successful
preview upload with a healthy backend. Full local builds are deliberately deferred
to CI on this constrained host; no dependency installation is needed for planning
or the native adapter tests.
