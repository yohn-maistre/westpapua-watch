export const glossary = [
  {
    slug: 'extractivism',
    term: 'Extractivism',
    definition: {
      en: 'A way of organizing economic activity around intensive extraction of minerals, forests, land or other resources, often for external markets and with uneven local costs.',
      pmy: 'Cara atur ekonomi yang fokus ambil mineral, hutan, tanah, atau sumber daya dalam skala besar, sering untuk pasar di luar dan dengan dampak lokal yang tidak seimbang.'
    }
  },
  {
    slug: 'ecocide',
    term: 'Ecocide',
    definition: {
      en: 'A term used for severe or widespread destruction of ecosystems. Its legal meaning varies by jurisdiction and proposal.',
      pmy: 'Istilah untuk kerusakan ekosistem yang berat atau luas. Arti hukumnya bisa beda menurut negara atau usulan hukum.'
    }
  },
  {
    slug: 'femicide',
    term: 'Femicide',
    definition: {
      en: 'The gender-related killing of women or girls, often discussed alongside wider patterns of gender-based violence and inequality.',
      pmy: 'Pembunuhan perempuan atau anak perempuan yang terkait dengan gender, sering dibahas bersama pola kekerasan berbasis gender dan ketimpangan.'
    }
  },
  {
    slug: 'gastrocolonialism',
    term: 'Gastrocolonialism',
    definition: {
      en: 'A framework for examining how colonial power can reshape food systems, taste, agriculture, labor, land use and whose food knowledge is valued.',
      pmy: 'Kerangka untuk lihat bagaimana kuasa kolonial bisa ubah sistem pangan, rasa, pertanian, kerja, penggunaan tanah, deng pengetahuan pangan siapa yang dianggap penting.'
    }
  },
  {
    slug: 'customary-land',
    term: 'Customary land',
    definition: {
      en: 'Land held, used or governed through Indigenous or customary systems, whose rules and relationships may differ from state land-title systems.',
      pmy: 'Tanah yang dipakai, dijaga, atau diatur lewat sistem adat, dengan aturan dan hubungan yang bisa beda dari sistem sertifikat tanah negara.'
    }
  },
  {
    slug: 'special-autonomy',
    term: 'Special autonomy',
    definition: {
      en: 'A governance framework created by Indonesian law for Papua, including special institutions and arrangements beyond ordinary provincial administration.',
      pmy: 'Kerangka pemerintahan yang dibuat lewat hukum Indonesia untuk Papua, termasuk lembaga dan pengaturan khusus di luar administrasi provinsi biasa.'
    }
  }
] as const;

export const glossaryBySlug = Object.fromEntries(glossary.map((item) => [item.slug, item]));
