# Watch v6 — editorial recovery and public records

Patch baseline: upstream `0660b686191db996ae71bb536d55bf297a357607`, checked 17 September 2026. This is incremental to the current repository, including the changes made outside the earlier conversation. Do not apply the older v5 bundle first.

## What changes

### Publishing

Each development receives its own editorial queue message. A malformed response therefore holds that development rather than a shared four-story batch. The dispatcher retains a four-development cap and orders eligible work oldest first, removing the preference that could starve unpublished stories. This can use up to four writer and four critic requests per dispatch cycle instead of one batched pair; provider backoff still applies. It is not an unlimited drain or a promise of free capacity.

Dispatches have a 30-minute lease. Expired dispatches are reclaimed on the next backlog cycle; editorial rejections without a dispatch are not silently republished. Duplicate deliveries cannot start a second writer. Failed obsolete jobs cannot clear newer dispatches. Publication and its synthesis record commit together, conditional on the current lease.

Critic output must contain the complete review contract. A pass with contradictory problem flags does not publish. Malformed critic output returns to bounded backoff; it does not bypass review. Existing route configuration is preserved. Production model availability and account quota have not been tested here.

`last_published_at` is separate from ingestion/check/retry timestamps. Migration 0018 initializes historical values from the latest stored synthesis for already published developments; that is a historical approximation, not a reconstructed audit log. Future successful publication writes the field directly.

### Library and organizations

38 organizations and collections now have stable identities, descriptions, destination links, and a washed-colour directory. Library organization filters use publisher IDs/explicit aliases rather than assuming the website hosting a file authored it. Counts derive from matching resources. On the Library page counts refresh after live records load; the standalone directory shows build-time catalogue counts. Unmatched organizations remain useful destinations without invented holdings.

The existing consolidated Library remains authoritative. This patch does not replace it with the original small fixture. Publisher, following, topic, type and organization remain distinct facets. Data records reuse Library rows without appending the entire live Library into a specific record.

### Data / Public record

126 initial records: 38 organizations, six provinces, 21 datasets/source directories, 15 documents and 46 collections. These derive from existing catalogue material and the supplied directory. EN/ID routes provide search, populated-type filters, record pages, linked Library material, source-backed relationships, and JSON downloads. Ask's site index can retrieve this catalogue metadata.

The shared schema accepts places, organizations, people, offices, programmes, projects, laws, documents, datasets, elections, observations and collections. Observations require units, period, geography, measurement role, method and provenance. Relations require their own source. Build validation checks identity and relationship targets.

Import reviewed JSON with `node scripts/import-records.mjs input.json`; add `--write` to upsert curated records by identity. Run the site build to validate against the complete catalogue. The importer accepts already normalized records, not arbitrary PDF or portal HTML.

**Scope boundary:** government feeds are linked, not synchronized. There are no populated officeholder, budget time-series, election-result or project ledgers yet. No numbers, appointments or legal effects have been fabricated to fill empty screens. Automatic BPS/DJPK/KPU/JDIH adapters, D1 storage for civic observations, comparison charts, and map/story record joins remain follow-up work. The generic record surface and import contract are implemented now; federation protocols and graph databases are not introduced.

### Exhibition

35 public entries, up from six; 94 additional research candidates retained as a separate research corpus. These are catalogue entries, not 35 newly licensed reproductions. Existing attributed imagery remains; new entries without cleared image rights use labelled abstract catalogue tiles and external source links. Candidate metadata comes from the user-supplied handoff and is not represented as independently verified in full.

Desktop outer lanes move inward, hover/focus magnification is restrained, mixed media alternate within lanes, and pause/reduced-motion handling is retained. The catalogue now has text search. No images were scraped around access restrictions, and no permission requests or outreach were sent.

### Existing fixes retained

The current upstream map controls, Current preset, ID routes, safe Ask Markdown rendering, Library covers and Following layout are preserved. No additional map dataset was added in this patch; Data links surface existing datasets without pretending they are rendered map layers.

## Hermes deployment and recovery

1. Capture `node scripts/diagnose-editorial.mjs` output using the existing `WATCH_ADMIN_TOKEN` environment variable (optional `WATCH_SITE_URL`). The script only reads status and redacts credential-like keys. Never include secrets in the handoff.
2. Apply the patch on a branch based on the stated upstream commit, or reconcile later upstream changes explicitly. Run the checks below.
3. Apply migration 0018 **before** deploying the changed Worker. Use the repository's migration/deployment workflow and existing credentials.
4. Deploy Worker and Pages from the same patched revision. Confirm `AUTO_PUBLISH` and the configured critic route from authenticated status.
5. Use the existing synthetic `scripts/probe-critic.mjs` against the configured gateway routes if the critic is still failing. This makes actual model calls, but writes no stories. Compare valid schema output, correct rejection of unsupported claims, latency and provider errors. Do not choose a model merely because its label says free.
6. Observe a normal scheduled cycle. Confirm that expired leases fall, eligible pending work advances, writer and critic telemetry succeed, and `last_published_at` advances only after publication. Queue recovery cannot solve exhausted quota, missing credentials or disabled auto-publication.
7. Return sanitized before/after status and probe output if publication remains stuck. That production evidence is needed to distinguish a provider/configuration problem from queue scheduling. Do not mass-force publication or delete rejected reviews.

## Verification

Passed locally: content checks, polish checks, research checks, system checks including all D1 migrations, targeted recovery tests, Astro build (324 pages), Worker bundle, and Pages Functions compilation. Recovery tests cover expired/fresh leases, oldest-first scheduling, one development per message, duplicate deliveries, send-failure release, required provenance, incomplete observations, and atomic refusal of stale publication.

Browser screenshot verification was unavailable: the browser executable download was blocked in this environment. Mobile and desktop CSS were reviewed and built, but pixel-level rendering remains a preview check for Hermes. Production deployment, credentials, model free-tier status, and actual new publication have not been verified here.

Commands:

```sh
npm run check:content
npm run check:polish
npm run check:system
node scripts/tests/research.mjs
node scripts/tests/recovery.mjs
npm run build
```
