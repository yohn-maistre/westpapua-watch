import raw from '../../content/investigative-record.json';
import sourcePreviews from '../../content/investigative-source-previews.json';
import {archiveItemById,archivePreview} from './archive';
import type {Localized} from './types';

export type RecordEntity={id:string;name:Localized;kind:string;aliases:string[];searchTerms?:string[]};
export type RecordSource={id:string;title:string;url:string;kind:string;period:string;scope:string;family:string;limitations:string;preview?:{src:string;width:number;height:number}};
export type RecordClaim={id:string;cases:string[];subject:string;predicate:Localized;object:string;date:string;title:Localized;text:Localized;basis:string;evidence:{source:string;locator:Localized;excerpt?:{language:string;text:string}}[];response?:Localized;quote?:{original:string;language:string};amount?:{value:number;currency:string|null;unit:string;stage:string;period:string;label:Localized}};
export type RecordCase={id:string;entryClaim?:string;title:Localized;deck:Localized;period:string;claimIds:string[];body:{text:Localized;claimIds:string[]}[];questions:Localized[];threadIds:number[];legacy:string|null;mediaId:string|null;reading:string[];scene:Record<string,[number,number]>;media?:{src:string;width:number;height:number;caption:Localized;credit:string;url:string}};
export type ResearchThread={id:number;title:Localized;question:string;caseIds:string[]};
export type InvestigativeRecord={version:number;reviewedAt:string;sources:RecordSource[];entities:RecordEntity[];claims:RecordClaim[];cases:RecordCase[];threads:ResearchThread[]};

// Archive resolution happens on the server. The interactive island receives only
// this bounded edited record, never the entire History, Library or archive corpus.
export const investigativeRecord:InvestigativeRecord={...raw,sources:raw.sources.map(s=>({...s,...((sourcePreviews as Record<string,unknown>)[s.id]?{preview:(sourcePreviews as Record<string,unknown>)[s.id]}:{})})),cases:raw.cases.map(c=>{
 const item=c.mediaId?archiveItemById[c.mediaId]:null,preview=c.mediaId?archivePreview(c.mediaId):null;
 return {...c,reading:c.reading||[],...(item?{media:{src:preview?.src||item.resolved.image||'',width:preview?.width||640,height:preview?.height||360,caption:item.editorial.caption,credit:item.id==='merauke-source-1'?'Pusaka':item.archive.creator||item.archive.institution,url:item.archive.sourceUrl}}:{})};
})} as InvestigativeRecord;
