import raw from '../../content/taxonomy.json';
export const taxonomy=raw;
export const topicTags=raw.tags;
export const topicTagBySlug=Object.fromEntries(raw.tags.map(tag=>[tag.slug,tag]));
export const issueStates=raw.issueStates;
