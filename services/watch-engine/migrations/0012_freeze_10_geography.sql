PRAGMA foreign_keys=ON;

-- Freeze 10: seed practical map anchors for the canonical Place registry.
-- These are reference centroids for navigation and Development markers, not
-- administrative boundary geometry. Polygon geometry lives in the PMTiles pipeline.
UPDATE places SET latitude=-4.15,longitude=135.65,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='west-papua-region';
UPDATE places SET latitude=-2.8,longitude=139.3,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='papua';
UPDATE places SET latitude=-2.5,longitude=133.5,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='papua-barat';
UPDATE places SET latitude=-1.0,longitude=131.3,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='papua-barat-daya';
UPDATE places SET latitude=-4.0,longitude=136.0,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='papua-tengah';
UPDATE places SET latitude=-4.1,longitude=138.6,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='papua-pegunungan';
UPDATE places SET latitude=-7.7,longitude=139.6,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='papua-selatan';
UPDATE places SET latitude=-2.533,longitude=140.718,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='jayapura';
UPDATE places SET latitude=-2.57,longitude=140.516,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='sentani';
UPDATE places SET latitude=-2.62,longitude=140.52,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='lake-sentani';
UPDATE places SET latitude=-2.50,longitude=140.50,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='cycloop';
UPDATE places SET latitude=-0.65,longitude=130.50,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='raja-ampat';
UPDATE places SET latitude=-0.876,longitude=131.255,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='sorong';
UPDATE places SET latitude=-0.861,longitude=134.063,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='manokwari';
UPDATE places SET latitude=-3.366,longitude=135.496,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='nabire';
UPDATE places SET latitude=-8.493,longitude=140.401,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='merauke';
UPDATE places SET latitude=-4.55,longitude=136.89,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='mimika';
UPDATE places SET latitude=-4.546,longitude=136.883,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='timika';
UPDATE places SET latitude=-1.17,longitude=136.09,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='biak';
UPDATE places SET latitude=-1.75,longitude=136.17,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='yapen';
UPDATE places SET latitude=-4.10,longitude=138.95,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='wamena';
UPDATE places SET latitude=-4.08,longitude=138.95,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='jayawijaya';
UPDATE places SET latitude=-4.40,longitude=138.30,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='nduga';
UPDATE places SET latitude=-3.70,longitude=136.70,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='intan-jaya';
UPDATE places SET latitude=-3.60,longitude=137.50,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='puncak';
UPDATE places SET latitude=-4.50,longitude=139.50,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='yahukimo';
UPDATE places SET latitude=-3.90,longitude=136.35,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='paniai';
UPDATE places SET latitude=-4.05,longitude=136.15,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='deiyai';
UPDATE places SET latitude=-4.00,longitude=135.87,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='dogiyai';
UPDATE places SET latitude=-2.92,longitude=132.30,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='fakfak';
UPDATE places SET latitude=-3.66,longitude=133.75,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='kaimana';
UPDATE places SET latitude=-0.78,longitude=132.39,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='tambrauw';
UPDATE places SET latitude=-1.35,longitude=132.32,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='maybrat';
UPDATE places SET latitude=-5.56,longitude=138.72,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='asmat';
UPDATE places SET latitude=-6.10,longitude=140.30,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug='boven-digoel';
