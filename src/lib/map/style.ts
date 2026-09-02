export const WATCH_BASE_STYLE = {
  version: 8,
  name: 'West Papua Watch Atlas',
  sources: {},
  layers: [
    {
      id: 'watch-water-background',
      type: 'background',
      paint: { 'background-color': '#e9ecf5' }
    }
  ]
} as const;

export const WATCH_ATLAS_COLORS = {
  water: '#e9ecf5',
  land: '#f6f5fa',
  landSecondary: '#f1f0f6',
  ink: '#3d3f48',
  boundary: '#686a75',
  reference: '#8587ad',
  accent: '#8b8db8'
} as const;
