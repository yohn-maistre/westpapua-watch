export type MapLayerFamily='boundaries'|'extraction'|'environment'|'infrastructure'|'population'|'current';
export type MapLayerSourceType='pmtiles'|'live'|'raster'|'image';
export type MapBaseId='atlas'|'satellite'|'night';
export type MapViewId='overview'|'extraction'|'environment'|'infrastructure'|'current';
export type MapLayerDefinition={
  id:string;family:MapLayerFamily;title:string;titleId:string;description:string;descriptionId:string;
  sourceType:MapLayerSourceType;source:string;sourceLayer?:string;tiles?:string[];sourceUrl:string;attribution:string;license:string;
  coverage:string;coverageNotes?:string;coverageNotesId?:string;minZoom:number;maxZoom:number;defaultVisible:boolean;
  geometry:'line'|'fill'|'circle'|'symbol'|'raster'|'image';style:Record<string,unknown>;availability?:'always'|'status';
};
export type MapBaseDefinition={
  id:MapBaseId;title:string;titleId:string;description:string;descriptionId:string;
  tiles?:string[];sourceUrl?:string;attribution?:string;maxZoom?:number;
};
export type MapViewDefinition={id:MapViewId;title:string;titleId:string;layers:string[]};

export const WEST_PAPUA_BOUNDS:[[number,number],[number,number]]=[[128.5,-11.5],[141.35,1.8]];
export const WEST_PAPUA_CENTER:[number,number]=[135.55,-4.1];
export const MAP_CONTEXT_BOUNDS:[[number,number],[number,number]]=[[124,-13],[147,4]];
export const WEST_PAPUA_IMAGE_CORNERS:[[number,number],[number,number],[number,number],[number,number]]=[
  [129,1.5],[141.15,1.5],[141.15,-11],[129,-11]
];

export const MAP_BASES:MapBaseDefinition[]=[
  {
    id:'atlas',title:'Atlas',titleId:'Atlas',
    description:'Watch atlas plate with Western New Guinea geography and restrained context.',
    descriptionId:'Atlas Watch dengan geografi Papua bagian barat dan konteks yang ringkas.'
  },
  {
    id:'satellite',title:'Satellite',titleId:'Satelit',
    description:'Sentinel-2 cloudless 2025 satellite mosaic.',
    descriptionId:'Mosaik satelit Sentinel-2 cloudless 2025.',
    tiles:['https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2025_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.jpg'],
    sourceUrl:'https://cloudless.eox.at/',
    attribution:'EOxCloudless · modified Copernicus Sentinel data 2025',
    maxZoom:14
  },
  {
    id:'night',title:'Night',titleId:'Malam',
    description:'NASA Black Marble night-light composite. Brightness is not a direct household-electrification measure.',
    descriptionId:'Komposit cahaya malam NASA Black Marble. Kecerahan bukan ukuran langsung elektrifikasi rumah tangga.',
    tiles:['https://tiles.maps.eox.at/wmts/1.0.0/blackmarble_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.jpg'],
    sourceUrl:'https://www.earthdata.nasa.gov/data/projects/black-marble',
    attribution:'Black Marble · NASA Earth Observatory / EOX rendering',
    maxZoom:13
  }
];
export const baseById=Object.fromEntries(MAP_BASES.map(x=>[x.id,x])) as Record<MapBaseId,MapBaseDefinition>;

export const MAP_FAMILIES:{id:MapLayerFamily;title:string;titleId:string}[]=[
  {id:'boundaries',title:'Boundaries',titleId:'Batas'},
  {id:'extraction',title:'Extraction',titleId:'Ekstraksi'},
  {id:'environment',title:'Environment',titleId:'Lingkungan'},
  {id:'infrastructure',title:'Infrastructure',titleId:'Infrastruktur'},
  {id:'population',title:'Population',titleId:'Penduduk'},
  {id:'current',title:'Current',titleId:'Sekarang'}
];

