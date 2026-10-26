import {topicTimelines, type Milestone} from './topic-timelines';
import {archiveItemById, archivePreview} from './archive';
import type {Localized} from './types';

export type EvidenceRecord=Milestone & {image?:string;imageCaption?:Localized;excerpt?:string;locator?:string};
export type InvestigationNode={id:string;label:Localized;kind:Localized;x:number;y:number;recordIds:string[]};
export type InvestigationEdge={id:string;from:string;to:string;label:Localized;recordId:string};
const pair=(en:string,pmy:string):Localized=>({en,pmy});
export const overviewCases=[
 {slug:'south-papua-food-energy-estate',name:pair('Merauke','Merauke'),region:pair('South Papua','Papua Selatan'),title:pair('Land and livelihoods in Merauke.','Tanah dan penghidupan di Merauke.'),summary:pair('Rice and sugarcane projects are advancing on customary land. Community objections concern consent, forest conversion and access to land.','Proyek padi dan tebu berlangsung di tanah adat. Keberatan masyarakat menyangkut persetujuan, pembukaan hutan, serta akses atas tanah.'),longitude:140.4,latitude:-8.49,history:'history-mifee',path:'land',source:'https://pusaka.or.id/en/lini-masa/merauke-national-strategic-project-timeline/',publisher:'Pusaka · 2023–2024'},
 {slug:'freeport-mimika',name:pair('Mimika','Mimika'),region:pair('Mining & rivers','Tambang & sungai'),title:pair('Mining, rivers and life in Mimika.','Tambang, sungai, dan kehidupan di Mimika.'),summary:pair('Freeport links the highlands to the coast through mining, river tailings and the livelihoods of Amungme and Kamoro communities.','Freeport menghubungkan pegunungan dan pesisir melalui pertambangan, tailing sungai, serta penghidupan masyarakat Amungme dan Kamoro.'),longitude:136.89,latitude:-4.55,history:'history-freeport-contract',path:'land',source:'https://www.culturalsurvival.org/publications/cultural-survival-quarterly/amungme-kamoro-freeport-how-indigenous-papuans-have',publisher:'Cultural Survival · 2001'},
 {slug:'nduga-displacement',name:pair('Nduga','Nduga'),region:pair('Displacement & services','Pengungsian & layanan'),title:pair('Displacement and everyday life in Nduga.','Pengungsian dan kehidupan sehari-hari di Nduga.'),summary:pair('Conflict and displacement affect access to gardens, schools and healthcare. Read the background alongside documented changes and questions about returning home.','Konflik dan pengungsian memengaruhi akses ke kebun, sekolah, dan layanan kesehatan. Baca latar belakang bersama perkembangan yang terdokumentasi serta persoalan kepulangan warga.'),longitude:138.35,latitude:-4.15,history:'history-nduga',path:'political',source:'https://www.ohchr.org/en/press-releases/2022/03/indonesia-un-experts-sound-alarm-serious-papua-abuses-call-urgent-aid',publisher:'OHCHR · 2022'},
 {slug:'mining-raja-ampat',name:pair('Raja Ampat','Raja Ampat'),region:pair('Islands & extraction','Pulau & ekstraksi'),title:pair('Mining and customary land in Raja Ampat.','Tambang dan tanah adat di Raja Ampat.'),summary:pair('Mining permits concern particular islands, companies and customary territories. Follow the decisions and their implications for forests, water and coastal livelihoods.','Izin tambang menyangkut pulau, perusahaan, dan wilayah adat tertentu. Telusuri keputusan serta dampaknya bagi hutan, air, dan penghidupan pesisir.'),longitude:130.7,latitude:-.45,history:'history-tidore',path:'social',source:'https://www.greenpeace.org/southeastasia/press/69207/greenpeace-clarifies-findings-on-the-raja-ampats-nickel-report/',publisher:'Greenpeace · 2026'}
];

