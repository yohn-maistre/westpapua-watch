#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p .build out ../public/data
if ! command -v ogr2ogr >/dev/null 2>&1 || ! ogr2ogr --formats | grep -q PMTiles; then
  echo "GDAL 3.8+ PMTiles driver unavailable; leaving static layers explicitly unavailable" >&2
  [[ -s .build/manifest.json ]] && cp .build/manifest.json out/manifest.json
  exit 0
fi

pm(){
  local name="$1" input="$2" min="$3" max="$4"
  [[ -s "$input" ]] || return 0
  rm -f "out/$name.pmtiles"
  ogr2ogr -f PMTiles \
    -dsco NAME="West Papua Watch · $name" \
    -dsco DESCRIPTION="Western New Guinea scoped Watch layer" \
    -dsco TYPE=overlay \
    -dsco MINZOOM="$min" -dsco MAXZOOM="$max" -dsco SIMPLIFICATION=1.2 \
    -nln "$name" -lco NAME="$name" "out/$name.pmtiles" "$input"
  ogrinfo -ro -so "out/$name.pmtiles" "$name" >/dev/null 2>&1 || { echo "PMTiles validation failed: $name" >&2; rm -f "out/$name.pmtiles"; return 1; }
  echo "validated PMTiles source layer: $name"
}
clip(){
  local input="$1" output="$2"
  [[ -s "$input" && -s .build/provinces.geojson ]] || return 1
  rm -f "$output"
  ogr2ogr -f GeoJSON "$output" "$input" -clipsrc .build/provinces.geojson -makevalid -skipfailures
}

# The base land plate is deliberately one tiny GeoJSON, not tiled. This keeps
# low-memory WebGL1 devices from showing rectangular land gaps while zooming.
if [[ -s .build/provinces.geojson ]]; then
  rm -f ../public/data/west-papua-silhouette.geojson
  if ! ogr2ogr -f GeoJSON ../public/data/west-papua-silhouette.geojson .build/provinces.geojson \
    -dialect SQLite -sql 'SELECT ST_Union(geometry) AS geometry FROM provinces' -simplify 0.025 -makevalid; then
    echo '::warning::Could not build static West Papua silhouette; runtime will fall back to province PMTiles.' >&2
    rm -f ../public/data/west-papua-silhouette.geojson
  fi
  pm provinces .build/provinces.geojson 3 13 || echo '::warning::Province PMTiles refresh failed; existing R2 archive remains authoritative.' >&2
fi

if [[ -s .build/context_countries.geojson ]]; then
  rm -f ../public/data/context-land.geojson
  if ! ogr2ogr -f GeoJSON ../public/data/context-land.geojson .build/context_countries.geojson \
    -clipsrc 124 -13 147 4 -simplify 0.035 -makevalid; then
    echo '::warning::Context-land build failed; map will render without the optional regional context plate.' >&2
    rm -f ../public/data/context-land.geojson
  fi
fi

if [[ -s .build/cultural_source.geojson ]]; then
  rm -f .build/cultural_regions.geojson
  if ogr2ogr -f GeoJSON .build/cultural_regions.geojson .build/cultural_source.geojson -dialect SQLite \
    -sql "SELECT region, method, GROUP_CONCAT(kabupaten, '|') AS member_regencies, GROUP_CONCAT(provinsi, '|') AS provinces, ST_Union(geometry) AS geometry FROM cultural_source GROUP BY region, method"; then
    pm cultural_regions .build/cultural_regions.geojson 3 12
  else
    echo "Cultural-region dissolve unavailable; layer will remain unavailable" >&2
  fi
fi

for spec in "mining:4:13" "concessions:4:13" "protected:4:13" "roads:5:14" "airports:4:14" "ports:5:14" "settlements:4:14"; do
  IFS=: read -r name min max <<<"$spec"
  [[ -s ".build/$name.geojson" ]] || continue
  if clip ".build/$name.geojson" ".build/${name}_papua.geojson"; then
    pm "$name" ".build/${name}_papua.geojson" "$min" "$max"
  fi
done

[[ -s .build/manifest.json ]] && cp .build/manifest.json out/manifest.json
ls -lh out ../public/data/west-papua-silhouette.geojson ../public/data/context-land.geojson 2>/dev/null || true
