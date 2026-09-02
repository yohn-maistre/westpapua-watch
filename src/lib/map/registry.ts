export type MapLayerFamily='boundaries'|'extraction'|'environment'|'current';
export type MapLayerSourceType='pmtiles'|'live';
export type MapViewId='overview'|'extraction'|'environment'|'current';
export type MapLayerDefinition={
  id:string;family:MapLayerFamily;title:string;titleId:string;description:string;descriptionId:string;
  sourceType:MapLayerSourceType;source:string;sourceLayer?:string;sourceUrl:string;attribution:string;license:string;
  coverage:string;coverageNotes?:string;coverageNotesId?:string;minZoom:number;maxZoom:number;defaultVisible:boolean;
  geometry:'line'|'fill'|'circle';style:Record<string,unknown>;
};
export type MapViewDefinition={id:MapViewId;title:string;titleId:string;layers:string[]};

export const WEST_PAPUA_BOUNDS:[[number,number],[number,number]]=[[129,-11],[141.15,1.5]];
export const WEST_PAPUA_CENTER:[number,number]=[135.55,-4.1];

export const MAP_FAMILIES:{id:MapLayerFamily;title:string;titleId:string}[]=[
  {id:'boundaries',title:'Boundaries',titleId:'Batas'},
  {id:'extraction',title:'Extraction',titleId:'Ekstraksi'},
  {id:'environment',title:'Environment',titleId:'Lingkungan'},
  {id:'current',title:'Current',titleId:'Sekarang'}
];

export const MAP_VIEWS:MapViewDefinition[]=[
  {id:'overview',title:'Overview',titleId:'Ringkasan',layers:['province-boundaries','cultural-regions','fire-hotspots','current-developments']},
  {id:'extraction',title:'Extraction',titleId:'Ekstraksi',layers:['province-boundaries','cultural-regions','mining-permits','major-extraction-sites','forest-plantation-permits','current-developments']},
  {id:'environment',title:'Environment',titleId:'Lingkungan',layers:['province-boundaries','protected-areas','fire-hotspots','current-developments']},
  {id:'current',title:'Current',titleId:'Sekarang',layers:['province-boundaries','current-developments']}
];

