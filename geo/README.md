# Watch geography build

Freeze 10 keeps geographic source harvesting out of the browser.

`build.mjs` requests only the Western New Guinea bounding box from public source services and writes normalized GeoJSON into `geo/.build/`. `compile.sh` converts successful layers to PMTiles in `geo/out/`. Those directories are generated and ignored by Git.

The production GitHub Action uploads successful PMTiles archives to the existing `westpapua-watch-archive` R2 bucket under `geo/`. A source failure does not generate substitute/demo geometry and does not delete a previously successful R2 archive.

The public Pages app reads the archives through `/geo/:name`, a ranged R2 response path suitable for PMTiles. The layer registry in `src/lib/map/registry.ts` owns labels, provenance, coverage caveats, and style.

Current launch sources:

- Provinces: BIG administrative province polygons.
- Cultural/reference regions: Bappenas RPJMN regency membership applied to BIG regency geometry, then dissolved. These are generalized reference regions, not customary-land or cadastral boundaries.
- Mining: Kementerian ESDM / Ditjen Minerba public WIUP/IUP service.
- Forest and plantation permits: BIG Satu Peta public permit layers. Plantation coverage can be partial and is labelled accordingly.
- Protected areas: BIG Satu Peta conservation-zoning layer.
- Fire hotspots: NASA FIRMS VIIRS NOAA-21 via the Watch Engine. Requires the optional `FIRMS_MAP_KEY` Worker secret.
- Current Developments: Watch D1 canonical Place relations and coordinates.

No layer should invent geometry merely to look populated.
