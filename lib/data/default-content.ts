import type {
  AcademicYear,
  AdmissionPeriod,
  EducationUnit,
  FoundationSettings,
  GalleryAlbum,
  NewsArticle,
  NewsCategory,
  SchoolEvent,
  Teacher,
  UnitFacility,
  UnitProgram,
} from '@/types/database';

const NOW_ISO = '2026-11-25T08:00:00.000Z';

export const DEFAULT_FOUNDATION_SETTINGS: FoundationSettings = {
  id: '00000000-0000-0000-0000-000000000001',
  foundation_name: 'Yayasan Muhammad Tahir Garut',
  tagline: 'Berilmu, Berakhlak, Berprestasi',
  short_description:
    'Yayasan Muhammad Tahir Garut hadir sebagai lembaga pendidikan Islam yang berkomitmen mencetak generasi berilmu, berakhlak mulia, dan berprestasi di Kabupaten Garut.',
  history:
    'Informasi sejarah resmi Yayasan Muhammad Tahir Garut disiapkan sebagai placeholder dan dapat diperbarui kapan saja melalui Dashboard Admin oleh pengurus yayasan.',
  vision:
    'Mewujudkan lembaga pendidikan Islam yang unggul dalam ilmu pengetahuan, kokoh dalam iman dan takwa, serta berakhlak mulia untuk masa depan bangsa.',
  mission: [
    'Menyelenggarakan pendidikan Islam terpadu yang berkualitas dari jenjang RA, MI, hingga SMP.',
    "Membentuk karakter peserta didik yang berakhlakul karimah dan cinta Al-Qur'an.",
    'Mengembangkan potensi akademik, literasi, sains, dan keterampilan abad ke-21.',
    'Membangun sinergi harmonis antara pendidik, orang tua, dan masyarakat.',
  ],
  address: 'Karangpawitan, Kab. Garut, Jawa Barat (Alamat lengkap dapat diubah di Admin)',
  phone: '(0262) 000000 (Placeholder)',
  whatsapp: '6281200000000',
  email: 'info@yayasanmuhammadtahirgarut.sch.id',
  website_url: '',
  logo_url: '/logos/logo-yayasan.png',
  hero_badge: 'Pendidikan Islam Terpadu',
  hero_title: 'Mencetak Generasi Unggul untuk Masa Depan',
  hero_subtitle:
    'Dengan pendidikan yang berkualitas, berlandaskan nilai-nilai Islam, kami hadir untuk membentuk generasi berilmu, berakhlak mulia, dan berprestasi.',
  hero_image_url: '/images/hero-students.jpg',
  about_image_url: '/images/campus-building.jpg',
  about_video_url: '',
  ppdb_banner_title: 'Pendaftaran Peserta Didik Baru Telah Dibuka!',
  ppdb_banner_subtitle: 'Daftarkan putra-putri Anda sekarang melalui sistem PPDB online kami.',
  footer_quote: 'Pendidikan adalah cahaya menuju masa depan',
  social_youtube: 'https://youtube.com',
  social_instagram: 'https://instagram.com',
  social_facebook: 'https://facebook.com',
  social_tiktok: 'https://tiktok.com',
  maps_embed_url: '',
  is_placeholder_data: true,
  created_at: NOW_ISO,
  updated_at: NOW_ISO,
};

