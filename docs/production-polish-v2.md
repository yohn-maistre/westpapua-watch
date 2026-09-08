# Production polish, second pass

Baseline: remote main `449272a6beb747a638683b5a27bf9b483ab8b2c4` (checked before packaging). This patch is incremental; do not reapply the first bundle.

## Changes

- Navigation: content-sized compact background, removed conflicting mobile overrides, full-width masthead distribution, Home and Exhibition star in both menus. Narrow screens use two rows of links instead of shrinking text or showing a scrollbar.
- News: content-driven overlay cards and headline sizing. `/news/` and `/topics/` are canonical; edge redirects preserve old paths, locale, query strings and browser fragments.
- Map: continuous EOX Terrain Light Atlas instead of the cropped hillshade plate; Black Marble uses the provider-advertised `g` matrix, not `GoogleMapsCompatible`. Night lights are a composite, not a live electricity measurement. Infrastructure gains optional OpenStreetMap road/label overlay at zoom 9+. Climate is now a selectable preset. Presets open upward from one card. Layers and Perlebar are aligned; the Location overlay is removed.
- Clustering: retrieve candidate episodes over 14 days, inspect member-report evidence, and allow directly connected visit stops, statements and reactions. Same person/place alone is insufficient. Reconciliation uses a new review signature so old rejected pairs can be reconsidered. The critic uses the same episode definition. What changed is requested relative to the prior synthesis; first publication should be empty.
- Ask: one index shared with the actual site data, covering history, glossary, topics, timelines, events, exhibition descriptions and resources alongside live reporting. Bounded multilingual query rewriting for longer questions/follow-ups; basic Markdown rendered through safe DOM construction. Prompt distinguishes scope limits from missing evidence and follows the question’s language. Existing model gateway remains in place; no new agent framework dependency.
- History: eleven sourced bilingual introductory chapters, chapter navigation, desktop date stage and a linear mobile reading layout. Papuan perspectives and agency are explicit; official records and movement positions are attributed. Detailed MIFEE chronology remains on its topic page.
- Resources: seventeen researched additions and independent type/format/topic/language filters. Metadata does not imply full-text access or free viewing. Exhibition remains manually curated.
- Sources: sixteen registry entries enabled (previously five), including Lao-Lao, Nadi Papua, BBC Indonesia, RNZ Pacific, ABC Pacific, RRI, ANTARA, Pusaka, Human Rights Monitor, Kalawai and Papuan Voices. ACLED remains disabled because structured data access needs a separate integration. Enabled means discovery will be attempted, not that every upstream feed is healthy.
- Backfill: manual GitHub Action calls a narrowly scoped, authenticated Pages-to-Worker proxy. Discovery is bounded, interleaved across publishers and queued gradually. Article publication dates are checked after extraction; unknown/out-of-window dates are skipped. Sitemap last-modified dates are no longer reported as publication dates.

## Hermes handoff

1. Start with a clean checkout of main at the baseline above. The supplied apply.sh checks this and stages the patch, without installing packages or building.
2. Review the staged diff, commit and push normally. No force push.
3. Wait for CI and the Cloudflare deploy workflow to finish. Existing secrets and bindings stay in use; no database migration is added by this pass.
4. In GitHub Actions choose **Backfill reporting**, Run workflow, days **14**. It requires the existing `WATCH_ADMIN_TOKEN` repository secret to match the deployed engine secret.
5. The action returns a Workflow instance ID. Success means queued discovery, not that all stories are published. Normal scheduled editorial checkpoints drain the ingestion backlog.
6. Check source counts and pipeline status after the queue drains. A backfill run is capped at 480 new URLs. Repeat if needed; already-known URLs are skipped. Upstream feeds may expose less than fourteen days, and undated pages are deliberately excluded.

## Verified locally

Content checks; Astro build (54 pages); Pages Functions compilation; engine bundle compilation; bounded chat history; old-route redirects with locale/query preservation; real edge HTML rewriting and story 404; whole-site History/MIFEE/resource retrieval; Markdown formatting without HTML execution; pagination forwarding; explicit empty map layers.

## Remaining deployment checks and limits

No direct push or live backfill was performed: the connected GitHub integration denied repository writes (403) in this session. The map endpoint correction was checked against EOX WMTS capabilities, but device rendering and tile availability still need the deployed phone check. No new screenshot of this local build was obtained. LLM clustering quality needs review on the imported corpus; this code change cannot guarantee that every existing singleton has already merged.

The history is a sourced introduction, not an exhaustive account. It uses a typographic stage, not newly licensed archival photographs or AR. Resource discovery candidates still need publication review; adding a publisher does not automatically promote every item into Resources. No new smoke forecast, ENSO raster, or coral layer was fabricated: existing fire, forest, water and rainfall layers retain their availability metadata and external climate context links. Ask searches indexed page content and resource descriptions; it does not crawl full external books or films on demand.

Some old topic memberships may reflect earlier loose relevance rules. This pass narrows grouping and adds the corpus for inspection; it does not silently delete historical relations. The existing maintenance/reindex workflow can be reviewed separately if misassigned material remains.

## Research record

History and resource entries carry their own source links in `content/history.json` and `content/reference-sources.json`. The principal source groups are UN records; Human Rights Watch historical reporting; Emma Kluge and John Saltford’s research; AJAR and the Papuan Women’s Working Group; UNESCO; the ULMWP’s own documents; and the Muman Minggil documentary listing. Political views are attributed, rather than presented as unanimous Papuan opinion.

Map reference: https://maps.eox.at/ and its WMTS capabilities at https://tiles.maps.eox.at/wmts/1.0.0/WMTSCapabilities.xml. Black Marble advertises the `g` matrix; Terrain Light and the road overlay advertise `GoogleMapsCompatible`.
