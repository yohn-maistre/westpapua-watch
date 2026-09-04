#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$ROOT/geo/.raster-build"
OUT="$ROOT/geo/raster-out"
rm -rf "$TMP" "$OUT"; mkdir -p "$TMP" "$OUT"
BBOX="129 -11 141.15 1.5"
export GDAL_DISABLE_READDIR_ON_OPEN=EMPTY_DIR
export CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif,.TIF"
export GDAL_HTTP_MULTIRANGE=YES
export VSI_CACHE=TRUE
export VSI_CACHE_SIZE=50000000
command -v gdal_translate >/dev/null
command -v gdal_calc.py >/dev/null
command -v gdaldem >/dev/null

manifest="$OUT/manifest.json"
printf '{"generated_at":"%s","layers":{}}\n' "$(date -u +%FT%TZ)" > "$manifest"
record(){
  local key="$1" available="$2" source="$3" note="${4:-}"
  jq --arg k "$key" --argjson a "$available" --arg s "$source" --arg n "$note" \
    '.layers[$k]={available:$a,source:$s,note:$n}' "$manifest" > "$manifest.tmp" && mv "$manifest.tmp" "$manifest"
}

render_population(){
  local src="https://worldpop-public-data.soton.ac.uk/GIS/Population/Global_2015_2030/R2024B/2026/IDN/v1/100m/unconstrained/idn_pop_2026_UC_100m_R2024B_v1.tif"
  echo "population: cropping WorldPop 2026 from source COG"
  if gdal_translate -q -projwin 129 1.5 141.15 -11 -outsize 2048 0 -r bilinear "/vsicurl/$src" "$TMP/pop.tif"; then
    gdal_calc.py -A "$TMP/pop.tif" --quiet --type=Byte --NoDataValue=0 --outfile="$TMP/pop-byte.tif" \
      --calc="numpy.where(A>0,numpy.minimum(255,numpy.log1p(A)*34),0)"
    cat >"$TMP/pop-color.txt" <<'EOF'
0 0 0 0 0
1 220 220 235 0
45 188 188 216 45
90 148 148 195 85
140 112 111 165 120
190 80 79 126 165
255 42 41 75 205
nv 0 0 0 0
EOF
    gdaldem color-relief -q -alpha "$TMP/pop-byte.tif" "$TMP/pop-color.txt" "$OUT/population.png"
    record population true "$src" "WorldPop 2026 modeled population; source 100 m grid, web rendering downsampled."
  else record population false "$src" "Source crop failed; previous R2 object should remain."; fi
}

render_rainfall(){
  local base="https://storage.googleapis.com/fao-gismgr-chirps-v3-data/DATA/CHIRPS-V3/MAPSET/EWX2-ANOMALY-GM"
  local chosen=""
  for back in 0 1 2 3; do
    local ym; ym="$(date -u -d "$(date -u +%Y-%m-15) -$back month" +%Y-%m)"
    local url="$base/CHIRPS-V3.EWX2-ANOMALY-GM.$ym.tif"
    if curl -fsIL --max-time 25 "$url" >/dev/null; then chosen="$url"; break; fi
  done
  if [[ -z "$chosen" ]]; then record rainfall-anomaly false "$base" "No recent monthly CHIRPS v3 anomaly raster found."; return; fi
  echo "rainfall: $chosen"
  if gdal_translate -q -projwin 129 1.5 141.15 -11 -outsize 2048 0 -r bilinear "/vsicurl/$chosen" "$TMP/rain.tif"; then
    gdal_calc.py -A "$TMP/rain.tif" --quiet --type=Byte --NoDataValue=0 --outfile="$TMP/rain-byte.tif" \
      --calc="numpy.where(A<=-9990,0,numpy.clip(((A+300.0)*253.0/600.0)+1.0,1,254))"
    cat >"$TMP/rain-color.txt" <<'EOF'
0 0 0 0 0
1 79 93 142 170
55 114 129 177 135
105 177 184 211 85
127 237 236 241 18
149 218 192 184 70
205 183 129 110 125
254 133 79 67 175
nv 0 0 0 0
EOF
    gdaldem color-relief -q -alpha "$TMP/rain-byte.tif" "$TMP/rain-color.txt" "$OUT/rainfall-anomaly.png"
    record rainfall-anomaly true "$chosen" "CHIRPS v3 monthly precipitation anomaly, mm; latest available preliminary/final raster."
  else record rainfall-anomaly false "$chosen" "Raster crop failed; previous R2 object should remain."; fi
}

