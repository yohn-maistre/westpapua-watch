import raw from '../../content/events.json';
export const events=raw.events.filter(event=>!event.hidden);
export const campaignMaterials=raw.campaignMaterials.filter(item=>!item.hidden);
