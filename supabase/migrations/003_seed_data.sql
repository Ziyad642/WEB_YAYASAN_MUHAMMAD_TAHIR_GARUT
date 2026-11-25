-- ============================================================================
-- 003_seed_data.sql
-- Data Awal (Placeholder Resmi yang Mudah Diubah Admin) - Tanpa Data Pendaftar Palsu
-- ============================================================================

-- 1. Master Roles
INSERT INTO public.roles (code, name, description) VALUES
  ('super_admin', 'Super Admin Yayasan', 'Akses penuh seluruh unit, CMS, PPDB, pengguna, dan pengaturan yayasan.'),
  ('admin_unit', 'Admin Unit Pendidikan', 'Mengelola profil, berita, galeri, guru, serta verifikasi PPDB khusus unit yang ditugaskan.'),
  ('panitia_ppdb', 'Panitia PPDB', 'Memeriksa dokumen, memverifikasi, dan memperbarui status pendaftar PPDB unit yang ditugaskan.')
ON CONFLICT (code) DO NOTHING;

-- 2. Pengaturan Yayasan (Placeholder yang siap disesuaikan di Dashboard Admin)
INSERT INTO public.foundation_settings (
  foundation_name,
  tagline,
  short_description,
  history,
  vision,
  mission,
  address,
  phone,
  whatsapp,
  email,
  logo_url,
  hero_badge,
  hero_title,
  hero_subtitle,
  hero_image_url,
  about_image_url,
  ppdb_banner_title,
  ppdb_banner_subtitle,
  footer_quote,
  is_placeholder_data
)
SELECT
  'Yayasan Muhammad Tahir Garut',
  'Berilmu, Berakhlak, Berprestasi',
  'Yayasan Muhammad Tahir Garut hadir sebagai lembaga pendidikan Islam yang berkomitmen mencetak generasi berilmu, berakhlak mulia, dan berprestasi di Kabupaten Garut.',
  'Informasi sejarah resmi Yayasan Muhammad Tahir Garut sedang disiapkan dan dapat diperbarui kapan saja melalui Dashboard Admin oleh pengurus yayasan.',
  'Mewujudkan lembaga pendidikan Islam yang unggul dalam ilmu pengetahuan, kokoh dalam iman dan takwa, serta berakhlak mulia untuk masa depan bangsa.',
  '["Menyelenggarakan pendidikan Islam terpadu yang berkualitas dari jenjang RA, MI, hingga SMP.", "Membentuk karakter peserta didik yang berakhlakul karimah dan cinta Al-Qur''an.", "Mengembangkan potensi akademik, literasi, sains, dan keterampilan abad ke-21.", "Membangun sinergi harmonis antara pendidik, orang tua, dan masyarakat."]'::jsonb,
  'Karangpawitan, Kab. Garut, Jawa Barat (Alamat lengkap dapat diubah di Admin)',
  '(0262) 000000 (Placeholder)',
  '6281200000000',
  'info@yayasanmuhammadtahirgarut.sch.id',
  '/logos/logo-yayasan.png',
  'Pendidikan Islam Terpadu',
  'Mencetak Generasi Unggul untuk Masa Depan',
  'Dengan pendidikan yang berkualitas, berlandaskan nilai-nilai Islam, kami hadir untuk membentuk generasi berilmu, berakhlak mulia, dan berprestasi.',
  '/images/hero-students.jpg',
  '/images/campus-building.jpg',
  'Pendaftaran Peserta Didik Baru Telah Dibuka!',
  'Daftarkan putra-putri Anda sekarang melalui sistem PPDB online kami.',
  'Pendidikan adalah cahaya menuju masa depan',
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.foundation_settings);

