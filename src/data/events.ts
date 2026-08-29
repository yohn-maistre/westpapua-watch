export const events = [
  {
    date: '2026-09-10',
    time: '19:30',
    title: 'Opening Night 2026',
    place: 'Tolhuistuin · Amsterdam',
    summary: 'The opening night of Read My World with dance, music and readings.',
    sourceId: 'read-my-world-2026'
  },
  {
    date: '2026-09-12',
    time: '21:00',
    title: 'Singing to Survive',
    place: 'Tolhuistuin · Amsterdam',
    summary: 'A programme on the role of Mambesak’s music in the resistance movement of West Papua.',
    sourceId: 'read-my-world-saturday'
  },
  {
    date: '2026-09-12',
    time: '22:00',
    title: 'Sounds of the island',
    place: 'Tolhuistuin · Amsterdam',
    summary: 'Poetry, rhythm and song across island worlds, including West Papua.',
    sourceId: 'read-my-world-saturday'
  },
  {
    date: '2026-09-12',
    time: '21:30',
    title: 'I Am a Papuan',
    place: 'Tolhuistuin · Amsterdam',
    summary: 'Theatrical storytelling with a post-show discussion.',
    sourceId: 'read-my-world-saturday'
  }
] as const;

export const campaignMaterials = [
  { label: 'Programme', value: 'Read My World 2026', href: 'https://readmyworld.nl/' },
  { label: 'Campaign', value: 'SOS Papua', href: '#' },
  { label: 'Resources', value: 'Reports and source library', href: '/resources/' },
  { label: 'Exhibition', value: 'Artists, collectives and works', href: '/exhibition/view/' }
] as const;
