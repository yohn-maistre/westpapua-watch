import type { Issue } from './types';

// Freeze 10.8: public Issues are stable umbrella lenses. Named persistent subjects
// such as Raja Ampat mining and Lake Sentani live in D1 as Dossiers.
export const issues: Issue[] = [
  {
    slug:'land-indigenous-rights',category:'Land & Indigenous rights',
    title:{en:'Land & Indigenous rights',pmy:'Tanah & hak masyarakat adat'},
    summary:{en:'Customary land, tenure, consent, displacement and Indigenous control over territory.',pmy:'Tanah adat, hak atas tanah, persetujuan, penggusuran, deng kendali masyarakat adat atas wilayah.'},
    status:{en:'Persistent issue',pmy:'Isu jangka panjang'},updatedAt:'2026-09-05',developmentSlugs:[],sourceIds:[],concepts:['customary-land']
  },
  {
    slug:'extraction-industrial-development',category:'Extraction & industrial development',
    title:{en:'Extraction & industrial development',pmy:'Ekstraksi & pembangunan industri'},
    summary:{en:'Mining, plantations, logging, large projects, permits and their social and ecological consequences.',pmy:'Tambang, perkebunan, pembalakan, proyek besar, izin, deng dampak sosial-ekologinya.'},
    status:{en:'Persistent issue',pmy:'Isu jangka panjang'},updatedAt:'2026-09-05',developmentSlugs:[],sourceIds:[],concepts:['extractivism']
  },
  {
    slug:'environment-biodiversity',category:'Environment & biodiversity',
    title:{en:'Environment & biodiversity',pmy:'Lingkungan & keanekaragaman hayati'},
    summary:{en:'Forests, watersheds, reefs, species, protected areas and ecological change across Western New Guinea.',pmy:'Hutan, daerah aliran air, terumbu, spesies, kawasan lindung, deng perubahan ekologi di Papua bagian barat.'},
    status:{en:'Persistent issue',pmy:'Isu jangka panjang'},updatedAt:'2026-09-05',developmentSlugs:[],sourceIds:[],concepts:['ecocide']
  },
  {
    slug:'climate-disasters',category:'Climate & disasters',
    title:{en:'Climate & disasters',pmy:'Iklim & bencana'},
    summary:{en:'Fire, drought, floods, rainfall extremes, landslides and climate-related risks.',pmy:'Kebakaran, kekeringan, banjir, hujan ekstrem, longsor, deng risiko terkait iklim.'},
    status:{en:'Persistent issue',pmy:'Isu jangka panjang'},updatedAt:'2026-09-05',developmentSlugs:[],sourceIds:[],concepts:[]
  },
  {
    slug:'human-rights-conflict-security',category:'Human rights, conflict & security',
    title:{en:'Human rights, conflict & security',pmy:'Hak asasi, konflik & keamanan'},
    summary:{en:'Civilian protection, violence, militarization, displacement, detention and access for independent monitoring.',pmy:'Perlindungan warga, kekerasan, militerisasi, pengungsian, penahanan, deng akses pemantauan independen.'},
    status:{en:'Persistent issue',pmy:'Isu jangka panjang'},updatedAt:'2026-09-05',developmentSlugs:[],sourceIds:[],concepts:['internal-displacement','humanitarian-access']
  },
  {
    slug:'politics-governance-representation',category:'Politics, governance & representation',
    title:{en:'Politics, governance & representation',pmy:'Politik, pemerintahan & keterwakilan'},
    summary:{en:'Political status, autonomy, institutions, elections, representation and public decision-making.',pmy:'Status politik, otonomi, lembaga, pemilu, keterwakilan, deng pengambilan keputusan publik.'},
    status:{en:'Persistent issue',pmy:'Isu jangka panjang'},updatedAt:'2026-09-05',developmentSlugs:[],sourceIds:[],concepts:['self-determination','special-autonomy']
  },
  {
    slug:'economy-livelihoods',category:'Economy & livelihoods',
    title:{en:'Economy & livelihoods',pmy:'Ekonomi & mata pencaharian'},
    summary:{en:'Work, markets, fisheries, agriculture, local enterprise, resource revenue and household livelihoods.',pmy:'Kerja, pasar, perikanan, pertanian, usaha lokal, pendapatan sumber daya, deng mata pencaharian rumah tangga.'},
    status:{en:'Persistent issue',pmy:'Isu jangka panjang'},updatedAt:'2026-09-05',developmentSlugs:[],sourceIds:[],concepts:[]
  },
  {
    slug:'health-food-public-services',category:'Health, food & public services',
    title:{en:'Health, food & public services',pmy:'Kesehatan, pangan & layanan publik'},
    summary:{en:'Health care, nutrition, food systems, water, housing and access to essential public services.',pmy:'Layanan kesehatan, gizi, sistem pangan, air, perumahan, deng akses layanan publik penting.'},
    status:{en:'Persistent issue',pmy:'Isu jangka panjang'},updatedAt:'2026-09-05',developmentSlugs:[],sourceIds:[],concepts:[]
  },
  {
    slug:'education-language-culture',category:'Education, language & culture',
    title:{en:'Education, language & culture',pmy:'Pendidikan, bahasa & budaya'},
    summary:{en:'Schools, knowledge, Indigenous languages, cultural transmission, arts, memory and expression.',pmy:'Sekolah, pengetahuan, bahasa adat, pewarisan budaya, seni, ingatan, deng ekspresi.'},
    status:{en:'Persistent issue',pmy:'Isu jangka panjang'},updatedAt:'2026-09-05',developmentSlugs:[],sourceIds:[],concepts:['collective-memory']
  },
  {
    slug:'women-gender-social-inclusion',category:'Women, gender & social inclusion',
    title:{en:'Women, gender & social inclusion',pmy:'Perempuan, gender & inklusi sosial'},
    summary:{en:'Women’s leadership, gender-based violence, care, disability, youth and unequal access to rights and services.',pmy:'Kepemimpinan perempuan, kekerasan berbasis gender, perawatan, disabilitas, pemuda, deng ketimpangan akses hak dan layanan.'},
    status:{en:'Persistent issue',pmy:'Isu jangka panjang'},updatedAt:'2026-09-05',developmentSlugs:[],sourceIds:[],concepts:['femicide']
  },
  {
    slug:'infrastructure-connectivity',category:'Infrastructure & connectivity',
    title:{en:'Infrastructure & connectivity',pmy:'Infrastruktur & konektivitas'},
    summary:{en:'Roads, ports, aviation, communications, energy systems and unequal physical or digital access.',pmy:'Jalan, pelabuhan, penerbangan, komunikasi, sistem energi, deng ketimpangan akses fisik atau digital.'},
    status:{en:'Persistent issue',pmy:'Isu jangka panjang'},updatedAt:'2026-09-05',developmentSlugs:[],sourceIds:[],concepts:[]
  }
];
export const issueBySlug=Object.fromEntries(issues.map(issue=>[issue.slug,issue]));