-- 3. Tiga Unit Pendidikan (RA, MI, SMP)
INSERT INTO public.education_units (
  slug, unit_code, name, level_label, short_description, full_profile, history, vision, mission,
  achievements, ppdb_info, logo_url, is_logo_placeholder, banner_image_url, accent_color, display_order
) VALUES
(
  'ra',
  'RA',
  'R.A. Muhammad Tahir',
  'Pendidikan Anak Usia Dini',
  'Pendidikan Islam anak usia dini yang ceria, ramah anak, dan menanamkan adab sejak dini.',
  'R.A. Muhammad Tahir (Raudhatul Athfal) di bawah naungan Yayasan Muhammad Tahir Garut menyelenggarakan pendidikan anak usia dini berbasis nilai-nilai keislaman, bermain sambil belajar, serta pengenalan Al-Qur''an sejak dini.',
  'Profil sejarah unit R.A. dapat diperbarui oleh Admin Unit R.A. melalui Dashboard Admin.',
  'Membentuk anak usia dini yang ceria, sehat, mandiri, mencintai Allah dan Rasul-Nya, serta siap memasuki jenjang pendidikan dasar.',
  '["Menanamkan pembiasaan ibadah dan adab Islami sehari-hari.", "Mengembangkan motorik, kognitif, bahasa, dan kreativitas anak melalui metode bermain bermakna.", "Menciptakan lingkungan belajar yang aman, nyaman, dan penuh kasih sayang."]'::jsonb,
  '["Lingkungan belajar ramah anak dengan sentra bermain edukatif.", "Program pembiasaan doa harian dan hafalan surat pendek."]'::jsonb,
  'Menerima peserta didik baru usia 4-6 tahun (Kelompok A dan Kelompok B). Syarat dan jadwal dapat disesuaikan oleh Admin Unit R.A.',
  '/logos/logo-ra.png',
  FALSE,
  '/images/campus-building.jpg',
  '#D4A742',
  1
),
(
  'mi',
  'MI',
  'MI Muhammad Tahir',
  'Pendidikan Tingkat Dasar',
  'Madrasah Ibtidaiyah yang memadukan kurikulum nasional, literasi sains, dan tahfidz Al-Qur''an.',
  'MI Muhammad Tahir merupakan jenjang pendidikan dasar setingkat Sekolah Dasar yang mengintegrasikan kurikulum pendidikan nasional, Kementerian Agama, penguatan tahfidz, serta pembentukan akhlak mulia.',
  'Profil sejarah unit MI dapat diperbarui oleh Admin Unit MI melalui Dashboard Admin.',
  'Menjadi Madrasah Ibtidaiyah unggul yang melahirkan generasi cerdas intelektual, kuat spiritual, dan berkarakter Islami.',
  '["Menyelenggarakan pembelajaran aktif dan menyenangkan berbasis literasi dan numerasi.", "Membina hafalan Al-Qur''an dan pembiasaan shalat berjamaah.", "Mengembangkan minat dan bakat siswa melalui kegiatan ekstrakurikuler terpadu."]'::jsonb,
  '["Pembinaan program tahfidz Al-Qur''an terstruktur.", "Integrasi pembelajaran berbasis karakter dan teknologi."]'::jsonb,
  'Menerima peserta didik baru lulusan TK/RA atau sederajat usia minimal 6 tahun. Logo resmi MI dapat diunggah melalui Dashboard Admin.',
  '/logos/logo-mi-placeholder.svg',
  TRUE,
  '/images/campus-building.jpg',
  '#102F55',
  2
),
(
  'smp',
  'SMP',
  'SMP Muhammad Tahir',
  'Pendidikan Tingkat Menengah Pertama',
  'Sekolah Menengah Pertama berbasis karakter Islami, kepemimpinan, dan prestasi akademik.',
  'SMP Muhammad Tahir membekali remaja dengan fondasi akidah yang kokoh, penguasaan sains dan teknologi, kemampuan berbahasa, serta jiwa kepemimpinan untuk siap melanjutkan ke jenjang terbaik.',
  'Profil sejarah unit SMP dapat diperbarui oleh Admin Unit SMP melalui Dashboard Admin.',
  'Mewujudkan lulusan SMP yang berakhlak mulia, berprestasi akademik dan non-akademik, serta siap menghadapi tantangan zaman.',
  '["Menerapkan pembelajaran kolaboratif berbasis proyek dan penguatan karakter Islami.", "Membekali siswa dengan kecakapan digital, literasi, dan kepemimpinan organisasi.", "Mendorong prestasi kompetisi akademik, keagamaan, dan olahraga."]'::jsonb,
  '["Pembinaan OSIS dan organisasi kepemimpinan pelajar.", "Program penguatan akademik dan pembinaan keagamaan intensif."]'::jsonb,
  'Menerima peserta didik baru lulusan SD/MI sederajat. Persyaratan dan kuota gelombang dapat diatur oleh Admin Unit SMP.',
  '/logos/logo-smp.png',
  FALSE,
  '/images/campus-building.jpg',
  '#0F5C43',
  3
)
ON CONFLICT (slug) DO NOTHING;

