import {itemBySourceId} from '../../data/library';
import data from '../../../content/conflict-map.json';
export const CONFLICT_PERIODS=data.periods;
export const CONFLICT_LAYER_IDS=['conflict-deployments','conflict-incidents','conflict-displacement'];
export const conflictFeatures=(kind:string,period:string)=>({type:'FeatureCollection' as const,features:data.features.filter(f=>f.properties.kind===kind&&f.properties.period===period).map(f=>{const source=itemBySourceId[f.properties.source_id];return {...f,properties:{...f.properties,source_url:source?.url||'',publisher:source?.publisher||'',published_at:source?.publishedAt||''}}})});
export const conflictPeriod=(id:string|null)=>CONFLICT_PERIODS.find(p=>p.id===id)||CONFLICT_PERIODS[2];
