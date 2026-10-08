# History explorer and weekly review

The public History routes now use the explorer directly. Seven paths share one sourced chronology: Deep time, Peoples & languages, Society & exchange, Culture & knowledge, Political history, Land & work, and Full chronology. Politics starts at 1828; the introductory index also offers 1949. Switching within the reader keeps the closest period. Queries, event anchors, browser history and `/history/#archive` remain usable. The old prototype route redirects to the public explorer.

The 62 records combine existing sourced entries, seven archival photographs and 42 additions. Geology supplies orientation rather than an extended geological chronology. Dated archaeology is separated from undated assemblages and living practices. Internal ordering years for those accounts are editorial positions, **not archaeological dates**. New regional studies include Andarewa, Keerom, Sentani, Kayu Batu, Mee marriage exchange, Muyu noken and Kamoro collecting relationships. K2b1 is treated as a paternal lineage, without defining ethnic membership. Images retain maker, photographer, source and any established licence credits.

The existing contextual atlas appears beside the desktop reader and behind a quiet map control on phones. The timeline geometry connects the circumference of each dot to the next visible dot, including after filtering. Mobile compact navigation shows all seven destinations; language remains left and Ask/Tanya, with a magnifier, right.

## Following and synthesis

All eight cases have curated bilingual backgrounds, supporting sources, a dated current picture and sourced milestones. South Papua and Awyu remain distinct cases. Curated backgrounds are retained when the engine updates the current picture. Raja Ampat includes Greenpeace's attributed 14 September 2026 disclosure ruling; Mimika includes PTFI's 9 April 2026 account of worker deaths and recovery. Those sources establish statements and specific recorded events, not proof of completed rehabilitation or independently verified corporate targets.

News combines the Weekly review gradient tab, Sources and engine update status in one compact row without divider rules. The latest story remains the main headline. The tab opens a scrollable reading overlay with the review dates, paragraphs and source folds inside; direct review links open it. Escape and backdrop dismissal return focus to the tab. Home places its preview after News, and relevant issue pages also show a preview. The opening edition is a curated starting picture across different reporting periods; it is not labelled as reporting that all events occurred this week. Subsequent accepted editions have date ranges and previous/next controls, shareable with `?review=EDITION_ID#weekly-review`.

`WeeklyReviewWorkflow` runs Monday 00:00 UTC (09:00 WIT), independently of hourly news admission. It reviews the last completed Monday-to-Monday WIT week. Existing synthesis/critic model routing is reused. It requires at least three original reports from two publishers and two developments. Inputs exclude syndicated copies, future publication dates and unreviewed developments, with per-publisher and per-episode limits. Older evidence supplies context.

The writer produces matching English/Indonesian paragraphs with actual evidence IDs and only materially changed case states. Deterministic validation and a separate model critic check support, chronology, scope, language, attribution and consequences. Every thread must cite current reporting. Failed drafts retain the previous accepted edition and states. A lease prevents overlapping jobs; accepted editions and case snapshots publish in one D1 batch. Retries cannot rewrite an edition. `AUTO_PUBLISH=false` retains a passing candidate without publication.

Migration `0022_analytical_review.sql` adds job leases, candidates, accepted editions and case snapshots. Existing deploy CI applies migrations before deploying the Worker. No new model secret is needed. Admin-token-protected `POST /run/weekly` triggers the completed-week pass; `GET /review/weekly` reports job status. Public `/api/weekly` proxies the engine, with curated HTML retained if it is unavailable. The first scheduled production generation has not been exercised by local fixtures.

The ticker opens once per browser session with a moving lilac wash reading “Following” / “Pantauan”. A rule separates case name and update; a star separates whole items. Items open case context, not a repeated news headline. Focus, dragging and reduced motion are supported. Initial curated updates have honest source dates; new accepted case deltas replace them through `/api/following`.

## Catalogue, craft and event refresh

Featured Library picks use stable canonical IDs, including the repaired film entry. Library dots are solid and the row bloom is removed. Source-only archive entries use compact catalogue rows rather than empty image plates. Eleven ANU regional chapters and the volume/language/genetics references are available in the Library.

Crafts now has six distinct visual records: two Agustinus Ongge bark-cloth paintings, Fansoway Art, two Rosina Tabuni maker/work photographs and the existing openly licensed noken photograph. The five new WebPs total about 688 KiB. Source-only historical objects remain catalogue entries, rather than fillers on the moving craft wall. `content/research/crafts-2026-10-08.json` records image origins. Project-owner authorization covers editorial inclusion; newly used gallery/reporting photographs have **not** been assigned an invented Creative Commons licence.

Seven new dated past events cover Pusaka discussions/book launches, a Papuan Voices workshop, a UM Papua student seminar and an AMPTPI book discussion in Wamena. Actual event dates take precedence over archive-post dates. Contradictory calendar times are omitted. No new upcoming event has been invented. The ambiguous “Membaca Papua” listing and inconsistent tour-festival dates were excluded.

## Validation and deployment

Run `npm run check:content`, `npm run build`, `npm run check:polish`, `npm run check:system`, `npm run check:explorer`, and `npm run archive:validate`. CI/preview/deploy workflows include the new explorer regression suite. It exercises real migrated D1 tables with deterministic writer/critic fixtures, immutable publication, rejection, dry runs, cross-case support and archived permalinks.

Manual browser checks cover both languages at 320, 390, 768 and 1440 pixels; seven paths; old archive anchors; contextual-map expansion; ticker/reduced motion; weekly editions; craft dialogs; and all five local films playing and seeking. The existing lean Pages story handler is preserved. Production CI, model credentials, a generated production edition and remote map-tile availability still need to be observed after publication.
