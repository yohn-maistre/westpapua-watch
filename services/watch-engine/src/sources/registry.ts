import type { SourceConfig } from '../types';

// Roles describe provenance, not a numerical truth score. Sources can be useful while carrying
// different institutional positions. Keep mixed/state/public sources attributed in synthesis.
export const SOURCES:SourceConfig[]=[
  {id:'jubi',name:'Jubi',homepage:'https://jubi.id/',feed:'https://jubi.id/feed/',role:'local_newsroom',ownership:'non_state',language:['id','en'],scope:'papua',enabled:true,priority:1},
  {id:'aneta-papua',name:'Aneta Papua',homepage:'https://aneta-papua.org/',feed:'https://aneta-papua.org/feed/',role:'alternative_media',ownership:'community',language:['id'],scope:'papua',enabled:true,priority:1},
  {id:'mongabay-indonesia',name:'Mongabay Indonesia',homepage:'https://mongabay.co.id/',feed:'https://mongabay.co.id/feed/',role:'environmental_newsroom',ownership:'nonprofit',language:['id'],scope:'mixed',enabled:true,priority:1},
  {id:'suara-papua',name:'Suara Papua',homepage:'https://suarapapua.com/',feed:'https://suarapapua.com/feed/',role:'local_newsroom',ownership:'non_state',language:['id'],scope:'papua',enabled:true,priority:1},
  {id:'project-multatuli',name:'Project Multatuli',homepage:'https://projectmultatuli.org/',feed:'https://projectmultatuli.org/feed/',role:'investigative_newsroom',ownership:'non_state',language:['id','en'],scope:'mixed',enabled:true,priority:1},
  {id:'lao-lao-papua',name:'Lao-Lao Papua',homepage:'https://laolaopapua.com/',feed:'https://laolaopapua.com/feed/',role:'movement_media',ownership:'movement',language:['id'],scope:'papua',enabled:false,priority:2,notes:'Enable after feed/on-ground review.'},
  {id:'nadi-papua',name:'Nadi Papua',homepage:'https://nadipapua.com/',feed:'https://nadipapua.com/feed/',role:'local_newsroom',ownership:'non_state',language:['id'],scope:'papua',enabled:false,priority:2},
  {id:'bbc-indonesia',name:'BBC News Indonesia',homepage:'https://www.bbc.com/indonesia',role:'public_service_media',ownership:'public_service',language:['id'],scope:'mixed',enabled:false,priority:2},
  {id:'rnz-pacific',name:'RNZ Pacific',homepage:'https://www.rnz.co.nz/international/pacific-news',role:'public_service_media',ownership:'public_service',language:['en'],scope:'mixed',enabled:false,priority:2},
  {id:'abc-pacific',name:'ABC Pacific',homepage:'https://www.abc.net.au/pacific',role:'public_service_media',ownership:'public_service',language:['en'],scope:'mixed',enabled:false,priority:2},
  {id:'rri',name:'RRI',homepage:'https://rri.co.id/',role:'state_public_media',ownership:'state_public_broadcaster',language:['id'],scope:'mixed',enabled:false,priority:3,notes:'Useful local supplement; keep ownership visible.'},
  {id:'antara',name:'ANTARA',homepage:'https://www.antaranews.com/',role:'state_media',ownership:'state_owned',language:['id','en'],scope:'mixed',enabled:false,priority:3},
  {id:'kalawai',name:'Kalawai',homepage:'https://kalawai.org/',feed:'https://kalawai.org/feed/',role:'civil_society',ownership:'civil_society',language:['id'],scope:'papua',enabled:false,resourceCandidate:true,priority:1},
  {id:'pusaka',name:'Yayasan Pusaka Bentala Rakyat',homepage:'https://pusaka.or.id/',feed:'https://pusaka.or.id/feed/',role:'civil_society',ownership:'civil_society',language:['id','en'],scope:'papua',enabled:false,resourceCandidate:true,priority:1},
  {id:'human-rights-monitor',name:'Human Rights Monitor',homepage:'https://humanrightsmonitor.org/',feed:'https://humanrightsmonitor.org/feed/',role:'monitoring_org',ownership:'civil_society',language:['en'],scope:'papua',enabled:false,resourceCandidate:true,priority:1},
  {id:'papuan-voices',name:'Papuan Voices',homepage:'https://papuanvoices.net/',role:'civil_society',ownership:'community_media',language:['id','en'],scope:'papua',enabled:false,resourceCandidate:true,priority:1},
  {id:'acled',name:'ACLED',homepage:'https://acleddata.com/',role:'monitoring_org',ownership:'nonprofit',language:['en'],scope:'mixed',enabled:false,resourceCandidate:true,priority:2}
];
export const sourceById=Object.fromEntries(SOURCES.map(source=>[source.id,source])) as Record<string,SourceConfig>;
