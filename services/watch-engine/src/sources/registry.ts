import type { SourceConfig } from '../types';

// Provenance roles, not trust scores. Start with three enabled adapters and expand after the
// first vertical slice is observable end-to-end.
export const SOURCES:SourceConfig[]=[
  {id:'jubi',name:'Jubi',homepage:'https://jubi.id/',feed:'https://jubi.id/feed/',role:'local_newsroom',ownership:'non_state',language:['id','en'],scope:'papua',enabled:true},
  {id:'aneta-papua',name:'Aneta Papua',homepage:'https://aneta-papua.org/',feed:'https://aneta-papua.org/feed/',role:'alternative_media',ownership:'community',language:['id'],scope:'papua',enabled:true},
  {id:'mongabay-indonesia',name:'Mongabay Indonesia',homepage:'https://mongabay.co.id/',feed:'https://mongabay.co.id/feed/',role:'environmental_newsroom',ownership:'nonprofit',language:['id'],scope:'mixed',enabled:true},
  {id:'suara-papua',name:'Suara Papua',homepage:'https://suarapapua.com/',feed:'https://suarapapua.com/feed/',role:'local_newsroom',ownership:'non_state',language:['id'],scope:'papua',enabled:false},
  {id:'lao-lao-papua',name:'Lao-Lao Papua',homepage:'https://laolaopapua.com/',feed:'https://laolaopapua.com/feed/',role:'movement_media',ownership:'movement',language:['id'],scope:'papua',enabled:false},
  {id:'nadi-papua',name:'Nadi Papua',homepage:'https://nadipapua.com/',feed:'https://nadipapua.com/feed/',role:'local_newsroom',ownership:'non_state',language:['id'],scope:'papua',enabled:false},
  {id:'kalawai',name:'Kalawai',homepage:'https://kalawai.org/',feed:'https://kalawai.org/feed/',role:'civil_society',ownership:'civil_society',language:['id'],scope:'papua',enabled:false,resourceCandidate:true},
  {id:'pusaka',name:'Yayasan Pusaka Bentala Rakyat',homepage:'https://pusaka.or.id/',feed:'https://pusaka.or.id/feed/',role:'civil_society',ownership:'civil_society',language:['id','en'],scope:'papua',enabled:false,resourceCandidate:true},
  {id:'human-rights-monitor',name:'Human Rights Monitor',homepage:'https://humanrightsmonitor.org/',feed:'https://humanrightsmonitor.org/feed/',role:'monitoring_org',ownership:'civil_society',language:['en'],scope:'papua',enabled:false,resourceCandidate:true},
  {id:'project-multatuli',name:'Project Multatuli',homepage:'https://projectmultatuli.org/',feed:'https://projectmultatuli.org/feed/',role:'investigative_newsroom',ownership:'non_state',language:['id','en'],scope:'mixed',enabled:false},
  {id:'antara',name:'ANTARA',homepage:'https://www.antaranews.com/',role:'state_media',ownership:'state_owned',language:['id','en'],scope:'mixed',enabled:false}
];
export const sourceById=Object.fromEntries(SOURCES.map(source=>[source.id,source])) as Record<string,SourceConfig>;