render_forest_loss(){
  local version="GFC-2025-v1.13",prefix="https://storage.googleapis.com/earthenginepartners-hansen/GFC-2025-v1.13"
  if ! curl -fsIL --max-time 20 "$prefix/Hansen_${version}_lossyear_00N_130E.tif" >/dev/null; then
    version="GFC-2024-v1.12"; prefix="https://storage.googleapis.com/earthenginepartners-hansen/GFC-2024-v1.12"
  fi
  : >"$TMP/forest-list.txt"
  for tile in 10N_120E 10N_130E 10N_140E 00N_120E 00N_130E 00N_140E 10S_120E 10S_130E 10S_140E; do
    local url="$prefix/Hansen_${version}_lossyear_${tile}.tif"
    curl -fsIL --max-time 20 "$url" >/dev/null && printf '/vsicurl/%s\n' "$url" >>"$TMP/forest-list.txt" || true
  done
  if [[ ! -s "$TMP/forest-list.txt" ]]; then record forest-loss false "$prefix" "No Hansen tiles available."; return; fi
  gdalbuildvrt -q -input_file_list "$TMP/forest-list.txt" "$TMP/forest.vrt"
  if gdal_translate -q -projwin 129 1.5 141.15 -11 -outsize 2048 0 -r nearest "$TMP/forest.vrt" "$TMP/forest.tif"; then
    {
      echo "0 0 0 0 0"
      for y in $(seq 1 25); do
        r=$((195 - y*2)); g=$((150 - y*3)); b=$((110 - y)); a=$((45 + y*6)); ((a>210))&&a=210; ((g<55))&&g=55
        echo "$y $r $g $b $a"
      done
      echo "nv 0 0 0 0"
    } >"$TMP/forest-color.txt"
    gdaldem color-relief -q -alpha -nearest_color_entry "$TMP/forest.tif" "$TMP/forest-color.txt" "$OUT/forest-loss.png"
    record forest-loss true "$prefix" "Hansen annual gross tree-cover loss year; $version."
  else record forest-loss false "$prefix" "Raster crop failed; previous R2 object should remain."; fi
}

render_hillshade(){
  : >"$TMP/dem-list.txt"
  for lat in $(seq -11 1); do
    if ((lat<0)); then ns="$(printf 'S%02d_00' $((-lat)))"; else ns="$(printf 'N%02d_00' "$lat")"; fi
    for lon in $(seq 129 141); do
      ew="$(printf 'E%03d_00' "$lon")"; id="Copernicus_DSM_COG_10_${ns}_${ew}_DEM"
      url="https://copernicus-dem-30m.s3.eu-central-1.amazonaws.com/$id/$id.tif"
      curl -fsIL --max-time 12 "$url" >/dev/null && printf '/vsicurl/%s\n' "$url" >>"$TMP/dem-list.txt" || true
    done
  done
  if [[ ! -s "$TMP/dem-list.txt" ]]; then record hillshade false "https://registry.opendata.aws/copernicus-dem/" "No GLO-30 tiles available."; return; fi
  gdalbuildvrt -q -input_file_list "$TMP/dem-list.txt" "$TMP/dem.vrt"
  if gdalwarp -q -te 129 -11 141.15 1.5 -ts 2048 0 -r bilinear "$TMP/dem.vrt" "$TMP/dem-crop.tif"; then
    gdaldem hillshade -q -compute_edges -multidirectional "$TMP/dem-crop.tif" "$TMP/hillshade.tif"
    gdal_translate -q -of PNG "$TMP/hillshade.tif" "$OUT/hillshade.png"
    record hillshade true "https://registry.opendata.aws/copernicus-dem/" "Copernicus DEM GLO-30 derived multidirectional hillshade."
  else record hillshade false "https://registry.opendata.aws/copernicus-dem/" "Hillshade build failed; previous R2 object should remain."; fi
}

if ! render_rainfall; then
  echo 'rainfall-anomaly: refresh failed; preserving any existing R2 object' >&2
  record rainfall-anomaly false 'CHIRPS v3' 'Refresh failed; previous R2 object remains untouched.'
fi
if [[ "${STATIC_REFRESH:-0}" == "1" ]]; then
  if ! render_population; then echo 'population: refresh failed; preserving existing R2 object' >&2; record population false 'WorldPop 2026' 'Refresh failed; previous R2 object remains untouched.'; fi
  if ! render_forest_loss; then echo 'forest-loss: refresh failed; preserving existing R2 object' >&2; record forest-loss false 'Hansen/GLAD' 'Refresh failed; previous R2 object remains untouched.'; fi
  if ! render_hillshade; then echo 'hillshade: refresh failed; preserving existing R2 object' >&2; record hillshade false 'Copernicus DEM GLO-30' 'Refresh failed; previous R2 object remains untouched.'; fi
fi
cat "$manifest"
ls -lh "$OUT"
