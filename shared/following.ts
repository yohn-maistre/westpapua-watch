/** Editorial scopes: place alone never assigns reporting to a persistent story. */
export function matchesFollowing(slug:string,text:string):boolean{
 const place=(r:RegExp)=>r.test(text),subject=(r:RegExp)=>r.test(text);
 switch(slug){
 case 'awyu-customary-forests':return place(/awyu|auyu|tanah merah/i)&&subject(/forest|hutan|sawit|palm|permit|izin|adat|customary|land right/i);
 case 'nduga-displacement':return place(/\bnduga\b/i)&&subject(/displac|pengungs|mengungsi|konflik|conflict|operasi militer|military operation/i);
 case 'puncak-displacement':return place(/\bpuncak\b(?!\s+jaya)/i)&&subject(/displac|pengungs|mengungsi/i);
 case 'intan-jaya-displacement':return place(/intan jaya|sugapa/i)&&subject(/displac|pengungs|mengungsi/i);
 case 'freeport-mimika':return subject(/\bfreeport\b|\bgrasberg\b|\bptfi\b/i)||place(/mimika|ajkwa|otomina|kamoro/i)&&subject(/tailing|limbah tambang/i);
 case 'mining-raja-ampat':return place(/raja ampat|gag nikel|waigeo|pulau kawe/i)&&subject(/mining|tambang|nikel|nickel|izin|permit/i);
 case 'south-papua-food-energy-estate':return /\bmifee\b/i.test(text)||place(/merauke|papua selatan|south papua|wanam|boven digoel/i)&&subject(/food.{0,8}estate|cetak sawah|sugarcane|bioethanol|bioetanol|\btebu\b|\bpsn\b|proyek pangan|proyek.*energi|food and energy/i);
 default:return true;
 }
}
export const scopedFollowingSlugs=['awyu-customary-forests','nduga-displacement','puncak-displacement','intan-jaya-displacement','freeport-mimika','mining-raja-ampat','south-papua-food-energy-estate'];
