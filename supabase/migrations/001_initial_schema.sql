-- ============================================================================
-- 001_initial_schema.sql
-- Yayasan Muhammad Tahir Garut - Ekosistem Digital Pendidikan & PPDB Terpusat
-- PostgreSQL / Supabase Migration
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- Helper Function: Auto update updated_at timestamp
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- KELOMPOK 1: IDENTITAS YAYASAN & UNIT PENDIDIKAN
-- ============================================================================

-- 1. foundation_settings: Pengaturan global & profil yayasan (dapat diubah admin)
CREATE TABLE IF NOT EXISTS public.foundation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  foundation_name TEXT NOT NULL DEFAULT 'Yayasan Muhammad Tahir Garut',
  tagline TEXT NOT NULL DEFAULT 'Berilmu, Berakhlak, Berprestasi',
  short_description TEXT NOT NULL DEFAULT '',
  history TEXT NOT NULL DEFAULT '',
  vision TEXT NOT NULL DEFAULT '',
  mission JSONB NOT NULL DEFAULT '[]'::jsonb,
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  website_url TEXT DEFAULT '',
  logo_url TEXT NOT NULL DEFAULT '/logos/logo-yayasan.png',
  hero_badge TEXT NOT NULL DEFAULT 'Pendidikan Islam Terpadu',
  hero_title TEXT NOT NULL DEFAULT 'Mencetak Generasi Unggul untuk Masa Depan',
  hero_subtitle TEXT NOT NULL DEFAULT 'Dengan pendidikan yang berkualitas, berlandaskan nilai-nilai Islam, kami hadir untuk membentuk generasi berilmu, berakhlak mulia, dan berprestasi.',
  hero_image_url TEXT NOT NULL DEFAULT '/images/hero-students.jpg',
  about_image_url TEXT NOT NULL DEFAULT '/images/campus-building.jpg',
  about_video_url TEXT DEFAULT '',
  ppdb_banner_title TEXT NOT NULL DEFAULT 'Pendaftaran Peserta Didik Baru Telah Dibuka!',
  ppdb_banner_subtitle TEXT NOT NULL DEFAULT 'Daftarkan putra-putri Anda sekarang melalui sistem PPDB online kami.',
  footer_quote TEXT NOT NULL DEFAULT 'Pendidikan adalah cahaya menuju masa depan',
  social_youtube TEXT DEFAULT '',
  social_instagram TEXT DEFAULT '',
  social_facebook TEXT DEFAULT '',
  social_tiktok TEXT DEFAULT '',
  maps_embed_url TEXT DEFAULT '',
  is_placeholder_data BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. education_units: Unit pendidikan (RA, MI, SMP) dalam satu sistem
CREATE TABLE IF NOT EXISTS public.education_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE CHECK (slug IN ('ra', 'mi', 'smp')),
  unit_code TEXT NOT NULL UNIQUE CHECK (unit_code IN ('RA', 'MI', 'SMP')),
  name TEXT NOT NULL,
  level_label TEXT NOT NULL,
  short_description TEXT NOT NULL DEFAULT '',
  full_profile TEXT NOT NULL DEFAULT '',
  history TEXT NOT NULL DEFAULT '',
  vision TEXT NOT NULL DEFAULT '',
  mission JSONB NOT NULL DEFAULT '[]'::jsonb,
  achievements JSONB NOT NULL DEFAULT '[]'::jsonb,
  ppdb_info TEXT NOT NULL DEFAULT '',
  required_documents JSONB NOT NULL DEFAULT '[
    {"key": "kk", "label": "Kartu Keluarga (KK)", "required": true, "description": "Scan/foto Kartu Keluarga yang masih berlaku (PDF/JPG/PNG, maks 3MB)"},
    {"key": "akta", "label": "Akta Kelahiran", "required": true, "description": "Scan/foto Akta Kelahiran calon peserta didik"},
    {"key": "pas_foto", "label": "Pas Foto 3x4", "required": true, "description": "Pas foto berwarna terbaru latar merah/biru"}
  ]'::jsonb,
  logo_url TEXT NOT NULL,
  is_logo_placeholder BOOLEAN NOT NULL DEFAULT FALSE,
  banner_image_url TEXT NOT NULL DEFAULT '/images/campus-building.jpg',
  accent_color TEXT NOT NULL DEFAULT '#102F55',
  headmaster_name TEXT DEFAULT '',
  contact_phone TEXT DEFAULT '',
  contact_email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. academic_years: Tahun ajaran
