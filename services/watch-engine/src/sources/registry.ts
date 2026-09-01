import sourceData from '../../../../content/news-sources.json';
import type { SourceConfig } from '../types';

// Roles describe provenance, not a numerical truth score. The editable registry lives in
// /content/news-sources.json so a scoped steward can enable/disable sources without touching code.
export const SOURCES=sourceData as SourceConfig[];
export const sourceById=Object.fromEntries(SOURCES.map(source=>[source.id,source])) as Record<string,SourceConfig>;