export const DEFAULT_EDUCATION_UNITS: EducationUnit[] = [
  {
    id: '00000000-0000-0000-0000-000000000101',
    slug: 'ra',
    unit_code: 'RA',
    name: 'R.A. Muhammad Tahir',
    level_label: 'Pendidikan Anak Usia Dini',
    short_description:
      'Pendidikan Islam anak usia dini yang ceria, ramah anak, dan menanamkan adab sejak dini.',
    full_profile:
      "R.A. Muhammad Tahir (Raudhatul Athfal) di bawah naungan Yayasan Muhammad Tahir Garut menyelenggarakan pendidikan anak usia dini berbasis nilai-nilai keislaman, bermain sambil belajar, serta pengenalan Al-Qur'an sejak dini.",
    history: 'Profil sejarah unit R.A. dapat diperbarui oleh Admin Unit R.A. melalui Dashboard Admin.',
    vision:
      'Membentuk anak usia dini yang ceria, sehat, mandiri, mencintai Allah dan Rasul-Nya, serta siap memasuki jenjang pendidikan dasar.',
    mission: [
      'Menanamkan pembiasaan ibadah dan adab Islami sehari-hari.',
      'Mengembangkan motorik, kognitif, bahasa, dan kreativitas anak melalui metode bermain bermakna.',
      'Menciptakan lingkungan belajar yang aman, nyaman, dan penuh kasih sayang.',
    ],
    achievements: [
      'Lingkungan belajar ramah anak dengan sentra bermain edukatif.',
      'Program pembiasaan doa harian dan hafalan surat pendek.',
    ],
    ppdb_info:
      'Menerima peserta didik baru usia 4–6 tahun (Kelompok A dan Kelompok B). Persyaratan dokumen dapat disesuaikan oleh Admin Unit R.A.',
    required_documents: [
      { key: 'kk', label: 'Kartu Keluarga (KK)', required: true, description: 'Scan/foto Kartu Keluarga yang masih berlaku' },
      { key: 'akta', label: 'Akta Kelahiran', required: true, description: 'Scan/foto Akta Kelahiran calon peserta didik' },
      { key: 'pas_foto', label: 'Pas Foto 3x4', required: true, description: 'Pas foto berwarna terbaru' },
    ],
    logo_url: '/logos/logo-ra.png',
    is_logo_placeholder: false,
    banner_image_url: '/images/campus-building.jpg',
    accent_color: '#D4A742',
    headmaster_name: 'Kepala R.A. (Dapat diubah Admin)',
    contact_phone: '(0262) 000000',
    contact_email: 'ra@yayasanmuhammadtahirgarut.sch.id',
    address: 'Kompleks Pendidikan Yayasan Muhammad Tahir Garut',
    display_order: 1,
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO,
  },
  {
    id: '00000000-0000-0000-0000-000000000102',
    slug: 'mi',
    unit_code: 'MI',
    name: 'MI Muhammad Tahir',
    level_label: 'Pendidikan Tingkat Dasar',
    short_description:
      "Madrasah Ibtidaiyah yang memadukan kurikulum nasional, literasi sains, dan tahfidz Al-Qur'an.",
    full_profile:
      'MI Muhammad Tahir merupakan jenjang pendidikan dasar setingkat Sekolah Dasar yang mengintegrasikan kurikulum pendidikan nasional, Kementerian Agama, penguatan tahfidz, serta pembentukan akhlak mulia.',
    history: 'Profil sejarah unit MI dapat diperbarui oleh Admin Unit MI melalui Dashboard Admin.',
    vision:
      'Menjadi Madrasah Ibtidaiyah unggul yang melahirkan generasi cerdas intelektual, kuat spiritual, dan berkarakter Islami.',
    mission: [
      'Menyelenggarakan pembelajaran aktif dan menyenangkan berbasis literasi dan numerasi.',
      "Membina hafalan Al-Qur'an dan pembiasaan shalat berjamaah.",
      'Mengembangkan minat dan bakat siswa melalui kegiatan ekstrakurikuler terpadu.',
    ],
    achievements: [
      "Pembinaan program tahfidz Al-Qur'an terstruktur.",
      'Integrasi pembelajaran berbasis karakter dan teknologi.',
    ],
    ppdb_info:
      'Menerima peserta didik baru lulusan TK/RA atau sederajat usia minimal 6 tahun. Logo resmi MI sementara menggunakan placeholder hingga file logo asli diunggah via Admin.',
    required_documents: [
      { key: 'kk', label: 'Kartu Keluarga (KK)', required: true, description: 'Scan/foto Kartu Keluarga yang masih berlaku' },
      { key: 'akta', label: 'Akta Kelahiran', required: true, description: 'Scan/foto Akta Kelahiran calon peserta didik' },
      { key: 'pas_foto', label: 'Pas Foto 3x4', required: true, description: 'Pas foto berwarna terbaru' },
      { key: 'ijazah_tk', label: 'Surat Keterangan / Ijazah RA/TK', required: false, description: 'Opsional jika sudah tersedia' },
    ],
    logo_url: '/logos/logo-mi-placeholder.svg',
    is_logo_placeholder: true,
    banner_image_url: '/images/campus-building.jpg',
    accent_color: '#102F55',
    headmaster_name: 'Kepala MI (Dapat diubah Admin)',
    contact_phone: '(0262) 000000',
    contact_email: 'mi@yayasanmuhammadtahirgarut.sch.id',
    address: 'Kompleks Pendidikan Yayasan Muhammad Tahir Garut',
    display_order: 2,
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO,
  },
  {
    id: '00000000-0000-0000-0000-000000000103',
    slug: 'smp',
    unit_code: 'SMP',
    name: 'SMP Muhammad Tahir',
    level_label: 'Pendidikan Tingkat Menengah Pertama',
    short_description:
      'Sekolah Menengah Pertama berbasis karakter Islami, kepemimpinan, dan prestasi akademik.',
    full_profile:
      'SMP Muhammad Tahir membekali remaja dengan fondasi akidah yang kokoh, penguasaan sains dan teknologi, kemampuan berbahasa, serta jiwa kepemimpinan untuk siap melanjutkan ke jenjang terbaik.',
    history: 'Profil sejarah unit SMP dapat diperbarui oleh Admin Unit SMP melalui Dashboard Admin.',
    vision:
      'Mewujudkan lulusan SMP yang berakhlak mulia, berprestasi akademik dan non-akademik, serta siap menghadapi tantangan zaman.',
    mission: [
      'Menerapkan pembelajaran kolaboratif berbasis proyek dan penguatan karakter Islami.',
      'Membekali siswa dengan kecakapan digital, literasi, dan kepemimpinan organisasi.',
      'Mendorong prestasi kompetisi akademik, keagamaan, dan olahraga.',
    ],
    achievements: [
      'Pembinaan OSIS dan organisasi kepemimpinan pelajar.',
      'Program penguatan akademik dan pembinaan keagamaan intensif.',
    ],
    ppdb_info:
      'Menerima peserta didik baru lulusan SD/MI sederajat. Persyaratan dan kuota gelombang dapat diatur oleh Admin Unit SMP.',
    required_documents: [
      { key: 'kk', label: 'Kartu Keluarga (KK)', required: true, description: 'Scan/foto Kartu Keluarga yang masih berlaku' },
      { key: 'akta', label: 'Akta Kelahiran', required: true, description: 'Scan/foto Akta Kelahiran calon peserta didik' },
      { key: 'pas_foto', label: 'Pas Foto 3x4', required: true, description: 'Pas foto berwarna terbaru' },
      { key: 'skl_sd', label: 'SKL / Rapor Terakhir SD/MI', required: true, description: 'Surat Keterangan Lulus atau fotokopi rapor semester terakhir' },
    ],
    logo_url: '/logos/logo-smp.png',
    is_logo_placeholder: false,
    banner_image_url: '/images/campus-building.jpg',
    accent_color: '#0F5C43',
    headmaster_name: 'Kepala SMP (Dapat diubah Admin)',
    contact_phone: '(0262) 000000',
    contact_email: 'smp@yayasanmuhammadtahirgarut.sch.id',
    address: 'Kompleks Pendidikan Yayasan Muhammad Tahir Garut',
    display_order: 3,
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO,
  },
];

