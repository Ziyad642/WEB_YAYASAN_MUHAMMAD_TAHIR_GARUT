import type { AuthSessionProfile, UnitCode, UnitSlug, UserRoleCode } from '@/types/database';

export interface AdminUserAccount {
  id: string;
  username: string;
  email: string;
  password: string; // Plaintext for local demo/setup ease
  full_name: string;
  title: string;
  phone: string;
  role: UserRoleCode;
  role_name: string;
  is_active: boolean;
  unit_access: Array<{
    unit_id: string;
    unit_code: UnitCode;
    unit_slug: UnitSlug;
    unit_name: string;
    can_manage_content: boolean;
    can_verify_ppdb: boolean;
  }>;
}

export const OFFICIAL_ADMIN_ACCOUNTS: AdminUserAccount[] = [
  {
    id: 'user-001',
    username: 'ketuayayasan',
    email: 'ketua@yayasanmuhammadtahirgarut.sch.id',
    password: 'KetuaYayasan2027!',
    full_name: 'H. Muhammad Tahir',
    title: 'Ketua Yayasan Muhammad Tahir Garut',
    phone: '081234567890',
    role: 'super_admin',
    role_name: 'Ketua Yayasan (Super Admin)',
    is_active: true,
    unit_access: [
      {
        unit_id: '10000000-0000-0000-0000-000000000001',
        unit_code: 'RA',
        unit_slug: 'ra',
        unit_name: 'R.A. Muhammad Tahir',
        can_manage_content: true,
        can_verify_ppdb: true,
      },
      {
        unit_id: '10000000-0000-0000-0000-000000000002',
        unit_code: 'MI',
        unit_slug: 'mi',
        unit_name: 'MI Muhammad Tahir',
        can_manage_content: true,
        can_verify_ppdb: true,
      },
      {
        unit_id: '10000000-0000-0000-0000-000000000003',
        unit_code: 'SMP',
        unit_slug: 'smp',
        unit_name: 'SMP Plus Muhammad Tahir',
        can_manage_content: true,
        can_verify_ppdb: true,
      },
    ],
  },
  {
    id: 'user-002',
    username: 'kepalasmp',
    email: 'kepala.smp@yayasanmuhammadtahirgarut.sch.id',
    password: 'KepalaSMP2027!',
    full_name: 'Drs. H. Ahmad Sanusi, M.Pd',
    title: 'Kepala Sekolah SMP Plus Muhammad Tahir',
    phone: '081234567891',
    role: 'admin_unit',
    role_name: 'Kepala Sekolah SMP Plus',
    is_active: true,
    unit_access: [
      {
        unit_id: '10000000-0000-0000-0000-000000000003',
        unit_code: 'SMP',
        unit_slug: 'smp',
        unit_name: 'SMP Plus Muhammad Tahir',
        can_manage_content: true,
        can_verify_ppdb: true,
      },
    ],
  },
  {
    id: 'user-003',
    username: 'kepalami',
    email: 'kepala.mi@yayasanmuhammadtahirgarut.sch.id',
    password: 'KepalaMI2027!',
    full_name: 'Hj. Siti Nurjanah, S.Pd.I',
    title: 'Kepala Sekolah MI Muhammad Tahir',
    phone: '081234567892',
    role: 'admin_unit',
    role_name: 'Kepala Sekolah MI',
    is_active: true,
    unit_access: [
      {
        unit_id: '10000000-0000-0000-0000-000000000002',
        unit_code: 'MI',
        unit_slug: 'mi',
        unit_name: 'MI Muhammad Tahir',
        can_manage_content: true,
        can_verify_ppdb: true,
      },
    ],
  },
  {
    id: 'user-004',
    username: 'kepalara',
    email: 'kepala.ra@yayasanmuhammadtahirgarut.sch.id',
    password: 'KepalaRA2027!',
    full_name: 'Dra. Euis Rohaeti',
    title: 'Kepala Sekolah RA Muhammad Tahir',
    phone: '081234567893',
    role: 'admin_unit',
    role_name: 'Kepala Sekolah RA',
    is_active: true,
    unit_access: [
      {
        unit_id: '10000000-0000-0000-0000-000000000001',
        unit_code: 'RA',
        unit_slug: 'ra',
        unit_name: 'R.A. Muhammad Tahir',
        can_manage_content: true,
        can_verify_ppdb: true,
      },
    ],
  },
  {
    id: 'user-005',
    username: 'panitiappdb',
    email: 'ppdb@yayasanmuhammadtahirgarut.sch.id',
    password: 'PanitiaPPDB2027!',
    full_name: 'Ustadz Rahmat Hidayat, S.Pd',
    title: 'Ketua Panitia PPDB Terpadu',
    phone: '081234567894',
    role: 'panitia_ppdb',
    role_name: 'Panitia Penerimaan PPDB',
    is_active: true,
    unit_access: [
      {
        unit_id: '10000000-0000-0000-0000-000000000001',
        unit_code: 'RA',
        unit_slug: 'ra',
        unit_name: 'R.A. Muhammad Tahir',
        can_manage_content: false,
        can_verify_ppdb: true,
      },
      {
        unit_id: '10000000-0000-0000-0000-000000000002',
        unit_code: 'MI',
        unit_slug: 'mi',
        unit_name: 'MI Muhammad Tahir',
        can_manage_content: false,
        can_verify_ppdb: true,
      },
      {
        unit_id: '10000000-0000-0000-0000-000000000003',
        unit_code: 'SMP',
        unit_slug: 'smp',
        unit_name: 'SMP Plus Muhammad Tahir',
        can_manage_content: false,
        can_verify_ppdb: true,
      },
    ],
  },
];

export function findAdminUser(identifier: string): AdminUserAccount | null {
  const clean = identifier.trim().toLowerCase();
  return (
    OFFICIAL_ADMIN_ACCOUNTS.find(
      (acc) => acc.username.toLowerCase() === clean || acc.email.toLowerCase() === clean
    ) || null
  );
}

export function findAdminUserById(id: string): AdminUserAccount | null {
  return OFFICIAL_ADMIN_ACCOUNTS.find((acc) => acc.id === id) || null;
}

export function verifyAdminCredentials(
  identifier: string,
  password: string
): AuthSessionProfile | null {
  const user = findAdminUser(identifier);
  if (!user) return null;
  if (user.password !== password) return null;
  if (!user.is_active) return null;

  return toAuthSessionProfile(user);
}

export function toAuthSessionProfile(user: AdminUserAccount): AuthSessionProfile {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    role_name: user.role_name,
    is_active: user.is_active,
    unit_access: user.unit_access,
  };
}