// Selected short excerpts are from Pusaka's English chronology. They are kept
// distinct from Watch's bilingual summaries and retain their date locators.
const excerpts:Record<string,{excerpt:string;locator:string}>={
 'merauke-2023-11-10-1':{excerpt:'This regulation adds Papua’s Merauke Food and Energy Development Area in South Papua Province as a new NSP.',locator:'10 November 2023'},
 'sugar-task-force':{excerpt:'The Task Force for the Acceleration of Sugar and Bioethanol Self-Sufficiency in Merauke Regency is led by the Minister of Investment/Head of BKPM, Bahlil Lahadalia',locator:'19 April 2024'},
 'merauke-2024-05-7':{excerpt:'PT Global Papua Abadi initiated forest clearing activities in Sermayam, Tanah Miring District.',locator:'May 2024'},
 'merauke-2024-06-07-12':{excerpt:'The Yei Tribe indigenous community made a Statement Letter regarding the rejection of the investment plan in the Yei Tribe Indigenous Territory',locator:'7 June 2024'},
 'merauke-2024-05-30-11':{excerpt:'Control of the opening of one million hectares of land is under the control of the Commander of the XVII/Cenderawasih Military Command.',locator:'30 May 2024'}
};
export const meraukeRecords:EvidenceRecord[]=topicTimelines['south-papua-food-energy-estate'].map(entry=>{
 const id=entry.mediaIds?.[0],item=id&&archiveItemById[id];
 return {...entry,...excerpts[entry.id],...(item?{image:archivePreview(item.id)?.src||item.resolved.image||item.resolved.poster||undefined,imageCaption:item.editorial.caption}:{})};
});
export const investigationNodes:InvestigationNode[]=[
 {id:'economy',label:pair('Economic affairs ministry','Kementerian Perekonomian'),kind:pair('Institution','Lembaga'),x:150,y:105,recordIds:['merauke-2023-11-10-1']},
 {id:'designation',label:pair('Merauke strategic area','Kawasan strategis Merauke'),kind:pair('Decision · 2023','Keputusan · 2023'),x:510,y:105,recordIds:['merauke-2023-11-10-1']},
 {id:'investment',label:pair('Investment minister','Menteri Investasi'),kind:pair('Office · 2024','Jabatan · 2024'),x:150,y:270,recordIds:['sugar-task-force','merauke-2024-05-17-8','sugar-planting']},
 {id:'sugar-task-force',label:pair('Sugar & bioethanol task force','Satgas gula & bioetanol'),kind:pair('Institution · 2024','Lembaga · 2024'),x:510,y:270,recordIds:['sugar-task-force']},
 {id:'gpa',label:pair('PT Global Papua Abadi','PT Global Papua Abadi'),kind:pair('Company','Perusahaan'),x:150,y:435,recordIds:['merauke-2024-05-7','sugar-planting','merauke-2024-06-07-12']},
 {id:'sermayam',label:pair('Sermayam','Sermayam'),kind:pair('Place','Tempat'),x:510,y:435,recordIds:['merauke-2024-05-7','sugar-planting','merauke-2024-06-07-12']},
 {id:'yei',label:pair('Yei customary leaders','Pemimpin adat Yei'),kind:pair('Community representatives','Wakil masyarakat'),x:820,y:435,recordIds:['merauke-2024-06-07-12']},
 {id:'agriculture',label:pair('Agriculture minister','Menteri Pertanian'),kind:pair('Office · 2024','Jabatan · 2024'),x:150,y:600,recordIds:['merauke-2024-05-30-11','sugar-planting']},
 {id:'cenderawasih',label:pair('XVII/Cenderawasih command','Kodam XVII/Cenderawasih'),kind:pair('Military institution','Lembaga militer'),x:510,y:600,recordIds:['merauke-2024-05-30-11']},
 {id:'malind',label:pair('Five Malind plaintiffs','Lima penggugat Malind'),kind:pair('Landholders','Pemegang hak adat'),x:150,y:765,recordIds:['malind-road-lawsuit','road-permit-verdict']},
 {id:'road',label:pair('Merauke road permit','Izin jalan Merauke'),kind:pair('Permit','Izin'),x:510,y:765,recordIds:['wanam-road-permit','malind-road-lawsuit','road-halt-order','road-permit-verdict']},
 {id:'court',label:pair('Jayapura administrative court','PTUN Jayapura'),kind:pair('Court','Pengadilan'),x:820,y:765,recordIds:['road-halt-order','road-permit-verdict']}
];
export const investigationEdges:InvestigationEdge[]=[
 {id:'designates',from:'economy',to:'designation',label:pair('Listed in Regulation 8/2023','Dicantumkan dalam Peraturan 8/2023'),recordId:'merauke-2023-11-10-1'},
 {id:'chairs',from:'investment',to:'sugar-task-force',label:pair('Leads the task force','Memimpin satgas'),recordId:'sugar-task-force'},
 {id:'clearing',from:'gpa',to:'sermayam',label:pair('Clearing recorded · May 2024','Pembukaan dicatat · Mei 2024'),recordId:'merauke-2024-05-7'},
 {id:'investment-visit',from:'investment',to:'gpa',label:pair('Attends planting · Jul 2024','Hadir saat penanaman · Juli 2024'),recordId:'sugar-planting'},
 {id:'agriculture-visit',from:'agriculture',to:'gpa',label:pair('Attends planting · Jul 2024','Hadir saat penanaman · Juli 2024'),recordId:'sugar-planting'},
 {id:'yei-statement',from:'yei',to:'sermayam',label:pair('Written rejection · Jun 2024','Penolakan tertulis · Juni 2024'),recordId:'merauke-2024-06-07-12'},
 {id:'rice-command',from:'agriculture',to:'cenderawasih',label:pair('Assigns rice-field command','Menugaskan komando sawah'),recordId:'merauke-2024-05-30-11'},
 {id:'challenges',from:'malind',to:'road',label:pair('Challenges the permit','Menggugat izin'),recordId:'malind-road-lawsuit'},
 {id:'judgment',from:'court',to:'road',label:pair('Dismisses permit lawsuit','Menolak gugatan izin'),recordId:'road-permit-verdict'}
];
