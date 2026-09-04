export const WATCH_ATLAS_COLORS={
  water:'#e9ecf5',
  land:'#f6f5fa',
  context:'#eff0f5',
  ink:'#3d3f48',
  muted:'#777985',
  boundary:'#686a75',
  reference:'#8587ad',
  accent:'#8b8db8'
} as const;

export const WATCH_BASE_STYLE={
  version:8 as const,
  sources:{},
  glyphs:'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  layers:[{id:'watch-background',type:'background' as const,paint:{'background-color':WATCH_ATLAS_COLORS.water}}]
};
