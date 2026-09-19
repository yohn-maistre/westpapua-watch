import type { Localized } from './types';

export const SITE = {
  name: 'West Papua Watch',
  url: 'https://westpapua.watch',
  description: {
    en: 'Geography, ongoing issues, current developments, history, events, exhibitions and sources on West Papua.',
    pmy: 'Geografi, isu yang masih jalan, perkembangan sekarang, sejarah, acara, pameran, deng sumber soal Papua Barat.'
  } satisfies Localized
};

export const NAV_ITEMS = [
  { href: '/', key: 'home', label: { en: 'Home', pmy: 'Beranda' } },
  { href: '/news/', key: 'current', label: { en: 'News', pmy: 'Berita' } },
  { href: '/topics/', key: 'issues', label: { en: 'Issues', pmy: 'Isu' } },
  { href: '/history/', key: 'history', label: { en: 'History', pmy: 'Sejarah' } },
  { href: '/resources/', key: 'resources', label: { en: 'Resources', pmy: 'Sumber' } },
  { href: '/data/', key: 'data', label: { en: 'Data', pmy: 'Data' } },
  { href: '/events/', key: 'events', label: { en: 'Events', pmy: 'Acara' } },
  { href: '/exhibition/view/', key: 'exhibition', label: { en: 'Exhibition', pmy: 'Pameran' } }
] as const;

export const PROGRAMME = {
  label: 'Read My World',
  place: 'Amsterdam',
  start: '2026-09-10T19:00:00+02:00',
  end: '2026-09-12T23:59:59+02:00',
  title: {
    en: 'West Papua and Maluku at Oceanic Solidarity',
    pmy: 'Papua Barat deng Maluku di Oceanic Solidarity'
  },
  href: '/events/'
};

// The masthead carries the most consequential current public development.
// Keep the event card above independent so it remains an archive of the programme.
export const BANNER = {
  kicker: {
    en: 'Merauke · PSN road case',
    pmy: 'Merauke · perkara jalan PSN'
  },
  title: {
    en: 'Court rejects Malind lawsuit over the 135 km PSN road',
    pmy: 'PTUN tolak gugatan Malind soal jalan PSN 135 km'
  },
  href: '/topics/south-papua-food-energy-estate/'
} satisfies {kicker: Localized; title: Localized; href: string};
