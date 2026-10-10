#!/usr/bin/env python3
"""Editorial maintenance only; generated previews are committed, so CI needs no Pillow.

Resize local catalogue media without changing the archived original. Run after
adding media: python scripts/build-history-previews.py (requires Pillow).
"""
import json
from pathlib import Path
from PIL import Image,ImageOps
root=Path(__file__).resolve().parents[1]
archive=json.loads((root/'content/archive-media.json').read_text())
out=root/'public/images/history/previews';out.mkdir(parents=True,exist_ok=True)
manifest={};total=0
for item in archive['items']:
 media=item.get('media',{});original=media.get('localImage') or media.get('localPoster')
 if not original or not (root/'public'/original.lstrip('/')).is_file():continue
 with Image.open(root/'public'/original.lstrip('/')) as raw:
  image=ImageOps.exif_transpose(raw).convert('RGB');variants=[]
  for target in (320,640,960):
   if target>image.width and variants:break
   copy=image.copy();copy.thumbnail((target,10000));name=item['id']+'-'+str(copy.width)+'.webp'
   copy.save(out/name,quality=78,method=6)
   variants.append({'src':'/images/history/previews/'+name,'width':copy.width,'height':copy.height});total+=(out/name).stat().st_size
  manifest[item['id']]={'width':image.width,'height':image.height,'variants':variants}
(root/'content/generated/history-previews.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f'{len(manifest)} catalogue previews, {total/1024/1024:.2f} MB total')
