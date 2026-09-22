# Watch refinement — 22 September 2026

Apply this revision to GitHub main `37fdb70384062a79796014ea3c8bf3d3f9bdcb38`. It follows the earlier restoration, which is already present in that commit. No database migration is needed.

## Visible changes

- Mobile Following headline now occupies one compact row. Swipe left or right to change headline, hold to pause the timer, hover or focus to pause on pointer/keyboard devices. Reduced-motion users see a stationary headline. The watercolor wash continues to transition when the headline changes.
- Home Following tiles use the same seven-case palette registry as the Issues view; the broad-Issues override no longer covers their colors.
- Data sections have shorter headings and no repetitive description where units, year, legend and source already state the meaning. Conflict estimates now sit in distinct textured panels with their scopes intact; the new six-province September 2025 BPS poverty series uses a common 0–30% chart with individual source links. No distinct displacement estimates are added together.
- Exhibition lanes now follow each item's `works`, `voices`, or `archive` metadata (the old round-robin was mixing them). The immersive view now includes the catalogue records previously filtered out, which caused the same few photographic works to loop repeatedly. Each source-only item gets a deterministic abstract plate, clearly a graphic placeholder rather than an image of the work. Three new Asmat / Cenderawasih Bay Met collection records have links to the original metadata; their images remain at the museum.

## Engine work and follow-up

- `ANTARA News Papua` has an official regional RSS feed in the source registry as its own publisher, retaining the existing national ANTARA publisher and exposing ownership. The feed is listed at https://papua.antaranews.com/rss/ . All configured feeds still pass through relevance and publication checks.
- Authenticated `GET /review/sources` returns per-publisher ingested article count, most recent ingestion, published article and story counts, and deferred relevance count. It has `no-store` caching and requires the same Worker secret as `/review/status`. Compare this with per-source discovery logs after deploy to determine whether the bottleneck lies in discovery, extraction, relevance, clustering, or editorial admission. The existing registry listed Jubi, Suara Papua, Aneta Papua, Mongabay Indonesia, Project Multatuli, Lao-Lao Papua, Nadi Papua, BBC Indonesia, RNZ Pacific, ABC Pacific, RRI, ANTARA, Kalawai, Pusaka, HRM and Papuan Voices as enabled; enabled does not mean successfully publishing.
- Recent duplicate reconciliation now also considers shared recorded places when FTS misses differently phrased reports. The existing model still adjudicates whether two reports cover the same dated episode. It will need a normal cycle after deployment to check the Samboga pair; do not manually conflate differing claims or alter archived text. If still split, provide the two story IDs, both `/development/{id}` payloads and the corresponding `cluster_pair_reviews` decision for a targeted repair. No cycle or production reindex was run from this workspace.

## Data sources

BPS official province releases for September 2025 poverty rates:

- Papua 17.82%: https://papua.bps.go.id/id/pressrelease/2026/02/06/1398/profil-kemiskinan-provinsi-papua--september-2025.html
- Papua Barat 19.58%: https://papuabarat.bps.go.id/id/pressrelease/2026/02/05/1158/pada-september-2025--persentase-penduduk-miskin-papua-barat-sebesar-19-58-persen--menurun-1-08-persen-poin-terhadap-maret-2025-.html
- Papua Selatan 19.26%: https://papua.bps.go.id/id/pressrelease/2026/02/06/1400/poverty-profile-of-papua-selatan-province--september-2025.html
- Papua Tengah 29.45%: https://papua.bps.go.id/id/pressrelease/2026/02/06/1395/profil-kemiskinan-provinsi-papua-tengah--september-2025.html
- Papua Pegunungan 27.21%: https://papua.bps.go.id/id/pressrelease/2026/02/06/1393/profil-kemiskinan-provinsi-papua-pegunungan--september-2025.html
- Papua Barat Daya 17.50%: https://papuabarat.bps.go.id/id/pressrelease/2026/02/05/1161/in-september-2025--the-poverty-rate-in-papua-barat-daya-was-17-50-percent--decreasing-0-45-percentage-points-compared-to-march-2025-.html

Met object records: https://www.metmuseum.org/art/collection/search/311201 , https://www.metmuseum.org/art/collection/search/311994 , https://www.metmuseum.org/art/collection/search/311560 .

The public source data is dated snapshots. Source status, story merging, and publisher mix require production telemetry after deployment. The browser screenshot pass could not be completed locally because this workspace has no working headless Chromium binary; validate mobile header, Data and Exhibition on a real device after applying the patch.
