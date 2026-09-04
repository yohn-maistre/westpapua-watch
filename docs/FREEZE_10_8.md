# Freeze 10.8 — Evidence atlas and persistent knowledge model

Freeze 10.8 turns the Watch map into an evidence atlas while separating durable topics from moving news clusters.

## Map

The map now separates **Base**, **View**, and **Layer** state. Atlas, Satellite and Night are orthogonal to Overview, Extraction, Environment, Infrastructure and Current. Static and analytical geography is clipped to the six Papua provinces; neighboring land exists only for orientation.

The Atlas includes a simplified always-loaded West Papua silhouette, province labels, sparse settlement labels, scale-dependent roads, clickable province profiles, clickable generalized cultural/reference regions, extraction/conservation layers, FIRMS, Current, and optional environmental/infrastructure/population evidence. Satellite uses EOX Sentinel-2 Cloudless; Night uses EOX/NASA Black Marble. JRC Global Surface Water is external tiled raster. WorldPop, Hansen forest loss, CHIRPS rainfall anomaly and Copernicus DEM hillshade are built as derived Western New Guinea web rasters and served from Watch R2 when available.

`Registered customary territories` is intentionally fail-closed pending a clearly reusable geometry source. BRWA catalogue availability alone is not treated as redistribution permission.

## Knowledge model

Eleven broad Issues are persistent lenses. The seven specific Issue fixtures from Freeze 09/10 become Dossiers and keep their existing `/issues/<slug>/` URLs. D1 stores many-to-many Dossier↔Issue and Development↔Issue relations. Existing Development↔Dossier relations remain intact.

## Current

Public ordering uses report publication time. `/api/current` supports page/limit pagination and exposes first/latest report dates. Current uses progressive Load more rather than an infinite DOM. A new source report can therefore raise an existing clustered Development again.

## Newsroom

Cron runs hourly. Discovery and backlog drainage can therefore happen throughout the day while the existing editorial admission gate still controls actual synthesis work. The authenticated 31-day backfill remains a backlog import rather than an editorial burst.

## Resources

Resource discovery stores `languages_json`. Public Resources separates stable language filtering (`All / ID / EN / Multi`) from broad topic filtering and search.

## Failure behavior

No dataset failure manufactures fallback evidence. Vector builds, external raster refreshes and customary-territory availability fail closed. Existing R2 archives remain untouched when a refresh cannot build a replacement.
