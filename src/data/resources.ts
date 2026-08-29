import { sources } from './sources';

export const resources = sources.map((source) => ({
  ...source,
  year: source.date?.slice(0, 4) || '—'
}));