export const MAP_LAYERS:MapLayerDefinition[]=[
  {
    id:'province-boundaries',family:'boundaries',title:'Provinces',titleId:'Provinsi',
    description:'Administrative province outlines across Western New Guinea.',descriptionId:'Batas administrasi provinsi di Papua bagian barat.',
    sourceType:'pmtiles',source:'/geo/provinces.pmtiles',sourceLayer:'provinces',
    sourceUrl:'https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/BATAS_WILAYAH/MapServer/12',
    attribution:'Badan Informasi Geospasial',license:'Public government geospatial service',coverage:'Western New Guinea',
    minZoom:3,maxZoom:12,defaultVisible:true,geometry:'line',
    style:{'line-color':'#4b4c54','line-width':['interpolate',['linear'],['zoom'],3,0.8,8,1.35],'line-opacity':0.78}
  },
  {
    id:'cultural-regions',family:'boundaries',title:'Cultural regions',titleId:'Wilayah budaya',
    description:'Seven generalized reference regions derived from regency membership used in national planning documents. Not customary-land or cadastral boundaries.',
    descriptionId:'Tujuh wilayah referensi yang digeneralisasi dari keanggotaan kabupaten dalam dokumen perencanaan nasional. Bukan batas tanah adat atau kadaster.',
    sourceType:'pmtiles',source:'/geo/cultural_regions.pmtiles',sourceLayer:'cultural_regions',
    sourceUrl:'https://ditkumlasi.bappenas.go.id/download/file/Narasi_RPJMN_2020-2024.pdf',
    attribution:'Bappenas reference-region membership · BIG administrative geometry',license:'Reference/generalized',coverage:'Western New Guinea',
    coverageNotes:'Generalized to whole regencies. Internal customary boundaries can differ and are not represented.',
    coverageNotesId:'Digeneralisasi mengikuti kabupaten. Batas adat di dalamnya dapat berbeda dan tidak digambarkan di sini.',
    minZoom:3,maxZoom:12,defaultVisible:true,geometry:'line',
    style:{'line-color':'#77799f','line-width':['interpolate',['linear'],['zoom'],3,1,8,1.55],'line-dasharray':[2.5,2.5],'line-opacity':0.74}
  },
  {
    id:'mining-permits',family:'extraction',title:'Mining permits',titleId:'Izin tambang',
    description:'IUP/WIUP mining permit polygons clipped to Western New Guinea.',descriptionId:'Poligon izin pertambangan IUP/WIUP yang dibatasi ke Papua bagian barat.',
    sourceType:'pmtiles',source:'/geo/mining.pmtiles',sourceLayer:'mining',sourceUrl:'https://geoportal.esdm.go.id/gis1/rest/services/Join_WIUP_vs_IPPKH/MapServer/0',
    attribution:'Kementerian ESDM · Ditjen Minerba',license:'Open ArcGIS service',coverage:'Western New Guinea',
    minZoom:4,maxZoom:13,defaultVisible:false,geometry:'fill',
    style:{'fill-color':'#aaa0b3','fill-opacity':0.18,'fill-outline-color':'#756b7c'}
  },
  {
    id:'major-extraction-sites',family:'extraction',title:'Major extraction sites',titleId:'Lokasi ekstraksi utama',
    description:'Major mining operations not represented cleanly by the current public IUP/WIUP polygon layer.',descriptionId:'Operasi pertambangan utama yang belum terwakili dengan baik oleh lapisan poligon IUP/WIUP publik saat ini.',
    sourceType:'live',source:'/data/major-extraction-sites.geojson',sourceUrl:'https://ptfi.co.id/en/our-operation-areas',
    attribution:'PT Freeport Indonesia · sourced site metadata',license:'Public reference metadata',coverage:'Western New Guinea',
    coverageNotes:'Site points identify major operations; they are not permit or cadastral boundaries.',coverageNotesId:'Titik menunjukkan lokasi operasi utama; bukan batas izin atau kadaster.',
    minZoom:3,maxZoom:14,defaultVisible:false,geometry:'circle',
    style:{'circle-radius':['interpolate',['linear'],['zoom'],3,5,9,8.5],'circle-color':'#675d70','circle-opacity':.92,'circle-stroke-color':'#f6f5fa','circle-stroke-width':1.5}
  },
  {
    id:'forest-plantation-permits',family:'extraction',title:'Forest & plantation permits',titleId:'Izin hutan & perkebunan',
    description:'Logging, HTI and available plantation permit polygons from BIG Satu Peta.',descriptionId:'Poligon izin pembalakan, HTI, dan perkebunan yang tersedia dari BIG Satu Peta.',
    sourceType:'pmtiles',source:'/geo/concessions.pmtiles',sourceLayer:'concessions',sourceUrl:'https://kspservices.big.go.id/satupeta/rest/services/PUBLIK/PERIZINAN_DAN_PERTANAHAN/MapServer',
    attribution:'KLHK · BIG Satu Peta',license:'Kebijakan Satu Peta / Satu Data',coverage:'Western New Guinea',
    coverageNotes:'Plantation coverage is partial where public services expose only local permit layers.',coverageNotesId:'Cakupan izin perkebunan sebagian karena layanan publik hanya membuka sejumlah lapisan daerah.',
    minZoom:4,maxZoom:13,defaultVisible:false,geometry:'fill',
    style:{'fill-color':['match',['get','jenis'],'logging','#aaa38b','hti','#9eaa93','sawit','#b29a89','#a9a294'],'fill-opacity':0.18,'fill-outline-color':'#7d7669'}
  },
  {
    id:'protected-areas',family:'environment',title:'Protected areas',titleId:'Kawasan konservasi',
    description:'Conservation-area zoning available through BIG Satu Peta, clipped to Western New Guinea.',descriptionId:'Zonasi kawasan konservasi yang tersedia melalui BIG Satu Peta, dibatasi ke Papua bagian barat.',
    sourceType:'pmtiles',source:'/geo/protected.pmtiles',sourceLayer:'protected',sourceUrl:'https://kspservices.big.go.id/satupeta/rest/services/PUBLIK/SUMBER_DAYA_ALAM_DAN_LINGKUNGAN/MapServer/33',
    attribution:'BIG Satu Peta · environmental data producers',license:'Public government geospatial service',coverage:'Western New Guinea',
    coverageNotes:'Represents the published conservation-zoning layer, not every possible conservation designation.',coverageNotesId:'Menampilkan lapisan zonasi konservasi yang dipublikasikan, bukan seluruh jenis penetapan kawasan lindung.',
    minZoom:4,maxZoom:13,defaultVisible:false,geometry:'fill',
    style:{'fill-color':'#96ad9f','fill-opacity':0.17,'fill-outline-color':'#687e70'}
  },
  {
    id:'fire-hotspots',family:'environment',title:'Fire hotspots',titleId:'Titik panas',
    description:'Recent NASA FIRMS satellite hotspots.',descriptionId:'Titik panas satelit NASA FIRMS terbaru.',
    sourceType:'live',source:'/api/fires',sourceUrl:'https://firms.modaps.eosdis.nasa.gov/',attribution:'NASA FIRMS · VIIRS NOAA-21',license:'NASA Earth observation data',coverage:'Western New Guinea',
    coverageNotes:'Near-real-time satellite detections; cloud and orbit timing affect observations.',coverageNotesId:'Deteksi satelit mendekati waktu nyata; awan dan waktu lintasan satelit memengaruhi pengamatan.',
    minZoom:3,maxZoom:14,defaultVisible:false,geometry:'circle',
    style:{'circle-radius':['interpolate',['linear'],['zoom'],3,2.5,9,5.5],'circle-color':'#aa6f62','circle-opacity':0.76,'circle-stroke-color':'#faf8f3','circle-stroke-width':0.8}
  },
  {
    id:'current-developments',family:'current',title:'Current developments',titleId:'Perkembangan sekarang',
    description:'Published Watch Developments placed using the canonical Place registry.',descriptionId:'Perkembangan Watch yang telah terbit dan ditempatkan memakai registri lokasi kanonik.',
    sourceType:'live',source:'/api/current',sourceUrl:'/current/',attribution:'West Papua Watch · linked reporting',license:'Watch metadata',coverage:'Published Developments with resolved coordinates',
    coverageNotes:'Developments without a resolved canonical coordinate remain in the newsroom but are not forced onto the map.',coverageNotesId:'Perkembangan tanpa koordinat kanonik tetap disimpan, tetapi tidak dipaksa muncul pada peta.',
    minZoom:3,maxZoom:14,defaultVisible:true,geometry:'circle',
    style:{'circle-radius':['interpolate',['linear'],['zoom'],3,4,9,7],'circle-color':'#74779f','circle-opacity':0.88,'circle-stroke-color':'#f7f6fa','circle-stroke-width':1.25}
  }
];

export const layerById=Object.fromEntries(MAP_LAYERS.map(layer=>[layer.id,layer])) as Record<string,MapLayerDefinition>;
export const viewById=Object.fromEntries(MAP_VIEWS.map(view=>[view.id,view])) as Record<MapViewId,MapViewDefinition>;
export const DEFAULT_LAYER_IDS=viewById.overview.layers;
