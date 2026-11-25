import { getAllowedUnitIds } from '@/lib/auth/session';
import { getStoredAdminUsers } from '@/lib/auth/admin-users';
import {
  DEFAULT_ACADEMIC_YEARS,
  DEFAULT_ADMISSION_PERIODS,
  DEFAULT_EDUCATION_UNITS,
  DEFAULT_EVENTS,
  DEFAULT_FOUNDATION_SETTINGS,
  DEFAULT_GALLERIES,
  DEFAULT_NEWS,
  DEFAULT_NEWS_CATEGORIES,
  DEFAULT_TEACHERS,
} from '@/lib/data/default-content';
import {
  getStoredAdmissionPeriods,
  getStoredEducationUnits,
  getStoredEvents,
  getStoredFoundationSettings,
  getStoredGalleries,
  getStoredNews,
  getStoredTeachers,
} from '@/lib/services/cms-store';
import { getLocalAdmissions } from '@/lib/services/local-store';
import { createAdminSupabaseClient, isSupabaseAdminConfigured } from '@/lib/supabase/server';
import type {
  AcademicYear,
  AdmissionPeriod,
  AdmissionRecord,
  AuthSessionProfile,
  EducationUnit,
  FoundationSettings,
  GalleryAlbum,
  NewsArticle,
  NewsCategory,
  SchoolEvent,
  Teacher,
} from '@/types/database';

const MOCK_SYNC_LOGS = [
  {
    id: 'slog-001',
    admission_id: 'adm-001',
    registration_number: 'MT-RA-2027-0001',
    target_sheet_tab: 'Pendaftar R.A.',
    sync_status: 'success' as const,
    attempt_count: 1,
    synced_at: '2026-11-23T08:15:05Z',
    updated_at: '2026-11-23T08:15:05Z',
  },
  {
    id: 'slog-002',
    admission_id: 'adm-002',
    registration_number: 'MT-MI-2027-0001',
    target_sheet_tab: 'Pendaftar MI',
    sync_status: 'success' as const,
    attempt_count: 1,
    synced_at: '2026-11-23T09:20:05Z',
    updated_at: '2026-11-23T09:20:05Z',
  },
  {
    id: 'slog-003',
    admission_id: 'adm-003',
    registration_number: 'MT-SMP-2027-0001',
    target_sheet_tab: 'Pendaftar SMP',
    sync_status: 'success' as const,
    attempt_count: 1,
    synced_at: '2026-11-24T14:10:06Z',
    updated_at: '2026-11-24T14:10:06Z',
  },
  {
    id: 'slog-004',
    admission_id: 'adm-004',
    registration_number: 'MT-SMP-2027-0002',
    target_sheet_tab: 'Pendaftar SMP',
    sync_status: 'success' as const,
    attempt_count: 1,
    synced_at: '2026-11-24T12:00:06Z',
    updated_at: '2026-11-24T12:00:06Z',
  },
];

const MOCK_USERS = [
  {
    id: 'usr-001',
    full_name: 'Administrator Utama Yayasan',
    email: 'admin@yayasanmuhammadtahirgarut.sch.id',
    is_active: true,
    role_code: 'super_admin',
    role_name: 'Super Admin Yayasan',
    unit_names: ['Semua Unit (RA, MI, SMP)'],
  },
  {
    id: 'usr-002',
    full_name: 'Ustadz Ridwan Malik',
    email: 'admin.ra@yayasanmuhammadtahirgarut.sch.id',
    is_active: true,
    role_code: 'admin_unit',
    role_name: 'Admin Unit R.A.',
    unit_names: ['R.A. Muhammad Tahir'],
  },
  {
    id: 'usr-003',
    full_name: 'Hj. Siti Aisyah, S.Pd.I',
    email: 'admin.mi@yayasanmuhammadtahirgarut.sch.id',
    is_active: true,
    role_code: 'admin_unit',
    role_name: 'Admin Unit MI',
    unit_names: ['MI Muhammad Tahir'],
  },
  {
    id: 'usr-004',
    full_name: 'Drs. H. Maman Suratman, M.M.',
    email: 'admin.smp@yayasanmuhammadtahirgarut.sch.id',
    is_active: true,
    role_code: 'admin_unit',
    role_name: 'Admin Unit SMP',
    unit_names: ['SMP Muhammad Tahir'],
  },
  {
    id: 'usr-005',
    full_name: 'Panitia Pendaftaran Garut',
    email: 'ppdb@yayasanmuhammadtahirgarut.sch.id',
    is_active: true,
    role_code: 'panitia_ppdb',
    role_name: 'Panitia PPDB Terpadu',
    unit_names: ['Semua Unit (Verifikasi Berkas)'],
  },
];

