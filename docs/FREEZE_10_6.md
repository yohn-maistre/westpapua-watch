# Freeze 10.6 — low-end atlas hardening

Base: `a8ccf944024dd5cd667fc812eb6c03b0d7e16b7d`

- Pin MapLibre GL JS to `5.24.0`, the final v5 release, to preserve WebGL1 fallback.
- Keep PMTiles `4.5.0`.
- Remove the remote world basemap dependency from the atlas.
- Use Watch's own province PMTiles as the land plate over a cool blue-grey water background.
- Add conservative low-memory MapLibre settings on small / <=4 GB / data-saver devices.
- Expose renderer and low-memory state as `data-map-renderer` / `data-map-low-memory` for debugging.
- Show a non-fake fallback panel if MapLibre cannot initialize or loses the GPU context permanently.
- Full mobile masthead uses a balanced 4+3 two-row navigation grid.
- Compact mobile navigation remains one horizontally scrollable rail.
- Home section actions stack under section titles on phones.
- No new GIS datasets in this freeze. First prove the core atlas on the low-end reference device.
