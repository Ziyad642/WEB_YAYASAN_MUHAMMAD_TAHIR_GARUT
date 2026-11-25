-- ============================================================================
-- 002_rls_and_storage.sql
-- Row Level Security (RLS), Role Helpers, dan Storage Buckets
-- ============================================================================

-- Helper: Ambil role code user saat ini
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.code
  FROM public.profiles p
  JOIN public.roles r ON r.id = p.role_id
  WHERE p.id = auth.uid() AND p.is_active = TRUE
  LIMIT 1;
$$;

-- Helper: Cek apakah user saat ini adalah Super Admin Yayasan
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.get_user_role() = 'super_admin', FALSE);
$$;

-- Helper: Cek apakah user memiliki akses ke unit pendidikan tertentu
CREATE OR REPLACE FUNCTION public.has_unit_access(p_unit_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN public.is_super_admin() THEN TRUE
    WHEN p_unit_id IS NULL THEN FALSE
    ELSE EXISTS (
      SELECT 1
      FROM public.user_unit_access uua
      JOIN public.profiles p ON p.id = uua.user_id
      WHERE uua.user_id = auth.uid()
        AND uua.unit_id = p_unit_id
        AND p.is_active = TRUE
    )
  END;
$$;

-- Helper: Cek izin verifikasi PPDB pada unit tertentu
CREATE OR REPLACE FUNCTION public.can_verify_unit_ppdb(p_unit_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN public.is_super_admin() THEN TRUE
    WHEN public.get_user_role() IN ('admin_unit', 'panitia_ppdb') THEN EXISTS (
      SELECT 1
      FROM public.user_unit_access uua
      JOIN public.profiles p ON p.id = uua.user_id
      WHERE uua.user_id = auth.uid()
        AND uua.unit_id = p_unit_id
        AND uua.can_verify_ppdb = TRUE
        AND p.is_active = TRUE
    )
    ELSE FALSE
  END;
$$;

-- Helper: Cek izin kelola konten pada unit tertentu
CREATE OR REPLACE FUNCTION public.can_manage_unit_content(p_unit_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN public.is_super_admin() THEN TRUE
    WHEN public.get_user_role() = 'admin_unit' AND p_unit_id IS NOT NULL THEN EXISTS (
      SELECT 1
      FROM public.user_unit_access uua
      JOIN public.profiles p ON p.id = uua.user_id
      WHERE uua.user_id = auth.uid()
        AND uua.unit_id = p_unit_id
        AND uua.can_manage_content = TRUE
        AND p.is_active = TRUE
    )
    ELSE FALSE
  END;
$$;

-- ============================================================================
-- AKTIFKAN RLS DI SELURUH TABEL
-- ============================================================================
ALTER TABLE public.foundation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_unit_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_sync_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICIES: IDENTITAS & KONTEN PUBLIK
-- ============================================================================

-- foundation_settings
CREATE POLICY "Public read foundation settings"
  ON public.foundation_settings FOR SELECT USING (TRUE);
CREATE POLICY "Super admin manage foundation settings"
  ON public.foundation_settings FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- education_units
CREATE POLICY "Public read active education units"
  ON public.education_units FOR SELECT USING (is_active = TRUE OR public.has_unit_access(id));
CREATE POLICY "Super admin insert/delete education units"
  ON public.education_units FOR INSERT WITH CHECK (public.is_super_admin());
CREATE POLICY "Admin update assigned education unit"
  ON public.education_units FOR UPDATE
  USING (public.can_manage_unit_content(id))
  WITH CHECK (public.can_manage_unit_content(id));
CREATE POLICY "Super admin delete education units"
  ON public.education_units FOR DELETE USING (public.is_super_admin());

-- academic_years
CREATE POLICY "Public read academic years"
  ON public.academic_years FOR SELECT USING (TRUE);
CREATE POLICY "Super admin manage academic years"
  ON public.academic_years FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- unit_programs
CREATE POLICY "Public read active unit programs"
  ON public.unit_programs FOR SELECT USING (is_active = TRUE OR public.can_manage_unit_content(unit_id));
CREATE POLICY "Unit admin manage unit programs"
  ON public.unit_programs FOR ALL
  USING (public.can_manage_unit_content(unit_id))
  WITH CHECK (public.can_manage_unit_content(unit_id));

-- unit_facilities
CREATE POLICY "Public read active unit facilities"
  ON public.unit_facilities FOR SELECT USING (is_active = TRUE OR public.can_manage_unit_content(unit_id));
CREATE POLICY "Unit admin manage unit facilities"
  ON public.unit_facilities FOR ALL
  USING (public.can_manage_unit_content(unit_id))
  WITH CHECK (public.can_manage_unit_content(unit_id));

-- pages
CREATE POLICY "Public read published pages"
  ON public.pages FOR SELECT USING (is_published = TRUE OR public.is_super_admin());
CREATE POLICY "Super admin manage pages"
  ON public.pages FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- news_categories
CREATE POLICY "Public read news categories"
  ON public.news_categories FOR SELECT USING (TRUE);
CREATE POLICY "Super admin manage news categories"
  ON public.news_categories FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- news
CREATE POLICY "Public read published news"
  ON public.news FOR SELECT
  USING (status = 'published' OR public.can_manage_unit_content(unit_id) OR public.is_super_admin());
CREATE POLICY "Authorized admin manage news"
  ON public.news FOR ALL
  USING (public.is_super_admin() OR public.can_manage_unit_content(unit_id))
  WITH CHECK (public.is_super_admin() OR public.can_manage_unit_content(unit_id));

-- galleries
CREATE POLICY "Public read published galleries"
  ON public.galleries FOR SELECT
  USING (is_published = TRUE OR public.can_manage_unit_content(unit_id) OR public.is_super_admin());
CREATE POLICY "Authorized admin manage galleries"
  ON public.galleries FOR ALL
  USING (public.is_super_admin() OR public.can_manage_unit_content(unit_id))
  WITH CHECK (public.is_super_admin() OR public.can_manage_unit_content(unit_id));

-- gallery_items
CREATE POLICY "Public read published gallery items"
  ON public.gallery_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.galleries g
      WHERE g.id = gallery_id
        AND (g.is_published = TRUE OR public.can_manage_unit_content(g.unit_id) OR public.is_super_admin())
    )
  );
CREATE POLICY "Authorized admin manage gallery items"
  ON public.gallery_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.galleries g
      WHERE g.id = gallery_id
        AND (public.is_super_admin() OR public.can_manage_unit_content(g.unit_id))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.galleries g
      WHERE g.id = gallery_id
        AND (public.is_super_admin() OR public.can_manage_unit_content(g.unit_id))
    )
  );