const MOCK_AUDIT_LOGS = [
  {
    id: 'aud-001',
    actor_email: 'admin.ra@yayasanmuhammadtahirgarut.sch.id',
    action: 'VERIFY_PPDB_ACCEPTED',
    entity_type: 'admission',
    entity_id: 'MT-RA-2027-0001',
    created_at: '2026-11-24T10:30:00Z',
  },
  {
    id: 'aud-002',
    actor_email: 'admin.mi@yayasanmuhammadtahirgarut.sch.id',
    action: 'VERIFY_PPDB_IN_PROGRESS',
    entity_type: 'admission',
    entity_id: 'MT-MI-2027-0001',
    created_at: '2026-11-24T11:00:00Z',
  },
  {
    id: 'aud-003',
    actor_email: 'admin.smp@yayasanmuhammadtahirgarut.sch.id',
    action: 'REQUEST_PPDB_REVISION',
    entity_type: 'admission',
    entity_id: 'MT-SMP-2027-0002',
    created_at: '2026-11-24T15:00:00Z',
  },
  {
    id: 'aud-004',
    actor_email: 'admin@yayasanmuhammadtahirgarut.sch.id',
    action: 'PUBLISH_NEWS',
    entity_type: 'news',
    entity_id: 'pembukaan-ppdb-online-yayasan-muhammad-tahir-garut-2027',
    created_at: '2026-11-23T08:00:00Z',
  },
];

export interface AdminDashboardPayload {
  foundation: FoundationSettings | null;
  units: EducationUnit[];
  admissions: AdmissionRecord[];
  news: NewsArticle[];
  newsCategories: NewsCategory[];
  galleries: GalleryAlbum[];
  events: SchoolEvent[];
  teachers: Teacher[];
  academicYears: AcademicYear[];
  admissionPeriods: AdmissionPeriod[];
  syncLogs: Array<{
    id: string;
    admission_id: string;
    registration_number: string;
    target_sheet_tab: string;
    sync_status: 'pending' | 'success' | 'failed';
    attempt_count: number;
    last_error?: string;
    synced_at?: string | null;
    updated_at: string;
  }>;
  users: Array<{
    id: string;
    full_name: string;
    email: string;
    is_active: boolean;
    role_code: string;
    role_name: string;
    unit_names: string[];
  }>;
  auditLogs: Array<{
    id: string;
    actor_email: string;
    action: string;
    entity_type: string;
    entity_id: string;
    created_at: string;
  }>;
}

