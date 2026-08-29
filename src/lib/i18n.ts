import type { Locale, Localized } from '../data/types';

export const DEFAULT_LOCALE: Locale = 'en';

export function t(value: Localized | string, locale: Locale): string {
  return typeof value === 'string' ? value : value[locale] ?? value.en;
}

export function withLocale(path: string, locale: Locale): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (locale === 'en') return clean.replace(/^\/pmy(?=\/|$)/, '') || '/';
  if (clean === '/') return '/pmy/';
  return clean.startsWith('/pmy/') ? clean : `/pmy${clean}`;
}

export function alternateLocalePath(path: string, locale: Locale): string {
  return withLocale(path, locale === 'en' ? 'pmy' : 'en');
}

export const labels = {
  en: {
    language: 'Language',
    ask: 'Ask',
    sources: 'sources',
    updated: 'Updated',
    openIssue: 'Open issue',
    latest: 'Latest',
    developments: 'Developments',
    current: 'Now',
    browse: 'Browse',
    readMore: 'Read more',
    glossary: 'Glossary',
    search: 'Search',
  },
  pmy: {
    language: 'Bahasa',
    ask: 'Tanya',
    sources: 'sumber',
    updated: 'Diperbarui',
    openIssue: 'Buka isu',
    latest: 'Terbaru',
    developments: 'Perkembangan',
    current: 'Sekarang',
    browse: 'Lihat',
    readMore: 'Baca lanjut',
    glossary: 'Istilah',
    search: 'Cari',
  },
} as const;
