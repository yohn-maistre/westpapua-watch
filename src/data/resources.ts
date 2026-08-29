import { sources } from './sources';

// Resources are the durable reference library, not the full citation database.
// Journalism stays attached to Current developments and Issue pages.
const durableTypes = new Set(['report', 'official', 'research', 'culture']);

export const resources = sources
  .filter((source) => durableTypes.has(source.type))
  .map((source) => ({
    ...source,
    year: source.date?.slice(0, 4) || '—'
  }));
