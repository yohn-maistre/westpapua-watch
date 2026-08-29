export type SourceRole='local_newsroom'|'alternative_media'|'movement_media'|'environmental_newsroom'|'investigative_newsroom'|'civil_society'|'monitoring_org'|'state_media'|'official_record';
export type SourceConfig={
  id:string;name:string;homepage:string;feed?:string;role:SourceRole;ownership:string;language:string[];scope:'papua'|'mixed';enabled:boolean;resourceCandidate?:boolean;
};
export type DiscoveredItem={sourceId:string;url:string;title:string;publishedAt?:string};
export type ExtractedArticle={
  canonicalUrl:string;title:string;description:string;body:string;publishedAt?:string;author?:string;language?:string;
  image?:{url:string;credit?:string;caption?:string;sourceUrl:string};
};
export type IngestMessage={sourceId:string;url:string;title?:string;publishedAt?:string};
