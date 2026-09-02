# West Papua Watch — Freeze 10

## Geographic system

Freeze 10 turns the geographic model frozen in Freeze 09 into a public, frugal GIS surface. The map is shared context, not a separate editorial product and not a replacement for Issues, Current, Resources, History, Events, or Exhibition.

### Product surface

- `/` becomes the reference-system home: full atlas, Issues, Current, Resources, Programme.
- `/current/` and `/pmy/current/` retain the complete newsroom view that previously occupied `/`.
- No dedicated `/map` route is introduced. `Expand` opens the homepage atlas fullscreen.
- Issue and Development pages can render a compact contextual map when the linked canonical Place records have coordinates.
- Page context and Explore are separate states. Explore owns layer selection and place search until `Return to page view` is used.
- Intentional Explore state is URL-addressable through `map=explore`, `layers=...`, and `place=...`. Arbitrary pan/zoom is not persisted.

### Rendering stack

- MapLibre GL JS 6.6.
- PMTiles JS 4.5.
- Light atlas basemap through OpenFreeMap / OpenStreetMap.
- Large/static Watch layers compiled to PMTiles.
- R2 stores PMTiles under `geo/` in the existing Watch archive bucket.
- Pages serves PMTiles through a ranged R2 route at `/geo/:name` so byte-range requests return `206` rather than treating the archive as an ordinary static asset.
- Small/live overlays stay GeoJSON: Current Developments and NASA FIRMS fire hotspots.

### Launch layers

1. Province boundaries
2. Seven cultural/reference regions
3. Mining permits
4. Forest and available plantation permits
5. Conservation/protected-area zoning
6. NASA FIRMS fire hotspots
7. Current Developments

The layer registry is the single UI/rendering definition for title, family, source, attribution, coverage caveat, zoom range, default visibility, and style.

### Scope and performance

Static source requests are clipped to `[129,-11,141.15,1.5]`. The browser never downloads Indonesia-wide concession or mining GeoJSON. PMTiles provides range-addressable vector tiles and only requested zoom/tile ranges are transferred.

Default visible layers are deliberately sparse: provinces, cultural/reference regions, and Current. Mining, concessions, protected areas, and fires load only when selected. The atlas disables rotation, limits panning to Western New Guinea, avoids world copies, uses low visual density, and converts the layer panel to a bottom sheet on narrow screens.

### Provenance and no-fake-data rule

A failed upstream harvest does not generate example geometry. The CI build writes only layers successfully returned by the upstream public services. Uploading is additive: if a new build fails to produce an archive, it does not delete a prior successful R2 archive. Runtime layer status is determined from the actual R2 objects.

Data sources:

- Province geometry: Badan Informasi Geospasial, RBI administrative province polygons.
- Cultural/reference regions: Bappenas RPJMN 2020–2024 regency membership applied to BIG regency geometry and dissolved by region. These are generalized planning/reference regions, not customary-land or cadastral boundaries.
- Mining: Kementerian ESDM / Ditjen Minerba public WIUP/IUP ArcGIS layer.
- Forest and plantation permits: BIG Satu Peta public permit layers. Plantation coverage is explicitly labelled partial when public sublayers are incomplete.
- Protected areas: BIG Satu Peta `Peta Zonasi Kawasan Konservasi`.
- Fires: NASA FIRMS `VIIRS_NOAA21_NRT`, two-day area query. A hotspot is a satellite thermal detection, not automatically a confirmed wildfire.
- Current: Watch D1 Development ↔ canonical Place relations.

### Fire-layer credential

FIRMS requires a free NASA `MAP_KEY`. Freeze 10 treats this as optional configuration. If `FIRMS_MAP_KEY` is absent, the fire layer reports `Data unavailable`; no placeholder points are drawn. The existing GitHub production secret path syncs the key to the Watch Engine if it is configured.

### Place anchors

Migration `0012_freeze_10_geography.sql` adds practical reference coordinates to the canonical Place rows seeded in Freeze 09. These points are for navigation and Development markers only. They do not replace authoritative boundary geometry. Unknown/new reported places can remain coordinate-free until resolved rather than being guessed onto the map.

### CI geography path

The deployment Action, not the Android development environment, owns geospatial compilation:

1. install GDAL 3.8+ in the GitHub runner;
2. harvest Western New Guinea source geometry;
3. compile successful layers to PMTiles;
4. upload successful archives to existing R2;
5. build/deploy Worker and Pages as before.

This keeps the phone/PRoot workflow light while production uses a reproducible Linux geospatial toolchain.

### Freeze boundary

Freeze 10 does not yet add forest-loss rasters, flood/rainfall, biodiversity distributions, commercial connectivity, ports, electricity, internet/mobile measurements, or a company graph. The registry and PMTiles/R2 path are intentionally general enough for those later freezes without turning the initial atlas into another 120 kB component that knows every dataset personally.
