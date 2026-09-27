#!/usr/bin/env python3
"""Rebuild Watch's pinned Papua language reference-point catalogue offline.

The repository ships the spatially-filtered Glottolog 5.3 seed so normal
builds do not depend on BIG, GitHub, or any other live service.

Seed provenance (2026-09-27):
- language records: Glottolog CLDF v5.3 (CC BY 4.0)
- target scope: the six current Papua provinces
- canonical administrative reference: BIG Area Batas Wilayah Administrasi
  Provinsi, layer 12 (WGS84; advertises all six province names)
- offline cross-check mask: Indonesia 38-province GeoJSON, CC BY 4.0,
  denyherianto/indonesia-geojson-topojson-maps-with-38-provinces

The fallback mask reproduced the prior BIG-filtered QA count (256) and key
records. Boundary geometry itself is not redistributed by this seed.
Outputs are representative language locations, never language/customary bounds.
"""
from __future__ import annotations
import csv, json, pathlib

ROOT=pathlib.Path(__file__).resolve().parents[1]
SEED=ROOT/'content/data/languages-source.tsv'
CATALOGUE=ROOT/'content/data/languages-curated.json'
GEOJSON=ROOT/'public/data/languages.geojson'
EXPECTED_COUNT=256
EXPECTED={'Ekari','Meyah','Biak','Western Dani'}
NOTE='Representative language reference point; not a language boundary or customary territory.'

def build():
    if not SEED.exists():
        raise RuntimeError(f'Pinned language seed missing: {SEED.relative_to(ROOT)}')
    out=[]
    with SEED.open(encoding='utf-8',newline='') as handle:
        for row in csv.DictReader(handle,delimiter='\t'):
            out.append({
                'name':row['name'].strip(),
                'glottocode':row['glottocode'].strip(),
                'family':row['family'].strip() or 'Unclassified',
                'latitude':float(row['latitude']),
                'longitude':float(row['longitude']),
            })
    out.sort(key=lambda x:x['name'].casefold())
    if len(out)!=EXPECTED_COUNT:
        raise RuntimeError(f'QA failed: expected pinned {EXPECTED_COUNT} records, got {len(out)}')
    names={x['name'] for x in out};missing=EXPECTED-names
    if missing:
        raise RuntimeError('QA failed: missing expected language(s): '+', '.join(sorted(missing)))
    if len({x['glottocode'] for x in out})!=len(out):
        raise RuntimeError('QA failed: duplicate glottocodes in pinned seed')
    CATALOGUE.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    features=[{
        'type':'Feature',
        'geometry':{'type':'Point','coordinates':[x['longitude'],x['latitude']]},
        'properties':{'name':x['name'],'glottocode':x['glottocode'],'family':x['family'],'source':'Glottolog 5.3','location_note':NOTE}
    } for x in out]
    GEOJSON.write_text(json.dumps({'type':'FeatureCollection','name':'watch-language-reference-points','features':features},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'Wrote {len(out)} language-level records from pinned offline seed')

if __name__=='__main__':
    build()
