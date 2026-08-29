import { sourceById } from './sources';

// Resources are a curated long-term library. News articles stay on Current and Issue pages.
const durableResourceIds = [
  'greenpeace-raja-clarification-2026',
  'greenpeace-arborek-2026',
  'hrm-q2-2026',
  'hrw-land-2026',
  'un-new-york-agreement',
  'un-unsf-background',
  'un-ga-2504-1969',
  'musgrave-1969-analysis',
  'otsus-law-2001',
  'udeido-biennale-jogja',
  'udeido-papoeahuis'
] as const;

export const resources = durableResourceIds
  .map((id) => sourceById[id])
  .filter(Boolean)
  .map((source) => ({
    ...source,
    year: source.date?.slice(0, 4) || '—'
  }));
