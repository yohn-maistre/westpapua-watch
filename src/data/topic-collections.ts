// Following is editorial placement, Topics are the broad categories.
// The slug registry is shared with the Worker so editorial scope has one authority.
import {featuredFollowingSlugs,secondaryFollowingSlugs as sharedSecondaryFollowingSlugs,curatedFollowingSlugs,followingTickerSlugs as sharedFollowingTickerSlugs} from '../../shared/following';
export const featuredTopicSlugs=[...featuredFollowingSlugs];
export const secondaryFollowingSlugs=[...sharedSecondaryFollowingSlugs];
export const followingSlugs=[...curatedFollowingSlugs];
export const followingTickerSlugs=[...sharedFollowingTickerSlugs];

export type FollowingVisual={a:string;b:string;glow:string};
export const followingVisualBySlug:Record<string,FollowingVisual>={
  'south-papua-food-energy-estate':{a:'#263c32',b:'#788b58',glow:'#a8bd72'},
  'nduga-displacement':{a:'#383146',b:'#8c788a',glow:'#c2a6bd'},
  'mining-raja-ampat':{a:'#243c48',b:'#497d84',glow:'#70b5bd'},
  'freeport-mimika':{a:'#493930',b:'#a68065',glow:'#d0a07f'},
  'awyu-customary-forests':{a:'#21382f',b:'#557858',glow:'#86aa79'},
  'papuan-civic-space':{a:'#30334e',b:'#697a9e',glow:'#bea9d6'},
  'puncak-displacement':{a:'#303246',b:'#665c7a',glow:'#a99bbc'},
  'intan-jaya-displacement':{a:'#342f3d',b:'#7a596c',glow:'#bd839d'}
};

export function followingStyle(slug:string){
  const v=followingVisualBySlug[slug]||{a:'#303440',b:'#53596a',glow:'#8a91a6'};
  return `--following-a:${v.a};--following-b:${v.b};--following-glow:${v.glow}`;
}
