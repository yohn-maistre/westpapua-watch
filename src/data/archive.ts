import raw from '../../content/archive-media.json';
import type {Locale,Localized} from './types';

type AccessMode='self_host'|'external'|'official_embed'|'permission_pending';
type RightsStatus='public_domain'|'cc0'|'cc_by'|'cc_by_sa'|'restricted'|'unknown';
type ArchiveMediaType='film'|'photo'|'document'|'audio';
type Layout='hero'|'wide'|'standard'|'portrait';
type ArchiveItemRaw={
  id:string;section:string;date:string;title:Localized;place?:string;mediaType:ArchiveMediaType;duration?:string;layout:Layout;
  archive:{institution:string;identifier?:string;sourceUrl:string;creator?:string;originalCaption?:string};
  editorial:{caption:Localized;context:Localized};
  access:{mode:AccessMode;rightsStatus:RightsStatus;license?:string;licenseUrl?:string;rightsHolder?:string;rightsVerifiedAt:string};
  media?:{source?:string;poster?:string;playback?:string;previewStart?:number;previewDuration?:number;mirror?:{image?:string;poster?:string;preview?:string;playback?:string}};
  relatedHistoryEvents?:string[];
};
type ArchiveSectionRaw={id:string;label:Localized;range:string;intro:Localized};

const mediaBase=(import.meta.env.PUBLIC_ARCHIVE_MEDIA_BASE||'').replace(/\/$/,'');
const mediaUrl=(source?:string,mirror?:string)=>mediaBase&&mirror?`${mediaBase}/${mirror.replace(/^\//,'')}`:source||null;

export const archiveSections=(raw.sections as ArchiveSectionRaw[]).map(section=>({
  ...section,
  items:(raw.items as ArchiveItemRaw[]).filter(item=>item.section===section.id).map(item=>({
    ...item,
    resolved:{
      poster:mediaUrl(item.media?.poster,item.media?.mirror?.poster),
      image:mediaUrl(item.media?.source,item.media?.mirror?.image),
      playback:mediaUrl(item.media?.playback,item.media?.mirror?.playback),
      // Hover previews are intentionally R2-only. Until the media bucket exists,
      // the page stays still and loads playback only after the viewer is opened.
      preview:mediaBase&&item.media?.mirror?.preview?`${mediaBase}/${item.media.mirror.preview}`:null
    }
  }))
}));

export const archiveItems=archiveSections.flatMap(section=>section.items);
export const archiveItemById=Object.fromEntries(archiveItems.map(item=>[item.id,item]));
export const archiveForHistory=(historyId:string)=>archiveItems.filter(item=>item.relatedHistoryEvents?.includes(historyId));
export const archiveText=(value:Localized,locale:Locale)=>value[locale]||value.en;
