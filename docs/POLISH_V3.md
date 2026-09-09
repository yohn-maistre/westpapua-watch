# Polish v3 handoff

Target: deployed main `36bf3d5f0271f515f5aaff0c693224f4c1a751f4`.

## Included

- Featured Topics followed by Land & environment, Rights & public life, and Culture & memory sections. Status boilerplate removed from cards; cleaner topic metadata and shared Library sections.
- History rebuilt into four editorial chapters, alternating dark and light sections, concise chronology, mobile-visible credited images, source disclosures and image enlargement. Large Swiss display typography retained.
- Base UI checkbox popovers replace Resources filter strips/native selects. Library / Pustaka naming, shared rows and metadata across static/live content, topic links, and better Ask retrieval.
- Compact mobile links restored to a single scrollable row with translucent navigation. Smaller map base controls, adjusted zoom/feature panels, Night → Malam.
- Conflict, displacement and reported military-presence layers with dated regional records, period selection and source links.
- Relevance gate repair, bounded cleanup of old explicit rejections, stable episode headlines, and validated episode-group partitioning.
- Additive Library migration and system regression tests in CI/deploy checks.

## Validation

Astro production build; content checks; Worker and Pages Functions compilation; existing public response regressions; new system tests covering relevance, partition validation, period filtering, Library normalization/date preservation, complete migration sequence, candidate SQL, relationships/API filtering and idempotent cleanup.

The Cloud Browser could not open localhost (`ERR_BLOCKED_BY_CLIENT`). Responsive rendering and real map network interaction are NOT visually verified here. Confirm on deployment: 360px mobile and desktop nav, long headlines, Library popovers, History images and enlargement, map base switches, conflict record list and period changes. Check the console/network if a tile layer fails.

## Deployment

Apply the bundle to the target main revision, review the staged diff, commit and push. Existing production CI applies migration 0015 before deploying the Worker, then Pages. Do not deploy the new Worker against a database without that migration.

Sixteen reporting-source configurations remain enabled. Their production feed health, completed two-week backfill, LLM decisions and quota behaviour were not verified during this pass. Use the existing `backfill-news.yml` workflow for a 14-day backfill after deployment if needed; do not repeatedly trigger it blindly. Existing candidate resources still require editorial publication.

Cleanup runs at normal checkpoints (three affected stories at a time). It only automatically repairs confident explicit negative relevance decisions; it is not a full historical recluster. More than 24 reports in a disputed cluster requires review. Model changes should be evaluated against the Nawipa visit and clearly unrelated reports after queues drain.

## Image provenance

- Noken photograph: Nurul Ichlasiah, 4 December 2017, CC BY-SA 4.0; Wikimedia Commons `File:Noken.jpg`.
- New Guinea Council delegation in Amsterdam: Jack de Nijs / Anefo, 7 September 1961, Nationaal Archief, CC0; Commons `File:Nieuw-Guinea_raad_in_Amsterdam_De_groep_op_de_binnenplaats,_Bestanddeelnr_912-9030.jpg`.
- Grasberg: NASA / ISS astronaut photograph, 25 June 2005; NASA Earth Observatory, “Grasberg Mine, Indonesia.”

Images are included unmodified, with their own dates and source/rights links. They are not presented as photographs of a different historical event.

## Scope deliberately retained

No forced universal graph database, new agent framework, numerical source-trust ranking or automated Exhibition publishing. The current architecture now has a shared item contract; full publisher catalogue reconciliation, work/edition identity and an editor-facing candidate-review interface are documented follow-ups.
