# History and Following refinement — 10 October 2026

Base: `624ca03d82d8bb537de6726d51eed2d40828ac5f`.

History is the production reader at `/history/` and `/id/history/`. It now groups 63 accounts into 37 chapters; the main chronology contains 33 chapters, including clearly identified landscape and regional context. Undated finds and living practices remain in specialist paths. They are not assigned prehistoric dates. `content/history-reading.json` defines the reading order, temporal kinds, panel membership and editorial overrides; the legacy numeric years in `history-explorer.json` do not determine the new chronology.

The global path selector chooses a reading path. Chapter arrows select a local perspective without changing that path. Chapters with two archaeological accounts use their places or subjects as labels. Existing account hashes work, and local selections have a `view` query parameter. Browser Back restores the selected panel. Source numbers open the corresponding entry in one bibliography; catalogue destinations sit inside that bibliography.

Every chapter has a source visual and geographic context. Photographs, research plates, source documents and a few explicitly labelled Watch diagrams use the Archive's canonical records and shared viewer. Contemporary work by identified makers links to Exhibition. Larger images load when the viewer opens; reading previews are small local WebP images. Dates attached to photographs and research publications are separate from the date of the historical account.

The inline History atlas uses the existing Natural Earth reference and source-linked place notes. MapLibre is imported and instantiated only when the reader expands the atlas. Hidden History maps receive no chapter geometry updates; resize follows the actual expanded canvas, not every chapter. The expanded node moves to the document body to escape the sticky sidebar's stacking context and returns on close, restoring focus and background interactivity. A reference plate remains available when the compiled geographic assets are absent. Individual failed raster requests do not remove the base selector. The shared expanded map controls now occupy one flexible top rail.

Merauke has **42 sourced milestones**: the MIFEE launch and early rights objections, all **36 entries** in Pusaka's November 2023–October 2024 chronology, and four subsequent stages in the Malind road-permit case through September 2026. Rice-field and sugar/bioethanol programmes remain distinct. Pusaka's findings and the litigants' accounts are attributed; uncertain photograph dates, inconsistent equipment totals and a mistranslated bioethanol unit are not presented as established facts. Month-only dates and date ranges remain visible as such. The reader can show selected entries or all entries; permalinks reveal an otherwise hidden entry.

The other seven followed cases have 32 sourced stages in total, adding education and humanitarian access, court proceedings, contractual development and post-revocation mining activity. Case navigation appears before the content; Current, Background, Timeline, News, Library and Places are direct anchors. The curated chronology remains separate from the AI worker's current-picture updates. Search and Ask retrieve the revised History accounts and precise, source-bearing timeline permalinks. No model routes, weekly-review generation, D1 schema or live snapshots were changed.

The Library's ninth feature is the canonical ANU Press volume, filling the desktop layout. The final odd feature spans both columns on phones. Compact-nav height retains fractional pixels and its surface is opaque, preventing the former seam and text bleed.

## Sources and provenance

- Pusaka chronology: https://pusaka.or.id/en/lini-masa/merauke-national-strategic-project-timeline/
- Later Malind case: https://www.greenpeace.org/southeastasia/press/69267/court-rejected-indigenous-malind-peoples-lawsuit-challenging-a-135-km-roadway-destroying-customary-forest/
- ANU volume and chapter plates: https://press.anu.edu.au/publications/series/terra-australis/west-new-guinea
- Mololo cave and artefact mirror: https://www.labrujulaverde.com/en/2024/08/archaeologists-reveal-how-early-humans-entered-the-pacific/
- Additional sources and original image URLs are recorded in `content/archive-media.json` and the case timelines. Chapter source pages were preserved rather than redrawn. Credits and source-specific licences remain attached.
- New documentary media uses the explicit `editorial` access mode with the project owner's authorization recorded. It is not promoted into the public-domain/CC self-host sync whitelist. An unknown rights status is not a claim of a licence.

## Verification

- Content validation and Archive validation (74 records).
- Astro production build: 352 pages.
- `check:polish`, `check:system`, `check:explorer`: include engine writer/critic/D1 regression checks, bilingual/citation contracts, chronological dates, preservation of all accounts and legacy links, catalogue references and source visuals.
- Chromium: stable initial chapter selection on repeated phone/desktop navigations; local versus global controls; browser Back; source-linked pin notes; source folds; legacy undated-account link; History and Following image viewers; all 42 Merauke entries; focus and node restoration after atlas close; zero WebGL contexts during ordinary History reading.
- Expanded overview map rail checked at 320, 390, 768 and 1440 pixels. No browser page errors in this pass.
- Library's nine-feature grid and timeline line/dot centres checked at 390 and 1440 pixels. Ask retrieval also runs without Astro's browser environment configuration.

Phone viewport checks are not measurements on a physical Samsung A12. Compiled production geographic datasets are absent in this checkout; remote raster requests also vary in this sandbox. The existing atlas integration remains in place, with the source plate covering the History case when those datasets are absent.
