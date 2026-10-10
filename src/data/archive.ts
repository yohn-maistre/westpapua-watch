import raw from '../../content/archive-media.json';
import previews from '../../content/generated/history-previews.json';
import type {Locale,Localized} from './types';

type AccessMode='self_host'|'external'|'official_embed'|'permission_pending'|'editorial';
type RightsStatus='public_domain'|'cc0'|'cc_by'|'cc_by_sa'|'cc_by_nc_nd'|'restricted'|'unknown';
type ArchiveMediaType='film'|'photo'|'document'|'audio';
type Layout='hero'|'wide'|'standard'|'portrait';
type ArchiveItemRaw={
  id:string;section:string;date:string;title:Localized;place?:string;mediaType:ArchiveMediaType;duration?:string;layout:Layout;
  archive:{institution:string;identifier?:string;sourceUrl:string;mirrorUrl?:string;creator?:string;originalCaption?:string};
  editorial:{caption:Localized;context:Localized};
  access:{mode:AccessMode;rightsStatus:RightsStatus;license?:string;licenseUrl?:string;rightsHolder?:string;rightsVerifiedAt:string};
  media?:{source?:string;poster?:string;playback?:string;mirrorSource?:string;previewStart?:number;previewDuration?:number;localImage?:string;localPoster?:string;localPlayback?:string;conversion?:Localized;mirror?:{image?:string;poster?:string;preview?:string;playback?:string}};
  relatedHistoryEvents?:string[];
};
type ArchiveSectionRaw={id:string;label:Localized;range:string;intro:Localized};

// The same catalogue is read by Astro and the server-side Ask corpus.
const mediaBase=(import.meta.env?.PUBLIC_ARCHIVE_MEDIA_BASE||'').replace(/\/$/,'');
const mediaUrl=(source?:string,mirror?:string)=>mediaBase&&mirror?`${mediaBase}/${mirror.replace(/^\//,'')}`:source||null;

export const archiveSections=(raw.sections as ArchiveSectionRaw[]).map(section=>({
  ...section,
  items:(raw.items as ArchiveItemRaw[]).filter(item=>item.section===section.id).map(item=>({
    ...item,
    resolved:{
      poster:item.media?.localPoster||mediaUrl(item.media?.poster,item.media?.mirror?.poster),
      image:item.media?.localImage||mediaUrl(item.media?.source,item.media?.mirror?.image),
      playback:item.media?.localPlayback||mediaUrl(item.media?.playback,item.media?.mirror?.playback),
      // Hover previews are intentionally R2-only. Until the media bucket exists,
      // the page stays still and loads playback only after the viewer is opened.
      preview:mediaBase&&item.media?.mirror?.preview?`${mediaBase}/${item.media.mirror.preview}`:null
    }
  }))
}));

export const archiveItems=archiveSections.flatMap(section=>section.items);
export const archiveItemById=Object.fromEntries(archiveItems.map(item=>[item.id,item]));
export const archiveForHistory=(historyId:string)=>archiveItems.filter(item=>item.relatedHistoryEvents?.includes(historyId));
export function archivePreview(id:string){
 const p=(previews as Record<string,{width:number;height:number;variants:{src:string;width:number;height:number}[]}>)[id];
 if(!p)return null;
 return {src:p.variants.find(v=>v.width>=640)?.src||p.variants.at(-1)!.src,srcset:p.variants.map(v=>`${v.src} ${v.width}w`).join(', '),width:p.width,height:p.height};
}
export const archiveText=(value:Localized,locale:Locale)=>value[locale]||value.en;