export async function getAdminDashboardData(
  profile: AuthSessionProfile
): Promise<AdminDashboardPayload> {
  if (!isSupabaseAdminConfigured()) {
    const allowedUnits = getAllowedUnitIds(profile);
    const storedUnits = getStoredEducationUnits();
    const filteredUnits =
      allowedUnits === 'ALL'
        ? storedUnits
        : storedUnits.filter(
            (u) =>
              allowedUnits.includes(u.id) ||
              allowedUnits.includes(u.slug) ||
              allowedUnits.includes(u.unit_code)
          );

    const localAdmissions = getLocalAdmissions();
    const filteredAdmissions =
      allowedUnits === 'ALL'
        ? localAdmissions
        : localAdmissions.filter((a) => {
            const u = storedUnits.find((unit) => unit.id === a.unit_id);
            return (
              allowedUnits.includes(a.unit_id) ||
              (u && (allowedUnits.includes(u.slug) || allowedUnits.includes(u.unit_code)))
            );
          });

    const storedFoundation = getStoredFoundationSettings();
    const storedNews = getStoredNews();
    const storedGalleries = getStoredGalleries();
    const storedEvents = getStoredEvents();
    const storedTeachers = getStoredTeachers();
    const storedPeriods = getStoredAdmissionPeriods();
    const storedUsers = getStoredAdminUsers();

    const normalizedUsers = storedUsers.map((u) => ({
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      is_active: u.is_active,
      role_code: u.role,
      role_name: u.role_name,
      unit_names: u.unit_access.map((ua) => ua.unit_name),
    }));

    return {
      foundation: profile.role === 'super_admin' ? storedFoundation : null,
      units: filteredUnits,
      admissions: filteredAdmissions,
      news: storedNews,
      newsCategories: DEFAULT_NEWS_CATEGORIES,
      galleries: storedGalleries,
      events: storedEvents,
      teachers: storedTeachers,
      academicYears: DEFAULT_ACADEMIC_YEARS,
      admissionPeriods: storedPeriods,
      syncLogs: MOCK_SYNC_LOGS,
      users: profile.role === 'super_admin' ? normalizedUsers : [],
      auditLogs: profile.role === 'super_admin' ? MOCK_AUDIT_LOGS : [],
    };
  }

  const admin = createAdminSupabaseClient();
  const allowedUnits = getAllowedUnitIds(profile);
  const isSuperAdmin = profile.role === 'super_admin';

  // Filter berdasarkan hak akses unit pada server
  const filterByUnit = <T extends { unit_id?: string | null }>(rows: T[]): T[] => {
    if (allowedUnits === 'ALL') return rows;
    return rows.filter((r) => r.unit_id && allowedUnits.includes(r.unit_id));
  };

  const [
    foundationRes,
    unitsRes,
    admissionsRes,
    newsRes,
    categoriesRes,
    galleriesRes,
    eventsRes,
    teachersRes,
    yearsRes,
    periodsRes,
    syncRes,
    usersRes,
    auditRes,
  ] = await Promise.all([
    isSuperAdmin
      ? admin.from('foundation_settings').select('*').limit(1).maybeSingle()
      : Promise.resolve({ data: null }),
    admin.from('education_units').select('*').order('display_order', { ascending: true }),
    admin
      .from('admissions')
      .select(
        `
        *,
        unit:education_units(id, slug, unit_code, name, logo_url),
        academic_year:academic_years(id, name),
        period:admission_periods(id, name),
        applicant:applicants(*),
        guardian:guardians(*),
        documents:admission_documents(*),
        status_logs:admission_status_logs(*),
        google_sync:google_sync_logs(*)
      `
      )
      .order('submitted_at', { ascending: false })
      .limit(250),
    admin
      .from('news')
      .select('*, category:news_categories(id, slug, name), unit:education_units(id, slug, name, unit_code)')
      .order('created_at', { ascending: false })
      .limit(100),
    admin.from('news_categories').select('*').order('name', { ascending: true }),
    admin
      .from('galleries')
      .select('*, unit:education_units(id, slug, name, unit_code), items:gallery_items(*)')
      .order('created_at', { ascending: false })
      .limit(100),
    admin
      .from('events')
      .select('*, unit:education_units(id, slug, name, unit_code)')
      .order('start_date', { ascending: false })
      .limit(100),
    admin.from('teachers').select('*').order('display_order', { ascending: true }),
    admin.from('academic_years').select('*').order('start_year', { ascending: false }),
    admin
      .from('admission_periods')
      .select('*, academic_year:academic_years(*)')
      .order('start_date', { ascending: false }),
    admin
      .from('google_sync_logs')
      .select('*, admission:admissions(unit_id)')
      .order('updated_at', { ascending: false })
      .limit(150),
    isSuperAdmin
      ? admin
          .from('profiles')
          .select(
            'id, full_name, email, is_active, role:roles(code, name), unit_access:user_unit_access(unit:education_units(name))'
          )
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    isSuperAdmin
      ? admin
          .from('audit_logs')
          .select('id, actor_email, action, entity_type, entity_id, created_at')
          .order('created_at', { ascending: false })
          .limit(80)
      : Promise.resolve({ data: [] }),
  ]);

  const allUnits = (unitsRes.data as EducationUnit[]) ?? [];
  const scopedUnits =
    allowedUnits === 'ALL'
      ? allUnits
      : allUnits.filter((u) => allowedUnits.includes(u.id));

  const normalizedAdmissions: AdmissionRecord[] = ((admissionsRes.data ?? []) as Array<Record<string, unknown>>)
    .map((row) => ({
      ...(row as unknown as AdmissionRecord),
      unit: Array.isArray(row.unit) ? row.unit[0] : (row.unit as AdmissionRecord['unit']),
      academic_year: Array.isArray(row.academic_year)
        ? row.academic_year[0]
        : (row.academic_year as AdmissionRecord['academic_year']),
      period: Array.isArray(row.period) ? row.period[0] : (row.period as AdmissionRecord['period']),
      applicant: Array.isArray(row.applicant)
        ? row.applicant[0]
        : (row.applicant as AdmissionRecord['applicant']),
      guardian: Array.isArray(row.guardian)
        ? row.guardian[0]
        : (row.guardian as AdmissionRecord['guardian']),
      google_sync: Array.isArray(row.google_sync)
        ? row.google_sync[0]
        : (row.google_sync as AdmissionRecord['google_sync']),
    }))
    .filter((adm) => allowedUnits === 'ALL' || allowedUnits.includes(adm.unit_id));

  const scopedSyncLogs = ((syncRes.data ?? []) as Array<Record<string, unknown>>)
    .filter((row) => {
      if (allowedUnits === 'ALL') return true;
      const adm = Array.isArray(row.admission) ? row.admission[0] : row.admission;
      return adm && typeof adm === 'object' && 'unit_id' in adm && allowedUnits.includes(String(adm.unit_id));
    })
    .map((row) => ({
      id: String(row.id),
      admission_id: String(row.admission_id),
      registration_number: String(row.registration_number),
      target_sheet_tab: String(row.target_sheet_tab),
      sync_status: row.sync_status as 'pending' | 'success' | 'failed',
      attempt_count: Number(row.attempt_count ?? 0),
      last_error: String(row.last_error ?? ''),
      synced_at: row.synced_at ? String(row.synced_at) : null,
      updated_at: String(row.updated_at),
    }));

  const normalizedUsers = ((usersRes.data ?? []) as Array<Record<string, unknown>>).map((u) => {
    const role = Array.isArray(u.role) ? u.role[0] : u.role;
    const ua = Array.isArray(u.unit_access) ? u.unit_access : [];
    const unitNames = ua
      .map((item) => {
        const unitObj = Array.isArray(item.unit) ? item.unit[0] : item.unit;
        return unitObj?.name as string | undefined;
      })
      .filter((v): v is string => Boolean(v));
    return {
      id: String(u.id),
      full_name: String(u.full_name),
      email: String(u.email),
      is_active: Boolean(u.is_active),
      role_code: String((role as { code?: string })?.code ?? ''),
      role_name: String((role as { name?: string })?.name ?? ''),
      unit_names: unitNames,
    };
  });

  return {
    foundation: (foundationRes.data as FoundationSettings | null) ?? (isSuperAdmin ? getStoredFoundationSettings() : null),
    units: scopedUnits,
    admissions: normalizedAdmissions,
    news: filterByUnit((newsRes.data as NewsArticle[]) ?? []),
    newsCategories: (categoriesRes.data as NewsCategory[]) ?? [],
    galleries: filterByUnit((galleriesRes.data as GalleryAlbum[]) ?? []),
    events: filterByUnit((eventsRes.data as SchoolEvent[]) ?? []),
    teachers: filterByUnit((teachersRes.data as Teacher[]) ?? []),
    academicYears: (yearsRes.data as AcademicYear[]) ?? [],
    admissionPeriods: filterByUnit((periodsRes.data as AdmissionPeriod[]) ?? []),
    syncLogs: scopedSyncLogs,
    users: normalizedUsers,
    auditLogs: (auditRes.data as AdminDashboardPayload['auditLogs']) ?? [],
  };
}
