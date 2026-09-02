export type MapLayerFamily='boundaries'|'extraction'|'environment'|'current';
export type MapLayerSourceType='pmtiles'|'live';
export type MapLayerDefinition={
  id:string;family:MapLayerFamily;title:string;titleId:string;description:string;descriptionId:string;
  sourceType:MapLayerSourceType;source:string;sourceLayer?:string;sourceUrl:string;attribution:string;license:string;
  coverage:string;coverageNotes?:string;coverageNotesId?:string;minZoom:number;maxZoom:number;defaultVisible:boolean;
  geometry:'line'|'fill'|'circle';style:Record<string,unknown>;
};

// Slightly past 141°E so the Indonesian boundary itself is not clipped, without
// turning a Western New Guinea atlas into another world map by accident.
export const WEST_PAPUA_BOUNDS:[[number,number],[number,number]]=[[129,-11],[141.15,1.5]];
export const WEST_PAPUA_CENTER:[number,number]=[135.55,-4.1];

export const MAP_FAMILIES:{id:MapLayerFamily;title:string;titleId:string}[]=[
  {id:'boundaries',title:'Boundaries',titleId:'Batas'},
  {id:'extraction',title:'Extraction',titleId:'Ekstraksi'},
  {id:'environment',title:'Environment',titleId:'Lingkungan'},
  {id:'current',title:'Current',titleId:'Sekarang'}
];