CREATE TABLE IF NOT EXISTS public.academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- contoh: '2027/2028'
  start_year INTEGER NOT NULL,
  end_year INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. unit_programs: Program unggulan per unit
CREATE TABLE IF NOT EXISTS public.unit_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES public.education_units(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon_name TEXT NOT NULL DEFAULT 'BookOpen',
  display_order INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. unit_facilities: Fasilitas per unit
CREATE TABLE IF NOT EXISTS public.unit_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES public.education_units(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- KELOMPOK 2: PENGGUNA, ROLE & AUDIT LOGS
-- ============================================================================

-- 6. roles: Master peran sistem
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE CHECK (code IN ('super_admin', 'admin_unit', 'panitia_ppdb')),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. profiles: Profil pengguna admin terhubung ke auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. user_unit_access: Pembatasan akses admin unit / panitia PPDB per unit
CREATE TABLE IF NOT EXISTS public.user_unit_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES public.education_units(id) ON DELETE CASCADE,
  can_manage_content BOOLEAN NOT NULL DEFAULT TRUE,
  can_verify_ppdb BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, unit_id)
);

-- 9. audit_logs: Jejak aktivitas admin
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_email TEXT DEFAULT '',
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT DEFAULT '',
  unit_id UUID REFERENCES public.education_units(id) ON DELETE SET NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- KELOMPOK 3: KONTEN WEBSITE (CMS)
-- ============================================================================

-- 10. pages: Halaman statis dinamis (Tentang Yayasan, Kontak, dll)
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  hero_image_url TEXT DEFAULT '',
  seo_title TEXT DEFAULT '',
  seo_description TEXT DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. news_categories: Kategori berita