-- 4. Tahun Ajaran & Gelombang PPDB Aktif
INSERT INTO public.academic_years (name, start_year, end_year, is_active) VALUES
  ('2027/2028', 2027, 2028, TRUE)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.admission_periods (academic_year_id, unit_id, name, start_date, end_date, quota, is_open, notes)
SELECT
  ay.id,
  eu.id,
  'Gelombang 1 Tahun Ajaran 2027/2028',
  DATE '2026-11-01',
  DATE '2027-06-30',
  90,
  TRUE,
  'Pendaftaran online terbuka untuk umum. Verifikasi berkas dilakukan oleh panitia PPDB masing-masing unit.'
FROM public.academic_years ay
CROSS JOIN public.education_units eu
WHERE ay.name = '2027/2028'
  AND NOT EXISTS (
    SELECT 1 FROM public.admission_periods ap
    WHERE ap.academic_year_id = ay.id AND ap.unit_id = eu.id
  );

-- 5. Program Unggulan Awal per Unit
INSERT INTO public.unit_programs (unit_id, title, description, icon_name, display_order)
SELECT id, 'Pembiasaan Akhlak & Doa Harian', 'Pembentukan karakter Islami sejak usia dini melalui keteladanan dan pembiasaan sehari-hari.', 'Heart', 1
FROM public.education_units WHERE slug = 'ra'
AND NOT EXISTS (SELECT 1 FROM public.unit_programs up WHERE up.unit_id = education_units.id);

INSERT INTO public.unit_programs (unit_id, title, description, icon_name, display_order)
SELECT id, 'Sentra Bermain Edukatif', 'Metode belajar sambil bermain yang menstimulasi motorik, bahasa, dan kreativitas anak.', 'Sparkles', 2
FROM public.education_units WHERE slug = 'ra'
AND NOT EXISTS (SELECT 1 FROM public.unit_programs up WHERE up.unit_id = education_units.id AND up.display_order = 2);

INSERT INTO public.unit_programs (unit_id, title, description, icon_name, display_order)
SELECT id, 'Tahfidz & Tilawah Al-Qur''an', 'Program hafalan Al-Qur''an bertahap dengan bimbingan guru tahfidz berpengalaman.', 'BookOpen', 1
FROM public.education_units WHERE slug = 'mi'
AND NOT EXISTS (SELECT 1 FROM public.unit_programs up WHERE up.unit_id = education_units.id);

INSERT INTO public.unit_programs (unit_id, title, description, icon_name, display_order)
SELECT id, 'Literasi Sains & Numerasi', 'Penguatan konsep dasar matematika, IPA, dan literasi membaca secara aplikatif.', 'Compass', 2
FROM public.education_units WHERE slug = 'mi'
AND NOT EXISTS (SELECT 1 FROM public.unit_programs up WHERE up.unit_id = education_units.id AND up.display_order = 2);

INSERT INTO public.unit_programs (unit_id, title, description, icon_name, display_order)
SELECT id, 'Kepemimpinan & Karakter Islami', 'Pembinaan kedisiplinan, akhlak mulia, dan keterampilan kepemimpinan pelajar.', 'Award', 1
FROM public.education_units WHERE slug = 'smp'
AND NOT EXISTS (SELECT 1 FROM public.unit_programs up WHERE up.unit_id = education_units.id);

INSERT INTO public.unit_programs (unit_id, title, description, icon_name, display_order)
SELECT id, 'Keterampilan Digital & Bahasa', 'Penguasaan literasi teknologi informasi serta pembiasaan bahasa Arab dan Inggris.', 'Laptop', 2
FROM public.education_units WHERE slug = 'smp'
AND NOT EXISTS (SELECT 1 FROM public.unit_programs up WHERE up.unit_id = education_units.id AND up.display_order = 2);