-- events
CREATE POLICY "Public read published events"
  ON public.events FOR SELECT
  USING (is_published = TRUE OR public.can_manage_unit_content(unit_id) OR public.is_super_admin());
CREATE POLICY "Authorized admin manage events"
  ON public.events FOR ALL
  USING (public.is_super_admin() OR public.can_manage_unit_content(unit_id))
  WITH CHECK (public.is_super_admin() OR public.can_manage_unit_content(unit_id));

-- teachers
CREATE POLICY "Public read active teachers"
  ON public.teachers FOR SELECT
  USING (is_active = TRUE OR public.can_manage_unit_content(unit_id));
CREATE POLICY "Unit admin manage teachers"
  ON public.teachers FOR ALL
  USING (public.can_manage_unit_content(unit_id))
  WITH CHECK (public.can_manage_unit_content(unit_id));

-- ============================================================================
-- POLICIES: PENGGUNA & AUDIT
-- ============================================================================

-- roles
CREATE POLICY "Authenticated users read roles"
  ON public.roles FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Super admin manage roles"
  ON public.roles FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- profiles
CREATE POLICY "Users read own profile or super admin reads all"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_super_admin());
CREATE POLICY "Super admin manage profiles"
  ON public.profiles FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- user_unit_access
CREATE POLICY "Users read own unit access or super admin reads all"
  ON public.user_unit_access FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());
CREATE POLICY "Super admin manage unit access"
  ON public.user_unit_access FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- audit_logs
CREATE POLICY "Super admin read audit logs"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (public.is_super_admin());
CREATE POLICY "Authenticated insert audit logs"
  ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid() OR public.is_super_admin());

-- ============================================================================
-- POLICIES: PPDB (STRICT PRIVACY - PUBLIK TIDAK BISA SELECT DATA PENDAFTAR)
-- Catatan: Pendaftaran baru & Cek Pendaftaran dilakukan melalui API Server
-- menggunakan Service Role dengan validasi Zod & Rate Limiting.
-- ============================================================================