export const DEFAULT_UNIT_PROGRAMS: UnitProgram[] = [
  {
    id: 'prog-ra-1',
    unit_id: '00000000-0000-0000-0000-000000000101',
    title: 'Pembiasaan Akhlak & Doa Harian',
    description: 'Pembentukan karakter Islami sejak usia dini melalui keteladanan dan pembiasaan sehari-hari.',
    icon_name: 'Heart',
    display_order: 1,
    is_active: true,
  },
  {
    id: 'prog-ra-2',
    unit_id: '00000000-0000-0000-0000-000000000101',
    title: 'Sentra Bermain Edukatif',
    description: 'Metode belajar sambil bermain yang menstimulasi motorik, bahasa, dan kreativitas anak.',
    icon_name: 'Sparkles',
    display_order: 2,
    is_active: true,
  },
  {
    id: 'prog-mi-1',
    unit_id: '00000000-0000-0000-0000-000000000102',
    title: "Tahfidz & Tilawah Al-Qur'an",
    description: "Program hafalan Al-Qur'an bertahap dengan bimbingan guru tahfidz berpengalaman.",
    icon_name: 'BookOpen',
    display_order: 1,
    is_active: true,
  },
  {
    id: 'prog-mi-2',
    unit_id: '00000000-0000-0000-0000-000000000102',
    title: 'Literasi Sains & Numerasi',
    description: 'Penguatan konsep dasar matematika, IPA, dan literasi membaca secara aplikatif.',
    icon_name: 'Compass',
    display_order: 2,
    is_active: true,
  },
  {
    id: 'prog-smp-1',
    unit_id: '00000000-0000-0000-0000-000000000103',
    title: 'Kepemimpinan & Karakter Islami',
    description: 'Pembinaan kedisiplinan, akhlak mulia, dan keterampilan kepemimpinan pelajar.',
    icon_name: 'Award',
    display_order: 1,
    is_active: true,
  },
  {
    id: 'prog-smp-2',
    unit_id: '00000000-0000-0000-0000-000000000103',
    title: 'Keterampilan Digital & Bahasa',
    description: 'Penguasaan literasi teknologi informasi serta pembiasaan bahasa Arab dan Inggris.',
    icon_name: 'Laptop',
    display_order: 2,
    is_active: true,
  },
];