-- 6. Kategori Berita & Contoh Berita Awal (CMS Ready)
INSERT INTO public.news_categories (slug, name) VALUES
  ('kegiatan-yayasan', 'Kegiatan Yayasan'),
  ('pengumuman', 'Pengumuman'),
  ('prestasi', 'Prestasi & Kesiswaan')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.news (slug, title, excerpt, content, thumbnail_url, category_id, status, is_featured, published_at)
SELECT
  'pembukaan-ppdb-online-yayasan-muhammad-tahir-garut-2027-2028',
  'Pembukaan PPDB Online Yayasan Muhammad Tahir Garut Tahun Ajaran 2027/2028',
  'Pendaftaran Peserta Didik Baru (PPDB) untuk jenjang R.A., MI, dan SMP kini dapat dilakukan secara online melalui satu sistem terpadu.',
  'Yayasan Muhammad Tahir Garut resmi membuka Penerimaan Peserta Didik Baru (PPDB) Tahun Ajaran 2027/2028 untuk unit R.A., MI, dan SMP. Orang tua/wali dapat memilih jenjang pendidikan, mengisi formulir secara bertahap, mengunggah dokumen persyaratan, serta memantau status verifikasi pendaftaran secara daring melalui halaman Cek Pendaftaran.',
  '/images/campus-building.jpg',
  (SELECT id FROM public.news_categories WHERE slug = 'pengumuman' LIMIT 1),
  'published',
  TRUE,
  NOW() - INTERVAL '2 days'
WHERE NOT EXISTS (SELECT 1 FROM public.news WHERE slug = 'pembukaan-ppdb-online-yayasan-muhammad-tahir-garut-2027-2028');

INSERT INTO public.news (slug, title, excerpt, content, thumbnail_url, category_id, status, is_featured, published_at)
SELECT
  'semarak-hari-guru-nasional-di-lingkungan-yayasan',
  'Semarak Hari Guru Nasional di Lingkungan Yayasan Muhammad Tahir Garut',
  'Seluruh unit pendidikan melaksanakan kegiatan apresiasi dan doa bersama sebagai wujud penghormatan kepada para pendidik.',
  'Dalam rangka memperingati Hari Guru Nasional, keluarga besar Yayasan Muhammad Tahir Garut menyelenggarakan kegiatan kebersamaan yang melibatkan seluruh pendidik dan peserta didik dari unit R.A., MI, hingga SMP. Artikel ini merupakan contoh konten CMS yang dapat disunting melalui Dashboard Admin.',
  '/images/hero-students.jpg',
  (SELECT id FROM public.news_categories WHERE slug = 'kegiatan-yayasan' LIMIT 1),
  'published',
  FALSE,
  NOW() - INTERVAL '5 days'
WHERE NOT EXISTS (SELECT 1 FROM public.news WHERE slug = 'semarak-hari-guru-nasional-di-lingkungan-yayasan');

INSERT INTO public.news (slug, title, excerpt, content, thumbnail_url, category_id, status, is_featured, published_at)
SELECT
  'sinergi-program-pembinaan-karakter-islami-antar-unit',
  'Sinergi Program Pembinaan Karakter Islami di Seluruh Unit Pendidikan',
  'Koordinasi kurikulum pembiasaan ibadah dan adab Islami yang berkelanjutan dari jenjang R.A., MI, hingga SMP.',
  'Pengurus Yayasan bersama kepala unit R.A., MI, dan SMP menyusun kesinambungan program pembinaan karakter Islami agar peserta didik memiliki landasan akhlak yang kuat di setiap tahapan pendidikan. Artikel ini dapat diperbarui melalui Dashboard Admin.',
  '/images/campus-building.jpg',
  (SELECT id FROM public.news_categories WHERE slug = 'kegiatan-yayasan' LIMIT 1),
  'published',
  FALSE,
  NOW() - INTERVAL '9 days'
WHERE NOT EXISTS (SELECT 1 FROM public.news WHERE slug = 'sinergi-program-pembinaan-karakter-islami-antar-unit');
