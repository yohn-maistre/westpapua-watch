import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const ROOT=process.cwd();
const MANIFEST=path.join(ROOT,'content/archive-media.json');
const BUCKET=process.env.ARCHIVE_MEDIA_BUCKET||'westpapua-watch-media';
const allowedRights=new Set(['public_domain','cc0','cc_by','cc_by_sa']);
const allowedModes=new Set(['self_host','external','official_embed','permission_pending']);
const allowedLayouts=new Set(['hero','wide','standard','portrait']);
const allowedMedia=new Set(['film','photo','document','audio']);
const args=process.argv.slice(2);
const command=args.find(arg=>!arg.startsWith('--'))||'validate';
const dryRun=args.includes('--dry-run');
const idsArg=args.find(arg=>arg.startsWith('--ids='));
const wantedIds=idsArg?new Set(idsArg.slice(6).split(',').map(x=>x.trim()).filter(Boolean)):null;

const manifest=JSON.parse(await fs.readFile(MANIFEST,'utf8'));
const failures=[];
const fail=msg=>failures.push(msg);
const https=value=>typeof value==='string'&&value.startsWith('https://');
const localized=(value,label)=>{if(!value||typeof value.en!=='string'||typeof value.pmy!=='string'||!value.en.trim()||!value.pmy.trim())fail(`${label} needs en and pmy`)};
const safeKey=value=>typeof value==='string'&&/^[a-z0-9][a-z0-9/_-]*\.(webp|mp4)$/i.test(value)&&!value.includes('..');

function validate(){
  const sectionIds=new Set();
  for(const section of manifest.sections||[]){
    if(!section?.id||sectionIds.has(section.id))fail(`invalid or duplicate section ${section?.id||'?'}`);else sectionIds.add(section.id);
    localized(section?.label,`section ${section?.id||'?'} label`);localized(section?.intro,`section ${section?.id||'?'} intro`);if(!section?.range)fail(`section ${section?.id||'?'} needs range`);
  }
  const itemIds=new Set();
  for(const item of manifest.items||[]){
    if(!item?.id||itemIds.has(item.id))fail(`invalid or duplicate archive item ${item?.id||'?'}`);else itemIds.add(item.id);
    if(!sectionIds.has(item.section))fail(`${item.id} references missing section ${item.section}`);
    localized(item.title,`${item.id} title`);localized(item.editorial?.caption,`${item.id} caption`);localized(item.editorial?.context,`${item.id} context`);
    if(!allowedMedia.has(item.mediaType))fail(`${item.id} has invalid mediaType`);if(!allowedLayouts.has(item.layout))fail(`${item.id} has invalid layout`);
    if(!https(item.archive?.sourceUrl))fail(`${item.id} source record must be https`);if(!allowedModes.has(item.access?.mode))fail(`${item.id} has invalid access mode`);
    if(!item.access?.rightsStatus||!item.access?.rightsVerifiedAt)fail(`${item.id} needs rights status and verification date`);
    if(item.access?.licenseUrl&&!https(item.access.licenseUrl))fail(`${item.id} licenseUrl must be https`);
    if(item.access?.mode==='self_host'){
      if(!allowedRights.has(item.access.rightsStatus))fail(`${item.id} cannot self-host with rights=${item.access.rightsStatus}`);
      if(!item.media)fail(`${item.id} self_host item needs media`);
      if(item.mediaType==='film'&&!https(item.media?.playback))fail(`${item.id} film needs an https playback source`);
      if(item.mediaType==='photo'&&!https(item.media?.source||item.media?.poster))fail(`${item.id} photo needs an https source`);
      const mirror=item.media?.mirror||{};
      if(item.mediaType==='film'&&(!safeKey(mirror.poster)||!safeKey(mirror.preview)||!safeKey(mirror.playback)))fail(`${item.id} film needs safe poster/preview/playback mirror keys`);
      if(item.mediaType==='photo'&&(!safeKey(mirror.poster)||!safeKey(mirror.image)))fail(`${item.id} photo needs safe poster/image mirror keys`);
    }
    for(const value of Object.values(item.media?.mirror||{}))if(value&&!safeKey(value))fail(`${item.id} has unsafe mirror key ${value}`);
  }
  if(failures.length){for(const message of failures)console.error(`archive: ${message}`);process.exitCode=1;return false}
  console.log(`archive manifest valid: ${(manifest.items||[]).length} items in ${(manifest.sections||[]).length} sections`);return true;
}

if(!validate()||command==='validate')process.exit();
if(command!=='sync'){console.error(`unknown command: ${command}`);process.exit(2)}

