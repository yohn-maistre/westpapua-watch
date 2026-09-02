import type {StyleSpecification} from 'maplibre-gl';

export const WATCH_BASE_STYLE:StyleSpecification={
  version:8,
  glyphs:'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  sources:{
    base:{type:'vector',url:'https://tiles.openfreemap.org/planet'}
  },
  layers:[
    {id:'paper',type:'background',paint:{'background-color':'#f2f0e9'}},
    {id:'landcover',type:'fill',source:'base','source-layer':'landcover',minzoom:4,paint:{'fill-color':['match',['get','class'],'wood','#e5e7dc','grass','#ebe9df','#eceae2'],'fill-opacity':0.65}},
    {id:'water',type:'fill',source:'base','source-layer':'water',paint:{'fill-color':'#d9e3e5'}},
    {id:'waterway',type:'line',source:'base','source-layer':'waterway',minzoom:7,paint:{'line-color':'#c8d6d9','line-width':0.7,'line-opacity':0.8}},
    {id:'roads-major',type:'line',source:'base','source-layer':'transportation',minzoom:6,filter:['match',['get','class'],['motorway','trunk','primary','secondary'],true,false],paint:{'line-color':'#d0cdc4','line-width':['interpolate',['linear'],['zoom'],6,0.35,11,1.4],'line-opacity':0.75}},
    {id:'admin-country',type:'line',source:'base','source-layer':'boundary',filter:['==',['get','admin_level'],2],paint:{'line-color':'#6b6c70','line-width':1.1,'line-opacity':0.72}},
    {id:'place-labels',type:'symbol',source:'base','source-layer':'place',minzoom:4,filter:['match',['get','class'],['city','town'],true,false],layout:{'text-field':['coalesce',['get','name:en'],['get','name']],'text-font':['Noto Sans Regular'],'text-size':['interpolate',['linear'],['zoom'],4,10,9,13],'text-max-width':8},paint:{'text-color':'#4a4b50','text-halo-color':'#f2f0e9','text-halo-width':1.1,'text-halo-blur':0.4}}
  ]
};
