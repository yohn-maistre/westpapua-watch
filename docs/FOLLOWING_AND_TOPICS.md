# Following and Topics — September 2026

## Public structure

Topics are broad categories. Following is an editorial selection of persistent stories. A news Story is a bounded event or unfolding episode; its reports remain separately attributed.

The Topics cover contains four larger Following tiles, three smaller selected tiles, then an open directory of broad Topics. There is no automatic urgency promotion and no third grouping taxonomy. Category pages contain news and library material, without nested topic cards. Persistent pages retain background, reporting, references and the map. Existing URLs are preserved, including Sentani's regional page, but Sentani is removed from cover selections.

Selection lives in `src/data/topic-collections.ts`. New persistent records and short sourced background live in `content/following.json`; existing PSN and Raja Ampat records remain in `src/data/dossiers.ts`. Library uses those same references. The subject dropdown separates Following and Topics.

## Editorial selection and evidence

- **South Papua food and energy projects:** keep distinct programmes and decisions in the existing sourced timeline; do not treat any event in Merauke as project-related.
- **Nduga conflict and displacement:** a specific long-running situation, rather than all conflict across Papua. [HRM's March 2026 update](https://humanrightsmonitor.org/reports/idp-update-march26-more-military-trigger-new-displacements-and-dampen-the-prospects-of-return/) describes prolonged displacement since 2018. Its estimates remain attributed and dated.
- **Raja Ampat mining:** retain the existing Greenpeace, Mongabay and other indexed source material, with mining evidence required for membership.
- **Freeport and Mimika:** mining and river tailings need their own sustained subject. The [2024–2025 external environmental audit](https://www.fcx.com/sites/fcx/files/documents/sustainability/audits/2024-2025PTFIEnvironmentalAuditExec.pdf) is company-published provenance, not a substitute for community accounts or independent research. Expanding those perspectives is the next research priority.
- **Awyu customary forests:** selected smaller subject. [Mongabay's March 2025 reporting](https://news.mongabay.com/2025/03/indonesian-court-blocks-palm-oil-expansion-but-leaves-indigenous-land-rights-in-limbo/) distinguishes the MJR/KCP cases from IAL. [Greenpeace's November 2024 statement](https://www.greenpeace.org/southeastasia/press/66530/dark-day-for-indigenous-forests-in-tanah-papua-as-supreme-court-rejects-awyu-tribes-final-appeal/) documents the community/coalition response to the separate IAL case. Do not imply these different rulings contradict each other or establish today's legal status.
- **Puncak and Intan Jaya displacement:** selected smaller subjects, grounded in the existing [HRM June 2026 update](https://humanrightsmonitor.org/reports/idp-update-june26-government-neglect-drives-west-papuas-spiraling-displacement-emergency/). These are dated monitoring sources, not live displacement counts. Puncak Jaya is not treated as Puncak.

Size indicates editorial placement, not a numerical severity score. Smaller tiles can be changed by editors as coverage develops. The research pass establishes sustained relevance, not an exhaustive ranking of every important subject in Western New Guinea.

## Engine

`shared/following.ts` requires direct subject evidence; place alone cannot assign a persistent story. Migration 0016 creates the new persistent records, maps them to Topics and conservatively links existing reporting. It preserves previous records. Future ingestion uses the same scopes; the persistent-page API also excludes unsupported legacy links and their reports/deltas.

Episode candidate retrieval now considers member-report text, places, organisations and people rather than relying on the latest report. The LLM still decides event identity: a dated visit's promises and responses can belong together; merely sharing a politician or region cannot merge events. Extraction guidance names the broader episode, and existing synthesis guidance retains a concise episode headline. Reconciliation fingerprints include member evidence so an earlier rejected pairing can be reconsidered when evidence changes. No claim is made that live model quality is guaranteed by deterministic tests.

## UI and API repairs

- Map base switch anchored top-left, controls move to a second row on narrow map containers. Opening the upward preset menu temporarily hides the period panel, preserving its selection. Extraction fills strengthened; Overview requests FIRMS thermal detections by default. Existing availability and observation-time handling remains in effect.
- Visible EN/ID labels preserve existing /pmy routing. Ask gains a restrained speech icon. Library chevrons use SVG and rotate with popup state.
- Homepage news columns stretch together and use a shorter lead excerpt. Full headlines remain visible. Home/News use real loading states with no fixture text, and honest failure states.
- API middleware normalizes unexpected HTML responses, including bodies incorrectly labelled JSON. Ask retains the question for retry. This fixes the raw JSON parser symptom; it does not establish the cause of the production outage.
- Discovery failure does not prevent dispatching existing editorial work; dispatch precedes optional cleanup. Public engine health reports database availability, last ingestion and last publication timestamps.

## Validation and limits

Build, content checks, system tests, Pages compilation and Worker bundling were run locally. System checks cover all migrations, strict scope examples, API HTML responses and member evidence contributing to candidate retrieval. Both language category routes were checked in generated HTML. No live model calls or production database mutations were performed. Mobile/desktop rendering on the deployed site remains to be reviewed; no browser screenshot verification is claimed.

The upstream baseline is `23cc198a093e2046ab12e1907217b748636e404e`. The newer library keeper is preserved. GitHub CI and deployment for that baseline succeeded; a successful deployment alone does not establish ingestion health.