export const DEFAULT_UNIT_FACILITIES: UnitFacility[] = [
  {
    id: 'fac-1',
    unit_id: '00000000-0000-0000-0000-000000000101',
    name: 'Ruang Sentra Bermain & Belajar',
    description: 'Ruang kelas ramah anak dengan alat permainan edukatif yang aman dan bersih.',
    image_url: '/images/campus-building.jpg',
    display_order: 1,
    is_active: true,
  },
  {
    id: 'fac-2',
    unit_id: '00000000-0000-0000-0000-000000000102',
    name: 'Ruang Kelas & Perpustakaan Madrasah',
    description: 'Lingkungan kelas kondusif dilengkapi sudut literasi dan mushola pembinaan ibadah.',
    image_url: '/images/campus-building.jpg',
    display_order: 1,
    is_active: true,
  },
  {
    id: 'fac-3',
    unit_id: '00000000-0000-0000-0000-000000000103',
    name: 'Laboratorium Komputer & Sarana Ibadah',
    description: 'Fasilitas penunjang pembelajaran digital, sains, serta pembinaan keagamaan.',
    image_url: '/images/campus-building.jpg',
    display_order: 1,
    is_active: true,
  },
];

export const DEFAULT_TEACHERS: Teacher[] = [
  {
    id: 'tch-ra-1',
    unit_id: '00000000-0000-0000-0000-000000000101',
    full_name: 'Pengajar R.A. (Contoh - Ubah di Admin)',
    position: 'Kepala Unit R.A.',
    subject_or_specialty: 'Pendidikan Anak Usia Dini',
    education_background: 'S1 PG-PAUD',
    display_order: 1,
    is_active: true,
  },
  {
    id: 'tch-mi-1',
    unit_id: '00000000-0000-0000-0000-000000000102',
    full_name: 'Pengajar MI (Contoh - Ubah di Admin)',
    position: 'Kepala Madrasah Ibtidaiyah',
    subject_or_specialty: 'PGMI & Tahfidz',
    education_background: 'S1 Pendidikan Islam',
    display_order: 1,
    is_active: true,
  },
  {
    id: 'tch-smp-1',
    unit_id: '00000000-0000-0000-0000-000000000103',
    full_name: 'Pengajar SMP (Contoh - Ubah di Admin)',
    position: 'Kepala SMP',
    subject_or_specialty: 'Manajemen Pendidikan',
    education_background: 'S1 Pendidikan',
    display_order: 1,
    is_active: true,
  },
];

