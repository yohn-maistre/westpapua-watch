# Freeze 10.7 — atlas papercuts and extraction completeness

Base: `bcd4bf4b4d93c71878986d6fc266032f424bc5bc`

- Keep Freeport inside the existing **Extraction** family rather than creating another top-level map category.
- Add a sourced `Major extraction sites` sublayer. Initial site: PT Freeport Indonesia / Grasberg.
- Treat the Grasberg geometry as an operating-site point, not an IUPK boundary, until a defensible public IUPK polygon source is available.
- Make NASA FIRMS hotspots part of the default Overview map view.
- Increase constrained-device tile cache from 16/1 zoom level to 32/2 while retaining DPR 1.
- Clear stale `Open development` links whenever the selected map feature is not a Watch Development.
- Mobile Layers becomes a viewport-fixed, internally scrolling bottom sheet with page scroll locked while open.
- Full mobile masthead: standalone `Overview` above the six section destinations; `✦ Exhibition` carries the attention cue.
- Compact navigation remains one horizontally scrollable row.
- Tighten mobile spacing between Overview section actions (`All issues`, `All current developments`, `Open library`) and their content.
- Compact navbar background is solid again; only the horizontally scrollable menu text fades at the rail edges.
- Unify desktop and mobile History sticky offsets through `--history-sticky-top`, derived from the compact-navbar height.

