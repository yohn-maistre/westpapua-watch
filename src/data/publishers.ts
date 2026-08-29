export type PublisherKind =
  | 'local_newsroom'
  | 'alternative_media'
  | 'movement_media'
  | 'environmental_newsroom'
  | 'investigative_newsroom'
  | 'public_broadcaster'
  | 'civil_society'
  | 'monitoring_org'
  | 'culture_media'
  | 'structured_data'
  | 'state_media'
  | 'official_record';

export type PublisherOwnership =
  | 'non_state'
  | 'community'
  | 'movement'
  | 'civil_society'
  | 'nonprofit'
  | 'public_broadcaster'
  | 'state_owned'
  | 'government';

export type PublisherProfile = {
  id: string;
  name: string;
  homepage: string;
  kind: PublisherKind;
  ownership: PublisherOwnership;
  coverage: 'local' | 'regional' | 'national' | 'international' | 'mixed';
  languages: string[];
  ingest: 'priority' | 'standard' | 'reference';
  note: string;
};

// Provenance metadata, not a universal trust score. The Watch should show who said what
// and reward diversity across publisher roles when clustering a development.
export const publishers: PublisherProfile[] = [
  { id:'jubi', name:'Jubi', homepage:'https://jubi.id/', kind:'local_newsroom', ownership:'non_state', coverage:'regional', languages:['id','en'], ingest:'priority', note:'Papua-based newsroom with daily local reporting and an English edition.' },
  { id:'suara-papua', name:'Suara Papua', homepage:'https://suarapapua.com/', kind:'local_newsroom', ownership:'non_state', coverage:'regional', languages:['id','en'], ingest:'priority', note:'Papua-based newsroom covering politics, rights, environment, culture and community reporting.' },
  { id:'aneta-papua', name:'Aneta Papua', homepage:'https://aneta-papua.org/', kind:'alternative_media', ownership:'community', coverage:'regional', languages:['id'], ingest:'priority', note:'Alternative Papuan media focused on Papuan women and marginalized groups.' },
  { id:'lao-lao-papua', name:'Lao-Lao Papua', homepage:'https://laolaopapua.com/', kind:'movement_media', ownership:'movement', coverage:'regional', languages:['id'], ingest:'standard', note:'Movement media publishing opinion, analysis and reporting from an explicit pro-liberation political position.' },
  { id:'nadi-papua', name:'Nadi Papua', homepage:'https://nadipapua.com/', kind:'local_newsroom', ownership:'non_state', coverage:'regional', languages:['id'], ingest:'standard', note:'Nabire-based Papuan newsroom with regional reporting, analysis and community contributions.' },
  { id:'kalawai', name:'Kalawai', homepage:'https://kalawai.org/', kind:'culture_media', ownership:'civil_society', coverage:'regional', languages:['id'], ingest:'standard', note:'Media and community study centre publishing analysis, village reporting, research, interviews and documentaries.' },
  { id:'mongabay-indonesia', name:'Mongabay Indonesia', homepage:'https://mongabay.co.id/', kind:'environmental_newsroom', ownership:'nonprofit', coverage:'national', languages:['id'], ingest:'priority', note:'Environmental journalism on land, forests, mining and Indigenous rights.' },
  { id:'project-multatuli', name:'Project Multatuli', homepage:'https://projectmultatuli.org/', kind:'investigative_newsroom', ownership:'non_state', coverage:'national', languages:['id','en'], ingest:'standard', note:'Investigative and public-interest reporting for deeper issue records.' },
  { id:'rnz-pacific', name:'RNZ Pacific', homepage:'https://www.rnz.co.nz/international/pacific-news', kind:'public_broadcaster', ownership:'public_broadcaster', coverage:'international', languages:['en'], ingest:'standard', note:'Pacific regional reporting for external triangulation and Melanesian context.' },
  { id:'pusaka', name:'Yayasan Pusaka Bentala Rakyat', homepage:'https://pusaka.or.id/', kind:'civil_society', ownership:'civil_society', coverage:'regional', languages:['id','en'], ingest:'priority', note:'Research and advocacy on Indigenous rights, forests, land and development in Tanah Papua.' },
  { id:'human-rights-monitor', name:'Human Rights Monitor', homepage:'https://humanrightsmonitor.org/', kind:'monitoring_org', ownership:'civil_society', coverage:'regional', languages:['en'], ingest:'priority', note:'Human-rights monitoring and periodic reports for issue timelines and corroboration.' },
  { id:'papuan-voices', name:'Papuan Voices', homepage:'https://papuanvoices.net/', kind:'culture_media', ownership:'community', coverage:'regional', languages:['id','en'], ingest:'reference', note:'Papuan documentary and community storytelling network; primarily useful for Resources and Exhibition.' },
  { id:'acled', name:'ACLED', homepage:'https://acleddata.com/', kind:'structured_data', ownership:'nonprofit', coverage:'international', languages:['en'], ingest:'reference', note:'Structured conflict-event data; use as a dataset rather than prose journalism.' },
  { id:'antara', name:'ANTARA', homepage:'https://www.antaranews.com/', kind:'state_media', ownership:'state_owned', coverage:'national', languages:['id','en'], ingest:'standard', note:'Indonesian state-owned news agency. Preserve as a state-media perspective, not an official primary record.' },
  { id:'indonesian-government', name:'Indonesian government records', homepage:'https://www.indonesia.go.id/', kind:'official_record', ownership:'government', coverage:'national', languages:['id','en'], ingest:'reference', note:'Ministries, provincial governments, TNI/Polri statements and legal records; label explicitly as official statements or primary records.' }
];

export const publisherById = Object.fromEntries(publishers.map((publisher) => [publisher.id, publisher]));