-- admission_periods
CREATE POLICY "Public read open admission periods"
  ON public.admission_periods FOR SELECT
  USING (is_open = TRUE OR public.has_unit_access(unit_id));
CREATE POLICY "Super admin or unit admin manage admission periods"
  ON public.admission_periods FOR ALL
  USING (public.is_super_admin() OR public.can_manage_unit_content(unit_id))
  WITH CHECK (public.is_super_admin() OR public.can_manage_unit_content(unit_id));

-- admissions
CREATE POLICY "Authorized staff read unit admissions"
  ON public.admissions FOR SELECT TO authenticated
  USING (public.has_unit_access(unit_id));
CREATE POLICY "Authorized staff update unit admissions"
  ON public.admissions FOR UPDATE TO authenticated
  USING (public.can_verify_unit_ppdb(unit_id))
  WITH CHECK (public.can_verify_unit_ppdb(unit_id));
CREATE POLICY "Super admin delete admissions"
  ON public.admissions FOR DELETE TO authenticated
  USING (public.is_super_admin());

-- applicants
CREATE POLICY "Authorized staff read unit applicants"
  ON public.applicants FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admissions a
      WHERE a.id = admission_id AND public.has_unit_access(a.unit_id)
    )
  );
CREATE POLICY "Authorized staff update unit applicants"
  ON public.applicants FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admissions a
      WHERE a.id = admission_id AND public.can_verify_unit_ppdb(a.unit_id)
    )
  );

-- guardians
CREATE POLICY "Authorized staff read unit guardians"
  ON public.guardians FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admissions a
      WHERE a.id = admission_id AND public.has_unit_access(a.unit_id)
    )
  );

-- admission_documents
CREATE POLICY "Authorized staff read unit admission documents"
  ON public.admission_documents FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admissions a
      WHERE a.id = admission_id AND public.has_unit_access(a.unit_id)
    )
  );
CREATE POLICY "Authorized staff update unit admission documents"
  ON public.admission_documents FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admissions a
      WHERE a.id = admission_id AND public.can_verify_unit_ppdb(a.unit_id)
    )
  );

-- admission_status_logs
CREATE POLICY "Authorized staff read unit status logs"
  ON public.admission_status_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admissions a
      WHERE a.id = admission_id AND public.has_unit_access(a.unit_id)
    )
  );
CREATE POLICY "Authorized staff insert unit status logs"
  ON public.admission_status_logs FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admissions a
      WHERE a.id = admission_id AND public.can_verify_unit_ppdb(a.unit_id)
    )
  );

-- google_sync_logs
CREATE POLICY "Authorized staff read google sync logs"
  ON public.google_sync_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admissions a
      WHERE a.id = admission_id AND public.has_unit_access(a.unit_id)
    )
  );
CREATE POLICY "Super admin manage google sync logs"
  ON public.google_sync_logs FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- ============================================================================
-- STORAGE BUCKETS & POLICIES
-- 1. public-assets (PUBLIC): foto berita, galeri, fasilitas, guru, logo unit
-- 2. ppdb-documents (PRIVATE): KK, Akta Kelahiran, Pas Foto (hanya via Signed URL)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'public-assets',
    'public-assets',
    TRUE,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
  ),
  (
    'ppdb-documents',
    'ppdb-documents',
    FALSE,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'application/pdf']
  )
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: public-assets dapat dibaca publik, upload oleh admin terautentikasi
CREATE POLICY "Public read public-assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'public-assets');

CREATE POLICY "Authenticated admin upload public-assets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'public-assets'
    AND public.get_user_role() IN ('super_admin', 'admin_unit')
  );

CREATE POLICY "Authenticated admin delete public-assets"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'public-assets'
    AND public.get_user_role() IN ('super_admin', 'admin_unit')
  );

-- Storage Policy: ppdb-documents TIDAK dapat diakses publik secara langsung
-- Server API membuat Signed URL hanya untuk admin/panitia PPDB yang berwenang.
CREATE POLICY "Authorized staff read ppdb-documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'ppdb-documents'
    AND public.get_user_role() IN ('super_admin', 'admin_unit', 'panitia_ppdb')
  );
