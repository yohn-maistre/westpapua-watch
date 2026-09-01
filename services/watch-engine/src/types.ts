export type SourceRole='local_newsroom'|'alternative_media'|'movement_media'|'environmental_newsroom'|'investigative_newsroom'|'civil_society'|'monitoring_org'|'public_service_media'|'state_public_media'|'state_media'|'official_record';
export type SourceConfig={
  id:string;name:string;homepage:string;feed?:string;role:SourceRole;ownership:string;language:string[];scope:'papua'|'mixed';enabled:boolean;resourceCandidate?:boolean;priority?:number;notes?:string;
};
export type DiscoveredItem={sourceId:string;url:string;title:string;publishedAt?:string};
export type ExtractionMethod='fetch+defuddle'|'fetch+readability'|'fetch+fallback'|'browser-run'|'firecrawl';
export type ExtractedArticle={
  canonicalUrl:string;title:string;description:string;body:string;publishedAt?:string;author?:string;language?:string;extractionMethod?:ExtractionMethod;contentHash?:string;
  image?:{url:string;credit?:string;caption?:string;sourceUrl:string};
};
export type StoryPacket={
  summary:string;key_points:string[];what_changed:string;event_date?:string;places:string[];people:string[];organizations:string[];topics:string[];issue_candidates:string[];
  watch_relevance?:boolean;watch_relevance_confidence?:number;watch_desk?:'environment'|'land'|'human_rights'|'politics'|'culture'|'regional'|'other';
};
export type IngestMessage={sourceId:string;url:string;title?:string;publishedAt?:string};