CREATE TABLE IF NOT EXISTS public.news_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. news: Berita & pengumuman yayasan maupun unit
CREATE TABLE IF NOT EXISTS public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  thumbnail_url TEXT NOT NULL DEFAULT '/images/campus-building.jpg',
  category_id UUID REFERENCES public.news_categories(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES public.education_units(id) ON DELETE SET NULL, -- NULL = Berita Yayasan Pusat
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. galleries: Album galeri foto/video
CREATE TABLE IF NOT EXISTS public.galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  cover_image_url TEXT NOT NULL DEFAULT '/images/campus-building.jpg',
  unit_id UUID REFERENCES public.education_units(id) ON DELETE SET NULL, -- NULL = Galeri Yayasan
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  event_date DATE DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. gallery_items: Item foto/video dalam album
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES public.galleries(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL DEFAULT 'photo' CHECK (media_type IN ('photo', 'video')),
  media_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. events: Agenda kegiatan yayasan & unit
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  unit_id UUID REFERENCES public.education_units(id) ON DELETE SET NULL, -- NULL = Agenda Yayasan
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. teachers: Tenaga pendidik per unit
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES public.education_units(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT 'Guru',
  subject_or_specialty TEXT DEFAULT '',
  education_background TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- KELOMPOK 4: SISTEM PPDB TERPUSAT & GOOGLE SHEETS SYNC
-- ============================================================================

-- 17. admission_periods: Gelombang / periode pendaftaran per unit & tahun ajaran
CREATE TABLE IF NOT EXISTS public.admission_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES public.education_units(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- contoh: 'Gelombang 1'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  quota INTEGER NOT NULL DEFAULT 60,
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. admissions: Data utama pendaftaran PPDB
CREATE TABLE IF NOT EXISTS public.admissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number TEXT NOT NULL UNIQUE, -- Format: MT-RA-2027-0001
  unit_id UUID NOT NULL REFERENCES public.education_units(id) ON DELETE RESTRICT,
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE RESTRICT,
  period_id UUID NOT NULL REFERENCES public.admission_periods(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'menunggu_verifikasi' CHECK (
    status IN (
      'menunggu_verifikasi',
      'sedang_diverifikasi',
      'perlu_perbaikan_dokumen',
      'diterima',
      'tidak_diterima'
    )
  ),
  verification_notes TEXT DEFAULT '',
  statement_agreed BOOLEAN NOT NULL DEFAULT FALSE,
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. applicants: Data diri calon siswa (1-to-1 dengan admissions)
CREATE TABLE IF NOT EXISTS public.applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id UUID NOT NULL UNIQUE REFERENCES public.admissions(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('L', 'P')),
  birth_place TEXT NOT NULL,
  birth_date DATE NOT NULL,
  address TEXT NOT NULL,
  previous_school TEXT DEFAULT '',
  nisn TEXT DEFAULT '',
  nik TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. guardians: Data orang tua / wali calon siswa
CREATE TABLE IF NOT EXISTS public.guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id UUID NOT NULL UNIQUE REFERENCES public.admissions(id) ON DELETE CASCADE,
  father_name TEXT NOT NULL,
  mother_name TEXT NOT NULL,
  guardian_name TEXT DEFAULT '',
  phone TEXT NOT NULL,
  email TEXT DEFAULT '',
  parent_address TEXT NOT NULL,
  father_occupation TEXT DEFAULT '',
  mother_occupation TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. admission_documents: Metadata dokumen persyaratan yang diunggah ke bucket privat
CREATE TABLE IF NOT EXISTS public.admission_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id UUID NOT NULL REFERENCES public.admissions(id) ON DELETE CASCADE,
  document_key TEXT NOT NULL, -- contoh: 'kk', 'akta', 'pas_foto'
  document_label TEXT NOT NULL,
  file_path TEXT NOT NULL, -- path pada bucket privat ppdb-documents
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 22. admission_status_logs: Riwayat perubahan status pendaftaran
CREATE TABLE IF NOT EXISTS public.admission_status_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id UUID NOT NULL REFERENCES public.admissions(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  notes TEXT DEFAULT '',
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 23. google_sync_logs: Antrean & log sinkronisasi ke Google Sheets
CREATE TABLE IF NOT EXISTS public.google_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id UUID NOT NULL UNIQUE REFERENCES public.admissions(id) ON DELETE CASCADE,
  registration_number TEXT NOT NULL,
  target_sheet_tab TEXT NOT NULL,
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'success', 'failed')),
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT DEFAULT '',
  payload_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_news_published_at ON public.news (published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_news_unit_id ON public.news (unit_id);
CREATE INDEX IF NOT EXISTS idx_galleries_unit_id ON public.galleries (unit_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events (start_date ASC);
CREATE INDEX IF NOT EXISTS idx_teachers_unit_id ON public.teachers (unit_id);
CREATE INDEX IF NOT EXISTS idx_admissions_unit_status ON public.admissions (unit_id, status);
CREATE INDEX IF NOT EXISTS idx_admissions_reg_number ON public.admissions (registration_number);
CREATE INDEX IF NOT EXISTS idx_applicants_birth_date ON public.applicants (birth_date);
CREATE INDEX IF NOT EXISTS idx_google_sync_status ON public.google_sync_logs (sync_status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);

-- ============================================================================
-- TRIGGERS: updated_at otomatis
-- ============================================================================
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'foundation_settings',
      'education_units',
      'academic_years',
      'unit_programs',
      'unit_facilities',
      'roles',
      'profiles',
      'user_unit_access',
      'pages',
      'news_categories',
      'news',
      'galleries',
      'gallery_items',
      'events',
      'teachers',
      'admission_periods',
      'admissions',
      'applicants',
      'guardians',
      'admission_documents',
      'google_sync_logs'
    ])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_set_updated_at ON public.%I;', tbl);
    EXECUTE format(
      'CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();',
      tbl
    );
  END LOOP;
END;
$$;

-- ============================================================================
-- ATOMIC SERVER-SIDE REGISTRATION NUMBER GENERATOR
-- Format: MT-RA-2027-0001 | MT-MI-2027-0001 | MT-SMP-2027-0001
-- ============================================================================
CREATE OR REPLACE FUNCTION public.generate_registration_number(
  p_unit_code TEXT,
  p_year INTEGER
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_prefix TEXT;
  v_last_seq INTEGER;
  v_next_seq INTEGER;
BEGIN
  v_prefix := format('MT-%s-%s-', UPPER(p_unit_code), p_year::TEXT);

  -- Advisory lock per prefix agar aman dari race condition saat pendaftaran bersamaan
  PERFORM pg_advisory_xact_lock(hashtext(v_prefix));

  SELECT COALESCE(
    MAX((regexp_match(registration_number, '(\d{4})$'))[1]::INTEGER),
    0
  )
  INTO v_last_seq
  FROM public.admissions
  WHERE registration_number LIKE v_prefix || '%';

  v_next_seq := v_last_seq + 1;

  RETURN v_prefix || LPAD(v_next_seq::TEXT, 4, '0');
END;
$$;
