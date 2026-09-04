import type { Issue } from './types';

// Freeze 10.8: these named persistent subjects were the original public Issues.
// They remain first-class Dossiers so existing URLs and Current relationships do not break.
export const dossiers: Issue[] = [
  {
    slug:'mining-raja-ampat',category:'Environment',
    title:{en:'Mining in Raja Ampat',pmy:'Tambang di Raja Ampat'},
    summary:{en:'Mining permits, operating sites, marine and terrestrial ecosystems, customary land and public scrutiny across Raja Ampat.',pmy:'Izin tambang, lokasi yang masih jalan, ekosistem laut deng darat, tanah adat, deng perhatian publik di Raja Ampat.'},
    status:{en:'Active review',pmy:'Masih dipantau'},updatedAt:'2026-08-25',
    developmentSlugs:['raja-ampat-mining-august-2026'],sourceIds:['greenpeace-raja-clarification-2026','mongabay-raja-2026','greenpeace-arborek-2026'],concepts:['extractivism','ecocide','customary-land','sasi']
  },
  {
    slug:'lake-sentani-watershed',category:'Environment',
    title:{en:'Lake Sentani watershed',pmy:'Daerah aliran Danau Sentani'},
    summary:{en:'Water quality, sedimentation, mining pressure, biodiversity and livelihoods around Lake Sentani and the Cycloop foothills.',pmy:'Kualitas air, sedimentasi, tekanan tambang, keanekaragaman hayati, deng mata pencaharian sekitar Danau Sentani deng kaki Cycloop.'},
    status:{en:'Active concern',pmy:'Masih jadi perhatian'},updatedAt:'2026-08-27',
    developmentSlugs:['lake-sentani-illegal-mining-august-2026'],sourceIds:['jubi-sentani-mining-2026','mongabay-sentani-mining-2026'],concepts:['extractivism','ecocide','customary-land']
  },
  {
    slug:'south-papua-food-energy-estate',category:'Land',
    title:{en:'South Papua food and energy estate',pmy:'Proyek pangan deng energi Papua Selatan'},
    summary:{en:'Land, forests, livelihoods and the large-scale food and energy projects being developed in and around Merauke.',pmy:'Tanah, hutan, mata pencaharian, deng proyek pangan dan energi skala besar di sekitar Merauke.'},
    status:{en:'Long-running',pmy:'Sudah lama jalan'},updatedAt:'2026-08-14',
    developmentSlugs:['south-papua-hria-reports'],sourceIds:['jubi-hria-2026','pusaka-news','hrw-land-2026'],concepts:['extractivism','gastrocolonialism','customary-land']
  },
  {
    slug:'conflict-displacement-access',category:'Human rights',
    title:{en:'Conflict, displacement and access',pmy:'Konflik, pengungsian, deng akses'},
    summary:{en:'Civilian displacement, access to services and independent monitoring in conflict-affected areas.',pmy:'Pengungsian warga sipil, akses layanan, deng pemantauan independen di wilayah terdampak konflik.'},
    status:{en:'Ongoing concern',pmy:'Masih jadi perhatian'},updatedAt:'2026-08-10',
    developmentSlugs:['papua-monitor-q2-2026'],sourceIds:['hrm-q2-2026','hrm-home-2026','jubi-news'],concepts:['humanitarian-access','internal-displacement']
  },
  {
    slug:'political-status-representation',category:'Politics',
    title:{en:'Political status and representation',pmy:'Status politik deng keterwakilan'},
    summary:{en:'The historical political status of the territory, regional institutions, autonomy and Papuan representation.',pmy:'Sejarah status politik wilayah, lembaga daerah, otonomi, deng keterwakilan orang Papua.'},
    status:{en:'Structural issue',pmy:'Isu struktural'},updatedAt:'2026-08-20',developmentSlugs:[],
    sourceIds:['un-new-york-agreement','un-unsf-background','otsus-law-2001'],concepts:['self-determination','special-autonomy']
  },
  {
    slug:'women-gender',category:'Women & Gender',
    title:{en:'Women & Gender',pmy:'Perempuan & Gender'},
    summary:{en:'Indigenous women’s leadership, rights, land relationships, care, cultural transmission and gender-based violence.',pmy:'Kepemimpinan perempuan adat, hak, hubungan deng tanah, kerja perawatan, pewarisan budaya, deng kekerasan berbasis gender.'},
    status:{en:'Growing index',pmy:'Indeks terus berkembang'},updatedAt:'2026-08-14',
    developmentSlugs:['south-papua-hria-reports'],sourceIds:['jubi-hria-2026','pusaka-news','mongabay-raja-2026'],concepts:['femicide','customary-land']
  },
  {
    slug:'culture-memory-expression',category:'Culture',
    title:{en:'Culture, memory and expression',pmy:'Budaya, ingatan, deng ekspresi'},
    summary:{en:'Art, literature, film, music and collective practice as living records of Papuan experience and cultural life.',pmy:'Seni, sastra, film, musik, deng kerja kolektif sebagai catatan hidup pengalaman dan budaya Papua.'},
    status:{en:'Programme active',pmy:'Program aktif'},updatedAt:'2026-08-28',
    developmentSlugs:['read-my-world-2026-programme'],sourceIds:['read-my-world-2026','udeido-biennale-jogja','udeido-papoeahuis'],concepts:['collective-memory']
  }
];
export const dossierBySlug=Object.fromEntries(dossiers.map(x=>[x.slug,x]));
