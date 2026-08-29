import type { Development } from './types';

export const developments: Development[] = [
  {
    slug: 'raja-ampat-mining-august-2026',
    issueSlug: 'mining-raja-ampat',
    category: 'Environment',
    place: 'Raja Ampat',
    publishedAt: '2026-08-03',
    updatedAt: '2026-08-25',
    featured: true,
    title: {
      en: 'Mining pressure in Raja Ampat returns to the foreground',
      pmy: 'Tekanan tambang di Raja Ampat muncul lagi di depan'
    },
    summary: {
      en: 'Recent reporting and public statements focus on operating mines, permit pathways and continued ecological concern across Raja Ampat.',
      pmy: 'Laporan baru deng pernyataan publik fokus ke tambang yang masih jalan, jalur izin, deng kekhawatiran lingkungan di Raja Ampat.'
    },
    sourceIds: ['greenpeace-raja-clarification-2026', 'mongabay-raja-2026', 'antara-raja-2026', 'greenpeace-arborek-2026'],
    image: '/images/abstract/raja-ampat.svg',
    imageAlt: 'Abstract blue and warm gradient with contour lines representing Raja Ampat'
  },
  {
    slug: 'lake-sentani-illegal-mining-august-2026',
    issueSlug: 'lake-sentani-watershed',
    category: 'Environment',
    place: 'Lake Sentani',
    publishedAt: '2026-08-27',
    updatedAt: '2026-08-27',
    title: {
      en: 'Reporting links illegal gold mining upstream to pressure on Lake Sentani',
      pmy: 'Laporan kaitkan tambang emas ilegal di hulu deng tekanan ke Danau Sentani'
    },
    summary: {
      en: 'Jubi and Mongabay report sedimentation, water-quality concerns and impacts on fishing communities around Lake Sentani linked to upstream mining activity.',
      pmy: 'Jubi deng Mongabay lapor sedimentasi, masalah kualitas air, deng dampak ke masyarakat nelayan sekitar Danau Sentani yang dikaitkan dengan tambang di hulu.'
    },
    sourceIds: ['jubi-sentani-mining-2026', 'mongabay-sentani-mining-2026'],
    image: '/images/abstract/highlands.svg',
    imageAlt: 'Abstract cool landscape field representing Lake Sentani and the Cycloop foothills'
  },
  {
    slug: 'south-papua-hria-reports',
    issueSlug: 'south-papua-food-energy-estate',
    category: 'Land',
    place: 'South Papua',
    publishedAt: '2026-08-14',
    updatedAt: '2026-08-14',
    title: {
      en: 'New impact reports focus attention on land and strategic projects in South Papua',
      pmy: 'Laporan dampak baru soroti tanah deng proyek strategis di Papua Selatan'
    },
    summary: {
      en: 'Two Human Rights Impact Assessment reports were launched in Jayapura on the effects of national strategic projects in South Papua.',
      pmy: 'Dua laporan Human Rights Impact Assessment diluncurkan di Jayapura soal dampak proyek strategis nasional di Papua Selatan.'
    },
    sourceIds: ['jubi-hria-2026', 'pusaka-news', 'hrw-land-2026'],
    image: '/images/abstract/merauke.svg',
    imageAlt: 'Abstract warm green landscape field representing South Papua'
  },
  {
    slug: 'papua-monitor-q2-2026',
    issueSlug: 'conflict-displacement-access',
    category: 'Human rights',
    place: 'Central Highlands',
    publishedAt: '2026-07-01',
    updatedAt: '2026-08-10',
    title: {
      en: 'Monitoring reports keep displacement and civilian access in focus',
      pmy: 'Laporan pemantauan terus soroti pengungsian deng akses warga sipil'
    },
    summary: {
      en: 'Recent monitoring brings together reporting on conflict, displacement, humanitarian access and wider policy changes affecting Papuan communities.',
      pmy: 'Pemantauan terbaru kumpulkan laporan soal konflik, pengungsian, akses kemanusiaan, deng perubahan kebijakan yang berdampak ke komunitas Papua.'
    },
    sourceIds: ['hrm-q2-2026', 'hrm-home-2026', 'jubi-news'],
    image: '/images/abstract/highlands.svg',
    imageAlt: 'Abstract cool mountain field representing the Central Highlands'
  },
  {
    slug: 'read-my-world-2026-programme',
    issueSlug: 'culture-memory-expression',
    category: 'Culture',
    place: 'Amsterdam',
    publishedAt: '2026-08-28',
    updatedAt: '2026-08-28',
    title: {
      en: 'Read My World prepares its 2026 Oceanic Solidarity programme',
      pmy: 'Read My World siap untuk program Oceanic Solidarity 2026'
    },
    summary: {
      en: 'The 10–12 September festival in Amsterdam includes special guests from West Papua and Maluku, with literature, art, music and public discussion.',
      pmy: 'Festival 10–12 September di Amsterdam bawa tamu dari Papua Barat deng Maluku, dengan sastra, seni, musik, deng diskusi publik.'
    },
    sourceIds: ['read-my-world-2026', 'read-my-world-saturday'],
    image: '/images/abstract/oceanic.svg',
    imageAlt: 'Abstract oceanic blue and violet field'
  }
];

export const developmentBySlug = Object.fromEntries(developments.map((item) => [item.slug, item]));