export const MAP_VIEWS:MapViewDefinition[]=[
  {id:'overview',title:'Overview',titleId:'Ringkasan',layers:['province-boundaries','cultural-regions','major-roads','settlements','fire-hotspots','current-developments']},
  {id:'extraction',title:'Extraction',titleId:'Ekstraksi',layers:['province-boundaries','cultural-regions','mining-permits','major-extraction-sites','forest-plantation-permits','current-developments']},
  {id:'environment',title:'Environment',titleId:'Lingkungan',layers:['province-boundaries','protected-areas','fire-hotspots','forest-loss','current-developments']},
  {id:'infrastructure',title:'Infrastructure',titleId:'Infrastruktur',layers:['province-boundaries','major-roads','airports','ports','settlements','current-developments']},
  {id:'current',title:'Current',titleId:'Sekarang',layers:['province-boundaries','current-developments']}
];

export const MAP_LAYERS:MapLayerDefinition[]=[
  {
    id:'province-boundaries',family:'boundaries',title:'Provinces',titleId:'Provinsi',
    description:'The six current Indonesian provinces in Western New Guinea.',
    descriptionId:'Enam provinsi Indonesia saat ini di Papua bagian barat.',
    sourceType:'pmtiles',source:'/geo/provinces.pmtiles',sourceLayer:'provinces',
    sourceUrl:'https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/BATAS_WILAYAH/MapServer/12',
    attribution:'Badan Informasi Geospasial',license:'Public government geospatial service',coverage:'Six Papua provinces',
    minZoom:2.8,maxZoom:13,defaultVisible:true,geometry:'line',
    style:{'line-color':'#555864','line-width':['interpolate',['linear'],['zoom'],3,.8,8,1.45],'line-opacity':.82}
  },
  {
    id:'cultural-regions',family:'boundaries',title:'Cultural/reference regions',titleId:'Wilayah budaya/referensi',
    description:'Seven generalized reference regions dissolved from regency membership in national planning documents. Not customary or cadastral boundaries.',
    descriptionId:'Tujuh wilayah referensi yang digeneralisasi dari keanggotaan kabupaten dalam dokumen perencanaan nasional. Bukan batas adat atau kadaster.',
    sourceType:'pmtiles',source:'/geo/cultural_regions.pmtiles',sourceLayer:'cultural_regions',
    sourceUrl:'https://ditkumlasi.bappenas.go.id/download/file/Narasi_RPJMN_2020-2024.pdf',
    attribution:'Bappenas membership · BIG administrative geometry',license:'Reference/generalized',coverage:'Western New Guinea',
    coverageNotes:'Generalized to whole regencies; internal customary boundaries can differ.',
    coverageNotesId:'Digeneralisasi mengikuti kabupaten; batas adat internal dapat berbeda.',
    minZoom:3,maxZoom:12,defaultVisible:true,geometry:'fill',
    style:{'fill-color':'#898bad','fill-opacity':.055,'fill-outline-color':'#77799f'}
  },
  {
    id:'registered-customary-territories',family:'boundaries',title:'Registered customary territories',titleId:'Wilayah adat terdaftar',
    description:'BRWA customary-territory geometry, only when a documented reusable geometry service or download is available.',
    descriptionId:'Geometri wilayah adat BRWA, hanya jika layanan atau unduhan geometri yang terdokumentasi dan dapat digunakan ulang tersedia.',
    sourceType:'pmtiles',source:'/geo/customary_territories.pmtiles',sourceLayer:'customary_territories',
    sourceUrl:'https://www.brwa.or.id/sig/',attribution:'BRWA',license:'Reuse status must be explicit',coverage:'Where defensibly reusable',
    coverageNotes:'Unavailable until geometry reuse is explicitly defensible; no scraping or sensitive-site import.',
    coverageNotesId:'Tidak tersedia sampai penggunaan ulang geometri jelas diperbolehkan; tanpa scraping atau impor lokasi sensitif.',
    minZoom:5,maxZoom:14,defaultVisible:false,geometry:'fill',
    style:{'fill-color':'#a79c83','fill-opacity':.12,'fill-outline-color':'#7e745f'},availability:'status'
  },
  {
    id:'mining-permits',family:'extraction',title:'Mining permits',titleId:'Izin tambang',
    description:'IUP/WIUP mining-permit polygons clipped to the six Papua provinces.',descriptionId:'Poligon izin tambang IUP/WIUP yang dipotong ke enam provinsi Papua.',
    sourceType:'pmtiles',source:'/geo/mining.pmtiles',sourceLayer:'mining',sourceUrl:'https://geoportal.esdm.go.id/gis1/rest/services/Join_WIUP_vs_IPPKH/MapServer/0',
    attribution:'Kementerian ESDM · Ditjen Minerba',license:'Open ArcGIS service',coverage:'Six Papua provinces',
    minZoom:4,maxZoom:13,defaultVisible:false,geometry:'fill',
    style:{'fill-color':'#a69bac','fill-opacity':.19,'fill-outline-color':'#746a7a'}
  },
  {
    id:'major-extraction-sites',family:'extraction',title:'Major extraction sites',titleId:'Lokasi ekstraksi utama',
    description:'Sourced major operations not represented cleanly by the current public permit polygon layer.',descriptionId:'Operasi utama bersumber yang tidak terwakili dengan baik oleh lapisan poligon izin publik saat ini.',
    sourceType:'live',source:'/data/major-extraction-sites.geojson',sourceUrl:'https://ptfi.co.id/en/our-operation-areas',
    attribution:'Sourced operating-site metadata',license:'Public reference metadata',coverage:'Western New Guinea',
    coverageNotes:'Site points identify operations; they are not permit boundaries.',coverageNotesId:'Titik menunjukkan operasi; bukan batas izin.',
    minZoom:3,maxZoom:14,defaultVisible:false,geometry:'circle',
    style:{'circle-radius':['interpolate',['linear'],['zoom'],3,5,9,8.5],'circle-color':'#665a70','circle-opacity':.94,'circle-stroke-color':'#f6f5fa','circle-stroke-width':1.5},availability:'always'
  },
  {
    id:'forest-plantation-permits',family:'extraction',title:'Forest & plantation permits',titleId:'Izin hutan & perkebunan',
    description:'Logging, HTI and available plantation-permit polygons from BIG Satu Peta.',descriptionId:'Poligon izin pembalakan, HTI, dan perkebunan yang tersedia dari BIG Satu Peta.',
    sourceType:'pmtiles',source:'/geo/concessions.pmtiles',sourceLayer:'concessions',sourceUrl:'https://kspservices.big.go.id/satupeta/rest/services/PUBLIK/PERIZINAN_DAN_PERTANAHAN/MapServer',
    attribution:'KLHK · BIG Satu Peta',license:'Kebijakan Satu Peta / Satu Data',coverage:'Western New Guinea',
    coverageNotes:'Plantation coverage is partial where public services expose only local layers.',coverageNotesId:'Cakupan perkebunan sebagian karena layanan publik hanya membuka lapisan tertentu.',
    minZoom:4,maxZoom:13,defaultVisible:false,geometry:'fill',
    style:{'fill-color':['match',['get','jenis'],'logging','#aaa38b','hti','#9eaa93','sawit','#b29a89','#a9a294'],'fill-opacity':.18,'fill-outline-color':'#7d7669'}
  },
  {
    id:'protected-areas',family:'environment',title:'Protected areas',titleId:'Kawasan konservasi',
    description:'Published conservation zoning available through BIG Satu Peta.',descriptionId:'Zonasi konservasi yang dipublikasikan melalui BIG Satu Peta.',
    sourceType:'pmtiles',source:'/geo/protected.pmtiles',sourceLayer:'protected',sourceUrl:'https://kspservices.big.go.id/satupeta/rest/services/PUBLIK/SUMBER_DAYA_ALAM_DAN_LINGKUNGAN/MapServer/33',
    attribution:'BIG Satu Peta · environmental data producers',license:'Public government geospatial service',coverage:'Western New Guinea',
    minZoom:4,maxZoom:13,defaultVisible:false,geometry:'fill',
    style:{'fill-color':'#91a999','fill-opacity':.18,'fill-outline-color':'#657d6d'}
  },
  {
    id:'fire-hotspots',family:'environment',title:'Fire hotspots',titleId:'Titik panas',
    description:'Recent NASA FIRMS satellite hotspots.',descriptionId:'Titik panas satelit NASA FIRMS terbaru.',
    sourceType:'live',source:'/api/fires',sourceUrl:'https://firms.modaps.eosdis.nasa.gov/',attribution:'NASA FIRMS · VIIRS NOAA-21',license:'NASA Earth observation data',coverage:'Western New Guinea',
    minZoom:3,maxZoom:14,defaultVisible:true,geometry:'circle',
    style:{'circle-radius':['interpolate',['linear'],['zoom'],3,2.6,9,5.8],'circle-color':'#ad705f','circle-opacity':.79,'circle-stroke-color':'#faf8f3','circle-stroke-width':.8}
  },
  {
    id:'forest-loss',family:'environment',title:'Forest loss',titleId:'Kehilangan hutan',
    description:'Annual tree-cover-loss year from Hansen/GLAD, rendered from a Western New Guinea crop.',descriptionId:'Tahun kehilangan tutupan pohon Hansen/GLAD, dirender dari potongan Papua bagian barat.',
    sourceType:'image',source:'/raster/forest-loss.png',sourceUrl:'https://data.globalforestwatch.org/',attribution:'Hansen/UMD/Google/USGS/NASA',license:'CC BY 4.0',coverage:'Western New Guinea',
    coverageNotes:'Derived web raster; source year/version is recorded in atlas status.',coverageNotesId:'Raster web turunan; tahun/versi sumber dicatat dalam status atlas.',
    minZoom:3,maxZoom:12,defaultVisible:false,geometry:'image',style:{'raster-opacity':.64},availability:'status'
  },
  {
    id:'surface-water-change',family:'environment',title:'Surface-water change',titleId:'Perubahan air permukaan',
    description:'EC JRC Global Surface Water transitions, 1984–2024.',descriptionId:'Transisi Global Surface Water EC JRC, 1984–2024.',
    sourceType:'raster',source:'https://storage.googleapis.com/water-world/tiles2024/transitions/{z}/{x}/{y}.png',
    tiles:['https://storage.googleapis.com/water-world/tiles2024/transitions/{z}/{x}/{y}.png'],
    sourceUrl:'https://global-surface-water.appspot.com/download',attribution:'EC JRC/Google',license:'Copernicus/JRC public mapping service',coverage:'Global; displayed over Western New Guinea',
    minZoom:3,maxZoom:13,defaultVisible:false,geometry:'raster',style:{'raster-opacity':.57},availability:'always'
  },
  {
    id:'rainfall-anomaly',family:'environment',title:'Rainfall anomaly',titleId:'Anomali curah hujan',
    description:'CHIRPS v3 monthly precipitation anomaly at about 5 km.',descriptionId:'Anomali curah hujan bulanan CHIRPS v3 sekitar 5 km.',
    sourceType:'image',source:'/raster/rainfall-anomaly.png',sourceUrl:'https://data.apps.fao.org/gismgr/api/v2/catalog/workspaces/CHIRPS-V3/mapsets/EWX2-ANOMALY-GM',
    attribution:'CHIRPS v3 · Climate Hazards Center / FAO distribution',license:'CC BY 4.0',coverage:'Western New Guinea',
    coverageNotes:'Monthly anomaly in millimetres; latest available preliminary/final product.',coverageNotesId:'Anomali bulanan dalam milimeter; produk awal/final terbaru yang tersedia.',
    minZoom:3,maxZoom:11,defaultVisible:false,geometry:'image',style:{'raster-opacity':.55},availability:'status'
  },
  {
    id:'major-roads',family:'infrastructure',title:'Major roads',titleId:'Jalan utama',
    description:'Public BIG transport/RBI road geometry, simplified for the Watch atlas.',descriptionId:'Geometri jalan publik BIG transport/RBI yang disederhanakan untuk atlas Watch.',
    sourceType:'pmtiles',source:'/geo/roads.pmtiles',sourceLayer:'roads',sourceUrl:'https://geoservices.big.go.id/rbi/rest/services/BASEMAP/Rupabumi_Indonesia/MapServer/863',
    attribution:'Badan Informasi Geospasial',license:'Public government geospatial service',coverage:'Western New Guinea where source responds',
    minZoom:5,maxZoom:14,defaultVisible:false,geometry:'line',
    style:{'line-color':'#93959e','line-width':['interpolate',['linear'],['zoom'],5,.45,10,1.2],'line-opacity':.65},availability:'status'
  },
  {
    id:'airports',family:'infrastructure',title:'Airports',titleId:'Bandara',
    description:'Public BIG aviation atlas locations.',descriptionId:'Lokasi dari atlas penerbangan publik BIG.',
    sourceType:'pmtiles',source:'/geo/airports.pmtiles',sourceLayer:'airports',sourceUrl:'https://geoservices.big.go.id/rbi/rest/services/BASEMAP/Rupabumi_Indonesia/MapServer/860',
    attribution:'Badan Informasi Geospasial',license:'Public government geospatial service',coverage:'Western New Guinea where source responds',
    minZoom:4,maxZoom:14,defaultVisible:false,geometry:'circle',
    style:{'circle-radius':['interpolate',['linear'],['zoom'],4,2.4,9,4.6],'circle-color':'#60636e','circle-stroke-color':'#f6f5fa','circle-stroke-width':1},availability:'status'
  },
  {
    id:'ports',family:'infrastructure',title:'Ports',titleId:'Pelabuhan',
    description:'Public BIG/RBI port locations.',descriptionId:'Lokasi pelabuhan publik BIG/RBI.',
    sourceType:'pmtiles',source:'/geo/ports.pmtiles',sourceLayer:'ports',sourceUrl:'https://geoservices.big.go.id/rbi/rest/services/BASEMAP/Rupabumi_Indonesia/MapServer/861',
    attribution:'Badan Informasi Geospasial',license:'Public government geospatial service',coverage:'Western New Guinea where source responds',
    minZoom:5,maxZoom:14,defaultVisible:false,geometry:'circle',
    style:{'circle-radius':3.2,'circle-color':'#72758c','circle-stroke-color':'#f6f5fa','circle-stroke-width':1},availability:'status'
  },
  {
    id:'settlements',family:'infrastructure',title:'Settlements',titleId:'Permukiman',
    description:'Sparse named settlement/capital layer from public BIG/RBI data.',descriptionId:'Lapisan nama permukiman/ibu kota yang ringkas dari data publik BIG/RBI.',
    sourceType:'pmtiles',source:'/geo/settlements.pmtiles',sourceLayer:'settlements',sourceUrl:'https://geoservices.big.go.id/rbi/rest/services/BASEMAP/Rupabumi_Indonesia/MapServer/5',
    attribution:'Badan Informasi Geospasial',license:'Public government geospatial service',coverage:'Western New Guinea where source responds',
    minZoom:3.6,maxZoom:14,defaultVisible:false,geometry:'circle',
    style:{'circle-radius':['interpolate',['linear'],['zoom'],3.6,1.6,8,2.5],'circle-color':'#545762','circle-opacity':.78},availability:'status'
  },
  {
    id:'population-density',family:'population',title:'Population distribution',titleId:'Sebaran penduduk',
    description:'WorldPop 2026 modeled population distribution derived from the 100 m Indonesia grid.',descriptionId:'Sebaran penduduk model WorldPop 2026 yang diturunkan dari grid Indonesia 100 m.',
    sourceType:'image',source:'/raster/population.png',sourceUrl:'https://worldpop-public-data.soton.ac.uk/GIS/Population/Global_2015_2030/R2024B/2026/IDN/v1/100m/unconstrained/',
    attribution:'WorldPop 2026',license:'CC BY 4.0 for selected release',coverage:'Western New Guinea crop',
    coverageNotes:'Modeled distribution, not a census enumeration at 100 m.',coverageNotesId:'Sebaran model, bukan pencacahan sensus pada resolusi 100 m.',
    minZoom:3,maxZoom:12,defaultVisible:false,geometry:'image',style:{'raster-opacity':.58},availability:'status'
  },
  {
    id:'current-developments',family:'current',title:'Current developments',titleId:'Perkembangan sekarang',
    description:'Published Watch Developments placed using canonical Places.',descriptionId:'Perkembangan Watch yang terbit dan ditempatkan memakai Places kanonik.',
    sourceType:'live',source:'/api/current',sourceUrl:'/current/',attribution:'West Papua Watch · linked reporting',license:'Watch metadata',coverage:'Published Developments with resolved coordinates',
    minZoom:3,maxZoom:14,defaultVisible:true,geometry:'circle',
    style:{'circle-radius':['interpolate',['linear'],['zoom'],3,4,9,7],'circle-color':'#74779f','circle-opacity':.9,'circle-stroke-color':'#f7f6fa','circle-stroke-width':1.25},availability:'always'
  }
];

export const layerById=Object.fromEntries(MAP_LAYERS.map(layer=>[layer.id,layer])) as Record<string,MapLayerDefinition>;
export const viewById=Object.fromEntries(MAP_VIEWS.map(view=>[view.id,view])) as Record<MapViewId,MapViewDefinition>;
export const DEFAULT_LAYER_IDS=viewById.overview.layers;
