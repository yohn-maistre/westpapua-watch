export const featuredFollowingSlugs=['south-papua-food-energy-estate','nduga-displacement','mining-raja-ampat','freeport-mimika'] as const;
export const secondaryFollowingSlugs=['awyu-customary-forests','puncak-displacement','intan-jaya-displacement'] as const;
export const curatedFollowingSlugs=[...featuredFollowingSlugs,...secondaryFollowingSlugs] as const;
export const followingTickerSlugs=['south-papua-food-energy-estate','awyu-customary-forests','nduga-displacement','mining-raja-ampat','freeport-mimika'] as const;

/** Editorial scopes: place alone never assigns reporting to a persistent story. */
export function matchesFollowing(slug:string,text:string):boolean{
 const haystack=String(text||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,' ');
 const place=(r:RegExp)=>r.test(haystack),subject=(r:RegExp)=>r.test(haystack);
 const psn=/\bpsn\b|proyek strategis nasional|national strategic project/i;
 switch(slug){
 case 'awyu-customary-forests':
  return place(/\bawyu\b|\bauyu\b|suku awyu/i)&&subject(/forest|hutan|sawit|palm|permit|izin|adat|customary|ulayat|land right|hak tanah|tanah adat|reject|tolak|penolak/i)
    ||place(/\bawyu\b|\bauyu\b|suku awyu/i)&&psn.test(haystack);
 case 'nduga-displacement':return place(/\bnduga\b/i)&&subject(/displac|pengungs|mengungsi|konflik|conflict|operasi militer|military operation|evacuat|evakuasi|humanitarian|kemanusiaan/i);
 case 'puncak-displacement':return place(/\bpuncak\b(?!\s+jaya)/i)&&subject(/displac|pengungs|mengungsi/i);
 case 'intan-jaya-displacement':return place(/intan jaya|sugapa/i)&&subject(/displac|pengungs|mengungsi/i);
 case 'freeport-mimika':return subject(/\bfreeport\b|\bgrasberg\b|\bptfi\b/i)||place(/mimika|ajkwa|otomina|kamoro/i)&&subject(/tailing|limbah tambang/i);
 case 'mining-raja-ampat':return place(/raja ampat|gag nikel|waigeo|pulau kawe/i)&&subject(/mining|tambang|nikel|nickel|izin|permit/i);
 case 'south-papua-food-energy-estate':{
  const geography=/merauke|papua selatan|south papua|wanam|muting|boven digoel|malind|marind/i;
  const programme=/food.{0,8}estate|cetak sawah|sugarcane|bioethanol|bioetanol|\btebu\b|proyek pangan|proyek.*energi|food and energy|wanam.{0,25}muting|muting.{0,25}wanam|135\s*(?:km|kilomet)/i;
  return /\bmifee\b/i.test(haystack)||geography.test(haystack)&&(programme.test(haystack)||psn.test(haystack));
 }
 default:return true;
 }
}
export const scopedFollowingSlugs=['awyu-customary-forests','nduga-displacement','puncak-displacement','intan-jaya-displacement','freeport-mimika','mining-raja-ampat','south-papua-food-energy-estate'];
