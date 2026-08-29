export type Locale = 'en' | 'pmy';
export type Localized = { en: string; pmy: string };
export type SourceRef = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  date?: string;
  type: 'journalism' | 'report' | 'official' | 'research' | 'event' | 'culture';
  language?: 'en' | 'id' | 'multi';
};
export type Development = {
  slug: string;
  issueSlug: string;
  category: string;
  place: string;
  publishedAt: string;
  updatedAt: string;
  title: Localized;
  summary: Localized;
  sourceIds: string[];
  image: string;
  imageAlt: string;
  featured?: boolean;
};
export type Issue = {
  slug: string;
  category: string;
  title: Localized;
  summary: Localized;
  status: Localized;
  updatedAt: string;
  developmentSlugs: string[];
  sourceIds: string[];
  concepts: string[];
};
