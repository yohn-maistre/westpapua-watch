import raw from '../../content/events.json';
export const events=raw.events.filter(event=>!event.hidden).sort((a,b)=>`${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
export const campaignMaterials=raw.campaignMaterials.filter(item=>!item.hidden);