const selfHosted=(manifest.items||[]).filter(item=>item.access?.mode==='self_host'&&(!wantedIds||wantedIds.has(item.id)));
if(wantedIds){for(const id of wantedIds)if(!selfHosted.some(item=>item.id===id))console.warn(`archive: ${id} is not a selected self_host item`)}
if(!selfHosted.length){console.log('archive: nothing to sync');process.exit()}

const run=(cmd,argv,options={})=>{const result=spawnSync(cmd,argv,{stdio:'inherit',...options});if(result.status!==0)throw new Error(`${cmd} exited ${result.status}`)};
if(!dryRun){const ff=spawnSync('ffmpeg',['-version'],{stdio:'ignore'});if(ff.status!==0)throw new Error('ffmpeg is required for archive sync')}

const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'watch-archive-'));
const fetchFile=async(url,dest)=>{
  console.log(`download ${url}`);
  if(dryRun)return;
  const response=await fetch(url,{redirect:'follow',headers:{'user-agent':'WestPapuaWatchArchive/1.0 (+https://westpapua.watch)'}});
  if(!response.ok)throw new Error(`download failed ${response.status} ${url}`);
  const length=Number(response.headers.get('content-length')||0);if(length>1_500_000_000)throw new Error(`refusing file over 1.5 GB: ${url}`);
  await fs.writeFile(dest,Buffer.from(await response.arrayBuffer()));
};
const upload=(key,file,contentType)=>{
  console.log(`upload ${BUCKET}/${key}`);
  if(dryRun)return;
  run('npx',['--no-install','wrangler','r2','object','put',`${BUCKET}/${key}`,'--file',file,'--content-type',contentType,'--cache-control','public, max-age=31536000, immutable','--remote','--force']);
};
const scaleFilter=max=>`scale='min(${max},iw)':-2:force_original_aspect_ratio=decrease`;

try{
  for(const item of selfHosted){
    const dir=path.join(tmp,item.id);if(!dryRun)await fs.mkdir(dir,{recursive:true});
    console.log(`\narchive: ${item.id}`);
    if(item.mediaType==='photo'){
      const input=path.join(dir,'source');const image=path.join(dir,'image.webp');const poster=path.join(dir,'poster.webp');
      await fetchFile(item.media.source||item.media.poster,input);
      if(!dryRun){run('ffmpeg',['-y','-i',input,'-vf',scaleFilter(1800),'-frames:v','1','-c:v','libwebp','-quality','82',image]);run('ffmpeg',['-y','-i',input,'-vf',scaleFilter(1100),'-frames:v','1','-c:v','libwebp','-quality','78',poster])}
      upload(item.media.mirror.image,image,'image/webp');upload(item.media.mirror.poster,poster,'image/webp');
      continue;
    }
    if(item.mediaType==='film'){
      const input=path.join(dir,'source.mp4');const posterInput=path.join(dir,'poster-source');const poster=path.join(dir,'poster.webp');const preview=path.join(dir,'preview.mp4');const playback=path.join(dir,'video.mp4');
      await fetchFile(item.media.playback,input);
      const start=String(Math.max(0,Number(item.media.previewStart||0)));const duration=String(Math.max(4,Math.min(15,Number(item.media.previewDuration||8))));
      if(!dryRun){
        run('ffmpeg',['-y','-i',input,'-vf',scaleFilter(1280),'-c:v','libx264','-preset','medium','-crf','24','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-movflags','+faststart',playback]);
        run('ffmpeg',['-y','-ss',start,'-i',input,'-t',duration,'-an','-vf',`${scaleFilter(640)},fps=24`,'-c:v','libx264','-preset','medium','-crf','27','-pix_fmt','yuv420p','-movflags','+faststart',preview]);
        if(item.media.poster){await fetchFile(item.media.poster,posterInput);run('ffmpeg',['-y','-i',posterInput,'-vf',scaleFilter(1100),'-frames:v','1','-c:v','libwebp','-quality','80',poster])}
        else run('ffmpeg',['-y','-ss',start,'-i',input,'-frames:v','1','-vf',scaleFilter(1100),'-c:v','libwebp','-quality','80',poster]);
      }
      upload(item.media.mirror.poster,poster,'image/webp');upload(item.media.mirror.preview,preview,'video/mp4');upload(item.media.mirror.playback,playback,'video/mp4');
    }
  }
} finally {if(!dryRun)await fs.rm(tmp,{recursive:true,force:true})}
console.log(`\narchive sync complete: ${selfHosted.length} item(s)`);
