#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p .build out
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
    -dsco MINZOOM="$min" \
    -dsco MAXZOOM="$max" \
    -dsco SIMPLIFICATION=1.2 \
    -nln "$name" -lco NAME="$name" \
    "out/$name.pmtiles" "$input"
  if ! ogrinfo -ro -so "out/$name.pmtiles" "$name" >/dev/null 2>&1; then
    echo "PMTiles validation failed: expected source layer '$name' in out/$name.pmtiles" >&2
    rm -f "out/$name.pmtiles"
    return 1
  fi
  echo "validated PMTiles source layer: $name"
}

pm provinces .build/provinces.geojson 3 12

if [[ -s .build/cultural_source.geojson ]]; then
  rm -f .build/cultural_regions.geojson
  if ogr2ogr -f GeoJSON .build/cultural_regions.geojson .build/cultural_source.geojson -dialect SQLite -sql 'SELECT region, method, ST_Union(geometry) AS geometry FROM cultural_source GROUP BY region, method'; then
    pm cultural_regions .build/cultural_regions.geojson 3 12
  else
    echo "Cultural-region dissolve unavailable; layer will remain unavailable" >&2
  fi
fi

pm mining .build/mining.geojson 4 13
pm concessions .build/concessions.geojson 4 13
pm protected .build/protected.geojson 4 13
[[ -s .build/manifest.json ]] && cp .build/manifest.json out/manifest.json
ls -lh out