export const MAP_LAYERS:MapLayerDefinition[]=[
  {
    id:'province-boundaries',family:'boundaries',title:'Provinces',titleId:'Provinsi',
    description:'Administrative province outlines across Western New Guinea.',descriptionId:'Batas administrasi provinsi di Papua bagian barat.',
    sourceType:'pmtiles',source:'/geo/provinces.pmtiles',sourceLayer:'provinces',
    sourceUrl:'https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/BATAS_WILAYAH/MapServer/12',
    attribution:'Badan Informasi Geospasial',license:'Public government geospatial service',coverage:'Western New Guinea',
    minZoom:3,maxZoom:12,defaultVisible:true,geometry:'line',
    style:{'line-color':'#42434a','line-width':['interpolate',['linear'],['zoom'],3,0.9,8,1.45],'line-opacity':0.82}
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
    style:{'line-color':'#7778ad','line-width':['interpolate',['linear'],['zoom'],3,1.05,8,1.7],'line-dasharray':[2.5,2.5],'line-opacity':0.82}
  },
  {
    id:'mining-permits',family:'extraction',title:'Mining permits',titleId:'Izin tambang',
    description:'IUP/WIUP mining permit polygons clipped to Western New Guinea.',descriptionId:'Poligon izin pertambangan IUP/WIUP yang dibatasi ke Papua bagian barat.',
    sourceType:'pmtiles',source:'/geo/mining.pmtiles',sourceLayer:'mining',sourceUrl:'https://geoportal.esdm.go.id/gis1/rest/services/Join_WIUP_vs_IPPKH/MapServer/0',
    attribution:'Kementerian ESDM · Ditjen Minerba',license:'Open ArcGIS service',coverage:'Western New Guinea',
    minZoom:4,maxZoom:13,defaultVisible:false,geometry:'fill',
    style:{'fill-color':'#b6a0c8','fill-opacity':0.24,'fill-outline-color':'#756486'}
  },
  {
    id:'forest-plantation-permits',family:'extraction',title:'Forest & plantation permits',titleId:'Izin hutan & perkebunan',
    description:'Logging, HTI and available plantation permit polygons from BIG Satu Peta.',descriptionId:'Poligon izin pembalakan, HTI, dan perkebunan yang tersedia dari BIG Satu Peta.',
    sourceType:'pmtiles',source:'/geo/concessions.pmtiles',sourceLayer:'concessions',sourceUrl:'https://kspservices.big.go.id/satupeta/rest/services/PUBLIK/PERIZINAN_DAN_PERTANAHAN/MapServer',
    attribution:'KLHK · BIG Satu Peta',license:'Kebijakan Satu Peta / Satu Data',coverage:'Western New Guinea',
    coverageNotes:'Plantation coverage is partial where public services expose only local permit layers.',coverageNotesId:'Cakupan izin perkebunan sebagian karena layanan publik hanya membuka sejumlah lapisan daerah.',
    minZoom:4,maxZoom:13,defaultVisible:false,geometry:'fill',
    style:{'fill-color':['match',['get','jenis'],'logging','#b8ad82','hti','#a9b88d','sawit','#c2a286','#b5ab98'],'fill-opacity':0.22,'fill-outline-color':'#817866'}
  },
  {
    id:'protected-areas',family:'environment',title:'Protected areas',titleId:'Kawasan konservasi',
    description:'Conservation-area zoning available through BIG Satu Peta, clipped to Western New Guinea.',descriptionId:'Zonasi kawasan konservasi yang tersedia melalui BIG Satu Peta, dibatasi ke Papua bagian barat.',
    sourceType:'pmtiles',source:'/geo/protected.pmtiles',sourceLayer:'protected',sourceUrl:'https://kspservices.big.go.id/satupeta/rest/services/PUBLIK/SUMBER_DAYA_ALAM_DAN_LINGKUNGAN/MapServer/33',
    attribution:'BIG Satu Peta · environmental data producers',license:'Public government geospatial service',coverage:'Western New Guinea',
    coverageNotes:'Represents the published conservation-zoning layer, not every possible conservation designation.',coverageNotesId:'Menampilkan lapisan zonasi konservasi yang dipublikasikan, bukan seluruh jenis penetapan kawasan lindung.',
    minZoom:4,maxZoom:13,defaultVisible:false,geometry:'fill',
    style:{'fill-color':'#98bca6','fill-opacity':0.2,'fill-outline-color':'#668774'}
  },
  {
    id:'fire-hotspots',family:'environment',title:'Fire hotspots',titleId:'Titik panas',
    description:'Recent satellite thermal detections. A hotspot is not automatically a confirmed wildfire.',descriptionId:'Deteksi termal satelit terbaru. Titik panas tidak otomatis berarti kebakaran yang telah dikonfirmasi.',
    sourceType:'live',source:'/api/fires',sourceUrl:'https://firms.modaps.eosdis.nasa.gov/',attribution:'NASA FIRMS · VIIRS NOAA-21',license:'NASA Earth observation data',coverage:'Western New Guinea',
    coverageNotes:'Near-real-time satellite detections; cloud and orbit timing affect observations.',coverageNotesId:'Deteksi satelit mendekati waktu nyata; awan dan waktu lintasan satelit memengaruhi pengamatan.',
    minZoom:3,maxZoom:14,defaultVisible:false,geometry:'circle',
    style:{'circle-radius':['interpolate',['linear'],['zoom'],3,2.5,9,5.5],'circle-color':'#b56f5d','circle-opacity':0.78,'circle-stroke-color':'#fff7ed','circle-stroke-width':0.8}
  },
  {
    id:'current-developments',family:'current',title:'Current developments',titleId:'Perkembangan sekarang',
    description:'Published Watch Developments placed using the canonical Place registry.',descriptionId:'Perkembangan Watch yang telah terbit dan ditempatkan memakai registri lokasi kanonik.',
    sourceType:'live',source:'/api/current',sourceUrl:'/current/',attribution:'West Papua Watch · linked reporting',license:'Watch metadata',coverage:'Published Developments with resolved coordinates',
    coverageNotes:'Developments without a resolved canonical coordinate remain in the newsroom but are not forced onto the map.',coverageNotesId:'Perkembangan tanpa koordinat kanonik tetap disimpan, tetapi tidak dipaksa muncul pada peta.',
    minZoom:3,maxZoom:14,defaultVisible:true,geometry:'circle',
    style:{'circle-radius':['interpolate',['linear'],['zoom'],3,4,9,7],'circle-color':'#7779b7','circle-opacity':0.9,'circle-stroke-color':'#f7f5ef','circle-stroke-width':1.25}
  }
];

export const layerById=Object.fromEntries(MAP_LAYERS.map(layer=>[layer.id,layer])) as Record<string,MapLayerDefinition>;
export const DEFAULT_LAYER_IDS=MAP_LAYERS.filter(layer=>layer.defaultVisible).map(layer=>layer.id);
