import {forceSimulation,forceManyBody,forceLink,forceX,forceY,forceCollide} from 'd3-force';
import type {SimulationNodeDatum,SimulationLinkDatum} from 'd3-force';
import type {InvestigativeRecord,RecordCase,RecordClaim} from '../data/investigative-record';
export type NetworkNode=SimulationNodeDatum&{id:string;group:number;degree:number;tx:number;ty:number};
export type NetworkLink=SimulationLinkDatum<NetworkNode>&{id:string;source:string|NetworkNode;target:string|NetworkNode};
export const networkFamily=(kind:string)=>['company','business-group','financial'].includes(kind)?'business':['community','claimant-group','organisation'].includes(kind)?'community':'authority';
export function networkModel(data:InvestigativeRecord,dossier:RecordCase,claims:RecordClaim[],width:number,height:number,options:{positions?:Record<string,[number,number]>;settle?:boolean}={}){
 const ids=[...new Set(claims.flatMap(c=>[c.subject,c.object]))].sort(),entityMap=new Map(data.entities.map(e=>[e.id,e]));
 const authored=dossier.groups&&ids.every(id=>dossier.groups!.some(g=>g.entityIds.includes(id)));
 const titles=authored?dossier.groups!.map(g=>g.title):[{en:'Public authority',pmy:'Kewenangan negara'},{en:'Business & material',pmy:'Usaha & barang'},{en:'Land & communities',pmy:'Tanah & masyarakat'},{en:'Action & accountability',pmy:'Perjuangan & hukum'}];
 const groupFor=(id:string)=>{
  if(authored)return dossier.groups!.findIndex(g=>g.entityIds.includes(id));
  const kind=entityMap.get(id)?.kind||'';
  return ['company','business-group','financial'].includes(kind)?1:['community','place','claimant-group'].includes(kind)?2:['organisation','document','mechanism'].includes(kind)?3:0;
 };
 const anchors=[[width*.25,height*.27],[width*.74,height*.28],[width*.25,height*.73],[width*.74,height*.73]];
 const nodes:NetworkNode[]=ids.map((id,i)=>{const group=groupFor(id),[tx,ty]=anchors[group]||anchors[0],saved=options.positions?.[id];return{id,group,degree:claims.filter(c=>c.subject===id||c.object===id).length,tx,ty,x:saved?saved[0]*width:tx+Math.cos(i*2.399)*30,y:saved?saved[1]*height:ty+Math.sin(i*2.399)*30}});
 const links:NetworkLink[]=claims.map(c=>({id:c.id,source:c.subject,target:c.object}));
 const dense=width<650||nodes.length>65;
 const radius=dense?Math.max(12,Math.min(24,Math.sqrt(width*height/nodes.length)/4.1)):50;
 function simulation(){
  // Only private layout nodes are mutated. The accepted editorial record stays immutable.
  return forceSimulation<NetworkNode>(nodes).stop()
   .force('charge',forceManyBody<NetworkNode>().strength(dense?-65:-150))
   .force('links',forceLink<NetworkNode,NetworkLink>(links).id(n=>n.id).distance(dense?64:130).strength(.045))
   .force('x',forceX<NetworkNode>(n=>n.tx).strength(.075))
   .force('y',forceY<NetworkNode>(n=>n.ty).strength(.075))
   .force('collide',forceCollide<NetworkNode>(radius).iterations(2))
   .force('bounds',()=>{
    for(const n of nodes){n.x=Math.max(dense?22:70,Math.min(width-(dense?22:70),n.x!));n.y=Math.max(dense?35:55,Math.min(height-(dense?30:60),n.y!))}
   });
 }
 const sim=simulation();if(options.settle!==false)sim.tick(180);sim.stop();
 return {nodes,links,titles,anchors,dense,simulation:sim,initial:new Map(nodes.map(n=>[n.id,{x:n.x!,y:n.y!}]))};
}
export function edgePath(a:NetworkNode,b:NetworkNode,index=0){
 const dx=b.x!-a.x!,dy=b.y!-a.y!,length=Math.max(1,Math.hypot(dx,dy)),bend=18+index*24;
 const sx=a.x!+dx/length*9,sy=a.y!+dy/length*9,ex=b.x!-dx/length*11,ey=b.y!-dy/length*11;
 return 'M'+sx+','+sy+' Q'+((sx+ex)/2-dy/length*bend)+','+((sy+ey)/2+dx/length*bend)+' '+ex+','+ey;
}
export function networkLines(text:string,max=18){const result:string[]=[];for(const word of text.split(' ')){if(!result.length||result.at(-1)!.length+word.length+1>max)result.push(word);else result[result.length-1]+=' '+word}return result}
