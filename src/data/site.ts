import type { Localized } from './types';

export const SITE = {
  name: 'West Papua Watch',
  url: 'https://westpapua.watch',
  description: {
    en: 'Current developments, long-running issues, history, events, exhibitions and sources on West Papua.',
    pmy: 'Perkembangan terbaru, isu yang jalan lama, sejarah, acara, pameran, deng sumber soal Papua Barat.'
  } satisfies Localized
};

export const NAV_ITEMS = [
  { href: '/', key: 'now', label: { en: 'Now', pmy: 'Sekarang' } },
  { href: '/issues/', key: 'issues', label: { en: 'Issues', pmy: 'Isu' } },
  { href: '/history/', key: 'history', label: { en: 'History', pmy: 'Sejarah' } },
  { href: '/resources/', key: 'resources', label: { en: 'Resources', pmy: 'Sumber' } },
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