export const DEFAULT_NEWS_CATEGORIES: NewsCategory[] = [
  { id: 'cat-1', slug: 'kegiatan-yayasan', name: 'Kegiatan Yayasan' },
  { id: 'cat-2', slug: 'pengumuman', name: 'Pengumuman' },
  { id: 'cat-3', slug: 'prestasi', name: 'Prestasi & Kesiswaan' },
];

export const DEFAULT_NEWS: NewsArticle[] = [
  {
    id: 'news-1',
    slug: 'pembukaan-ppdb-online-yayasan-muhammad-tahir-garut-2027-2028',
    title: 'Pembukaan PPDB Online Yayasan Muhammad Tahir Garut Tahun Ajaran 2027/2028',
    excerpt:
      'Pendaftaran Peserta Didik Baru (PPDB) untuk jenjang R.A., MI, dan SMP kini dapat dilakukan secara online melalui satu sistem terpadu.',
    content:
      'Yayasan Muhammad Tahir Garut resmi membuka Penerimaan Peserta Didik Baru (PPDB) Tahun Ajaran 2027/2028 untuk unit R.A., MI, dan SMP. Orang tua/wali dapat memilih jenjang pendidikan, mengisi formulir secara bertahap, mengunggah dokumen persyaratan, serta memantau status verifikasi pendaftaran secara daring melalui halaman Cek Pendaftaran.',
    thumbnail_url: '/images/campus-building.jpg',
    category_id: 'cat-2',
    unit_id: null,
    status: 'published',
    is_featured: true,
    published_at: '2026-11-23T08:00:00.000Z',
    created_at: NOW_ISO,
    updated_at: NOW_ISO,
    category: { id: 'cat-2', slug: 'pengumuman', name: 'Pengumuman' },
    unit: null,
  },
  {
    id: 'news-2',
    slug: 'semarak-hari-guru-nasional-di-lingkungan-yayasan',
    title: 'Semarak Hari Guru Nasional di Lingkungan Yayasan Muhammad Tahir Garut',
    excerpt:
      'Seluruh unit pendidikan melaksanakan kegiatan apresiasi dan doa bersama sebagai wujud penghormatan kepada para pendidik.',
    content:
      'Dalam rangka memperingati Hari Guru Nasional, keluarga besar Yayasan Muhammad Tahir Garut menyelenggarakan kegiatan kebersamaan yang melibatkan seluruh pendidik dan peserta didik dari unit R.A., MI, hingga SMP. Artikel ini merupakan contoh konten CMS yang dapat disunting melalui Dashboard Admin.',
    thumbnail_url: '/images/hero-students.jpg',
    category_id: 'cat-1',
    unit_id: null,
    status: 'published',
    is_featured: false,
    published_at: '2026-11-20T08:00:00.000Z',
    created_at: NOW_ISO,
    updated_at: NOW_ISO,
    category: { id: 'cat-1', slug: 'kegiatan-yayasan', name: 'Kegiatan Yayasan' },
    unit: null,
  },
  {
    id: 'news-3',
    slug: 'sinergi-program-pembinaan-karakter-islami-antar-unit',
    title: 'Sinergi Program Pembinaan Karakter Islami di Seluruh Unit Pendidikan',
    excerpt:
      'Koordinasi kurikulum pembiasaan ibadah dan adab Islami yang berkelanjutan dari jenjang R.A., MI, hingga SMP.',
    content:
      'Pengurus Yayasan bersama kepala unit R.A., MI, dan SMP menyusun kesinambungan program pembinaan karakter Islami agar peserta didik memiliki landasan akhlak yang kuat di setiap tahapan pendidikan. Artikel ini dapat diperbarui melalui Dashboard Admin.',
    thumbnail_url: '/images/campus-building.jpg',
    category_id: 'cat-1',
    unit_id: null,
    status: 'published',
    is_featured: false,
    published_at: '2026-11-15T08:00:00.000Z',
    created_at: NOW_ISO,
    updated_at: NOW_ISO,
    category: { id: 'cat-1', slug: 'kegiatan-yayasan', name: 'Kegiatan Yayasan' },
    unit: null,
  },
];

