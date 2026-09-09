# Conflict map: initial editorial dataset

Twelve sourced regional records across four report periods: August–September 2025, January–March 2026, April–June 2026 and July 2026. Separate layers cover reported military presence/expansion, conflict incidents and displacement. Select **Conflict** in the map's view menu to expose the period slider and a keyboard-accessible record list.

These are regional reference points, rounded to one decimal degree, not incident-site, camp, post or live personnel coordinates. Marker size is fixed per layer; it does not encode a comparable population total. Blank periods mean no curated records in this selection, not no conflict. The periods are uneven, so the slider is a period selector, not a continuous time or trend chart. No interpolation or rolling total is implied.

Report metadata is resolved from the shared item pool by `source_id`. `content/conflict-map.json` owns only the observation record, period, attribution-ready summary, approximate region and review date. Neither military presence estimates nor differently defined displacement figures are added together.

## Sources and scope

- [HRM: expansion across the central highlands](https://humanrightsmonitor.org/news/growing-human-rights-concerns-amidst-significant-expansion-of-military-presence-across-the-west-papuan-central-highlands/), 2 October 2025: regional expansion reporting for the August–September period.
- [Papua Monitor Q1 2026](https://humanrightsmonitor.org/reports/papua-monitor-q1-2026-no-de-escalation-as-military-operations-drive-new-displacement/), 8 May 2026: January–March incident summaries.
- [Papua Monitor Q2 2026](https://humanrightsmonitor.org/reports/papua-monitor-q2-2026-escalating-conflict-drone-attacks-and-mass-displacement/), 28 July 2026: April–June regional reporting.
- [HRM displacement update](https://humanrightsmonitor.org/reports/idp-update-june26-government-neglect-drives-west-papuas-spiraling-displacement-emergency/): June update, subsequently revised; preserve the reported period and provisional character of estimates. Evacuation and displacement estimates are different measures.
- [HRM on Project Multatuli's presence report](https://humanrightsmonitor.org/news/new-multatuli-project-report-exposes-disproportional-security-force-presence-in-west-papua/), 15 July 2026: attributed secondary reporting of a presence estimate. The original Multatuli page was inaccessible during this pass; do not label this independently verified personnel data or new arrivals.

This initial dataset is largely based on one monitoring publisher. It is not an exhaustive conflict database or independent corroboration across five publishers. Review and expand it with other attributable public records before drawing trend conclusions. ACLED integration is not enabled by this patch.

The Night base remains an EOX-hosted NASA Black Marble composite, not live illumination data. Its displayed label is Night / Malam. Map notes retain attribution and period caveats without adding explanatory text to the main controls.