export const DEFAULT_GALLERIES: GalleryAlbum[] = [
  {
    id: 'gal-1',
    slug: 'lingkungan-kampus-yayasan',
    title: 'Lingkungan Kampus Yayasan Muhammad Tahir Garut',
    description: 'Dokumentasi suasana gedung sekolah dan halaman belajar peserta didik (Placeholder).',
    cover_image_url: '/images/campus-building.jpg',
    unit_id: null,
    is_published: true,
    event_date: '2026-11-20',
    created_at: NOW_ISO,
    items: [
      {
        id: 'gal-item-1',
        gallery_id: 'gal-1',
        media_type: 'photo',
        media_url: '/images/campus-building.jpg',
        caption: 'Gedung utama pembelajaran Yayasan Muhammad Tahir Garut',
        display_order: 1,
      },
      {
        id: 'gal-item-2',
        gallery_id: 'gal-1',
        media_type: 'photo',
        media_url: '/images/hero-students.jpg',
        caption: 'Aktivitas siswa di lingkungan sekolah',
        display_order: 2,
      },
    ],
  },
];

export const DEFAULT_EVENTS: SchoolEvent[] = [
  {
    id: 'evt-1',
    title: 'Pembukaan Pendaftaran PPDB Gelombang 1 Tahun Ajaran 2027/2028',
    description: 'Penerimaan pendaftaran online untuk jenjang R.A., MI, dan SMP Muhammad Tahir Garut.',
    location: 'Online & Sekretariat PPDB Yayasan Muhammad Tahir Garut',
    start_date: '2026-12-01T08:00:00.000Z',
    end_date: '2027-03-31T16:00:00.000Z',
    unit_id: null,
    is_published: true,
  },
  {
    id: 'evt-2',
    title: 'Open House & Silaturahmi Orang Tua Calon Peserta Didik',
    description: 'Pengenalan kurikulum, program unggulan unit R.A., MI, dan SMP bersama pimpinan yayasan.',
    location: 'Aula Yayasan Muhammad Tahir Garut',
    start_date: '2027-01-16T08:30:00.000Z',
    end_date: '2027-01-16T12:00:00.000Z',
    unit_id: null,
    is_published: true,
  },
];

export const DEFAULT_ACADEMIC_YEARS: AcademicYear[] = [
  {
    id: 'ay-2027',
    name: '2027/2028',
    start_year: 2027,
    end_year: 2028,
    is_active: true,
  },
];

export const DEFAULT_ADMISSION_PERIODS: AdmissionPeriod[] = DEFAULT_EDUCATION_UNITS.map((unit) => ({
  id: `period-${unit.slug}-2027`,
  academic_year_id: 'ay-2027',
  unit_id: unit.id,
  name: 'Gelombang 1 Tahun Ajaran 2027/2028',
  start_date: '2026-11-01',
  end_date: '2027-06-30',
  quota: 90,
  is_open: true,
  notes: 'Pendaftaran online terbuka untuk umum. Verifikasi berkas dilakukan oleh panitia PPDB masing-masing unit.',
  academic_year: DEFAULT_ACADEMIC_YEARS[0],
}));
