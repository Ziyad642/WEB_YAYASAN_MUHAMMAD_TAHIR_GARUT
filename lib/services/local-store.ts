import { readDataJson, writeDataJson } from '@/lib/storage/data-storage';
import type {
  AdmissionRecord,
  AdmissionStatus,
  UnitCode,
} from '@/types/database';

const ADMISSIONS_FILE = 'admissions.json';

const INITIAL_SEED_ADMISSIONS: AdmissionRecord[] = [
  {
    id: 'adm-001',
    registration_number: 'MT-RA-2027-0001',
    unit_id: '10000000-0000-0000-0000-000000000001',
    academic_year_id: '20000000-0000-0000-0000-000000000001',
    period_id: '30000000-0000-0000-0000-000000000001',
    status: 'diterima',
    verification_notes: 'Berkas lengkap dan sesuai kriteria usia.',
    statement_agreed: true,
    verified_by: 'Admin R.A.',
    verified_at: '2026-11-24T10:30:00Z',
    submitted_at: '2026-11-23T08:15:00Z',
    unit: {
      id: '10000000-0000-0000-0000-000000000001',
      slug: 'ra',
      unit_code: 'RA',
      name: 'R.A. Muhammad Tahir',
      logo_url: '/logos/logo-ra.png',
    },
    academic_year: { id: '20000000-0000-0000-0000-000000000001', name: '2027/2028' },
    period: { id: '30000000-0000-0000-0000-000000000001', name: 'Gelombang 1' },
    applicant: {
      id: 'app-001',
      full_name: 'Aisyah Azzahra',
      gender: 'P',
      birth_place: 'Garut',
      birth_date: '2021-04-12',
      address: 'Jl. Pembangunan No. 45, Tarogong Kidul, Garut',
      previous_school: 'PAUD Melati',
    },
    guardian: {
      id: 'grd-001',
      father_name: 'Ahmad Fauzi',
      mother_name: 'Siti Maryam',
      guardian_name: null,
      phone: '081234567891',
      parent_address: 'Jl. Pembangunan No. 45, Tarogong Kidul, Garut',
    },
    documents: [
      {
        id: 'doc-001',
        admission_id: 'adm-001',
        document_key: 'kk',
        document_label: 'Kartu Keluarga (KK)',
        file_name: 'kk_aisyah.pdf',
        file_path: 'admissions/ra/kk_aisyah.pdf',
        file_size_bytes: 420000,
        mime_type: 'application/pdf',
        is_verified: true,
      },
      {
        id: 'doc-002',
        admission_id: 'adm-001',
        document_key: 'akta',
        document_label: 'Akta Kelahiran',
        file_name: 'akta_aisyah.pdf',
        file_path: 'admissions/ra/akta_aisyah.pdf',
        file_size_bytes: 380000,
        mime_type: 'application/pdf',
        is_verified: true,
      },
    ],
    status_logs: [
      {
        id: 'log-001',
        admission_id: 'adm-001',
        previous_status: null,
        new_status: 'menunggu_verifikasi',
        notes: 'Pendaftaran formulir daring dikirim oleh wali murid.',
        created_at: '2026-11-23T08:15:00Z',
      },
      {
        id: 'log-002',
        admission_id: 'adm-001',
        previous_status: 'menunggu_verifikasi',
        new_status: 'diterima',
        notes: 'Berkas lengkap dan sesuai kriteria usia.',
        created_at: '2026-11-24T10:30:00Z',
      },
    ],
    google_sync: {
      id: 'sync-001',
      sync_status: 'success',
      target_sheet_tab: 'Pendaftar R.A.',
      attempt_count: 1,
      synced_at: '2026-11-23T08:15:05Z',
    },
  },
  {
    id: 'adm-002',
    registration_number: 'MT-MI-2027-0001',
    unit_id: '10000000-0000-0000-0000-000000000002',
    academic_year_id: '20000000-0000-0000-0000-000000000001',
    period_id: '30000000-0000-0000-0000-000000000002',
    status: 'sedang_diverifikasi',
    verification_notes: 'Menunggu jadwal wawancara santri & wali.',
    statement_agreed: true,
    verified_by: 'Admin MI',
    verified_at: '2026-11-24T11:00:00Z',
    submitted_at: '2026-11-23T09:20:00Z',
    unit: {
      id: '10000000-0000-0000-0000-000000000002',
      slug: 'mi',
      unit_code: 'MI',
      name: 'MI Muhammad Tahir',
      logo_url: '/logos/logo-mi-placeholder.svg',
    },
    academic_year: { id: '20000000-0000-0000-0000-000000000001', name: '2027/2028' },
    period: { id: '30000000-0000-0000-0000-000000000002', name: 'Gelombang 1' },
    applicant: {
      id: 'app-002',
      full_name: 'Fathir Al-Faruq',
      gender: 'L',
      birth_place: 'Bandung',
      birth_date: '2019-08-20',
      address: 'Kompleks Permata Garut Blok B-12',
      previous_school: 'TK Islam Terpadu',
    },
    guardian: {
      id: 'grd-002',
      father_name: 'Dedi Kurniawan',
      mother_name: 'Rina Herlina',
      guardian_name: null,
      phone: '081398765432',
      parent_address: 'Kompleks Permata Garut Blok B-12',
    },
    documents: [
      {
        id: 'doc-004',
        admission_id: 'adm-002',
        document_key: 'kk',
        document_label: 'Kartu Keluarga (KK)',
        file_name: 'kk_fathir.pdf',
        file_path: 'admissions/mi/kk_fathir.pdf',
        file_size_bytes: 450000,
        mime_type: 'application/pdf',
        is_verified: true,
      },
    ],
    status_logs: [
      {
        id: 'log-003',
        admission_id: 'adm-002',
        previous_status: null,
        new_status: 'menunggu_verifikasi',
        notes: 'Pendaftaran formulir daring dikirim oleh wali murid.',
        created_at: '2026-11-23T09:20:00Z',
      },
      {
        id: 'log-004',
        admission_id: 'adm-002',
        previous_status: 'menunggu_verifikasi',
        new_status: 'sedang_diverifikasi',
        notes: 'Menunggu jadwal wawancara santri & wali.',
        created_at: '2026-11-24T11:00:00Z',
      },
    ],
    google_sync: {
      id: 'sync-002',
      sync_status: 'success',
      target_sheet_tab: 'Pendaftar MI',
      attempt_count: 1,
      synced_at: '2026-11-23T09:20:05Z',
    },
  },
  {
    id: 'adm-003',
    registration_number: 'MT-SMP-2027-0001',
    unit_id: '10000000-0000-0000-0000-000000000003',
    academic_year_id: '20000000-0000-0000-0000-000000000001',
    period_id: '30000000-0000-0000-0000-000000000003',
    status: 'menunggu_verifikasi',
    verification_notes: null,
    statement_agreed: true,
    verified_by: null,
    verified_at: null,
    submitted_at: '2026-11-24T14:10:00Z',
    unit: {
      id: '10000000-0000-0000-0000-000000000003',
      slug: 'smp',
      unit_code: 'SMP',
      name: 'SMP Muhammad Tahir',
      logo_url: '/logos/logo-smp.png',
    },
    academic_year: { id: '20000000-0000-0000-0000-000000000001', name: '2027/2028' },
    period: { id: '30000000-0000-0000-0000-000000000003', name: 'Gelombang 1' },
    applicant: {
      id: 'app-003',
      full_name: 'Muhammad Bilal Al-Ghifari',
      gender: 'L',
      birth_place: 'Garut',
      birth_date: '2014-02-18',
      address: 'Jl. Raya Samarang No. 88, Tarogong Kaler',
      previous_school: 'SDN 1 Tarogong',
    },
    guardian: {
      id: 'grd-003',
      father_name: 'Hendra Gunawan',
      mother_name: 'Nurul Hidayati',
      guardian_name: null,
      phone: '082155667788',
      parent_address: 'Jl. Raya Samarang No. 88, Tarogong Kaler',
    },
    documents: [],
    status_logs: [
      {
        id: 'log-005',
        admission_id: 'adm-003',
        previous_status: null,
        new_status: 'menunggu_verifikasi',
        notes: 'Pendaftaran formulir daring dikirim oleh wali murid.',
        created_at: '2026-11-24T14:10:00Z',
      },
    ],
    google_sync: {
      id: 'sync-003',
      sync_status: 'success',
      target_sheet_tab: 'Pendaftar SMP',
      attempt_count: 1,
      synced_at: '2026-11-24T14:10:06Z',
    },
  },
  {
    id: 'adm-004',
    registration_number: 'MT-SMP-2027-0002',
    unit_id: '10000000-0000-0000-0000-000000000003',
    academic_year_id: '20000000-0000-0000-0000-000000000001',
    period_id: '30000000-0000-0000-0000-000000000003',
    status: 'perlu_perbaikan_dokumen',
    verification_notes: 'Foto Kartu Keluarga buram, mohon unggah ulang scan KK yang jelas.',
    statement_agreed: true,
    verified_by: 'Admin SMP',
    verified_at: '2026-11-24T15:00:00Z',
    submitted_at: '2026-11-24T12:00:00Z',
    unit: {
      id: '10000000-0000-0000-0000-000000000003',
      slug: 'smp',
      unit_code: 'SMP',
      name: 'SMP Muhammad Tahir',
      logo_url: '/logos/logo-smp.png',
    },
    academic_year: { id: '20000000-0000-0000-0000-000000000001', name: '2027/2028' },
    period: { id: '30000000-0000-0000-0000-000000000003', name: 'Gelombang 1' },
    applicant: {
      id: 'app-004',
      full_name: 'Salma Nabila Putri',
      gender: 'P',
      birth_place: 'Garut',
      birth_date: '2014-06-05',
      address: 'Kp. Bojong No. 22, Karangpawitan, Garut',
      previous_school: 'MI Muhammad Tahir',
    },
    guardian: {
      id: 'grd-004',
      father_name: 'Bambang Supriyanto',
      mother_name: 'Dewi Sartika',
      guardian_name: null,
      phone: '085211223344',
      parent_address: 'Kp. Bojong No. 22, Karangpawitan, Garut',
    },
    documents: [],
    status_logs: [
      {
        id: 'log-006',
        admission_id: 'adm-004',
        previous_status: null,
        new_status: 'menunggu_verifikasi',
        notes: 'Pendaftaran formulir daring dikirim oleh wali murid.',
        created_at: '2026-11-24T12:00:00Z',
      },
      {
        id: 'log-007',
        admission_id: 'adm-004',
        previous_status: 'menunggu_verifikasi',
        new_status: 'perlu_perbaikan_dokumen',
        notes: 'Foto Kartu Keluarga buram, mohon unggah ulang scan KK yang jelas.',
        created_at: '2026-11-24T15:00:00Z',
      },
    ],
    google_sync: {
      id: 'sync-004',
      sync_status: 'success',
      target_sheet_tab: 'Pendaftar SMP',
      attempt_count: 1,
      synced_at: '2026-11-24T12:00:06Z',
    },
  },
];

export function getLocalAdmissions(): AdmissionRecord[] {
  return readDataJson<AdmissionRecord[]>(ADMISSIONS_FILE, INITIAL_SEED_ADMISSIONS);
}

export function saveLocalAdmissions(admissions: AdmissionRecord[]): void {
  writeDataJson(ADMISSIONS_FILE, admissions);
}

export function deleteLocalAdmission(id: string): boolean {
  const all = getLocalAdmissions();
  const next = all.filter((a) => a.id !== id);
  if (next.length === all.length) return false;
  saveLocalAdmissions(next);
  return true;
}

export function deleteLocalAdmissionsBatch(
  predicate: (a: AdmissionRecord) => boolean
): number {
  const all = getLocalAdmissions();
  const toDelete = all.filter(predicate);
  if (toDelete.length === 0) return 0;
  const remaining = all.filter((a) => !predicate(a));
  saveLocalAdmissions(remaining);
  return toDelete.length;
}

export function createLocalAdmission(
  newAdmission: Omit<AdmissionRecord, 'id' | 'registration_number'> & {
    unitCode: UnitCode;
  }
): AdmissionRecord {
  const all = getLocalAdmissions();
  const year = 2027;
  const unitPrefix = `MT-${newAdmission.unitCode}-${year}`;

  // Find highest sequence number for this unit and year
  const matches = all.filter((a) => a.registration_number.startsWith(unitPrefix));
  const maxSeq = matches.reduce((max, a) => {
    const parts = a.registration_number.split('-');
    const seq = Number.parseInt(parts[parts.length - 1] || '0', 10);
    return seq > max ? seq : max;
  }, 0);

  const nextSeq = maxSeq + 1;
  const regNumber = `${unitPrefix}-${String(nextSeq).padStart(4, '0')}`;
  const newId = `adm-${Date.now()}`;

  const created: AdmissionRecord = {
    ...newAdmission,
    id: newId,
    registration_number: regNumber,
  };

  all.unshift(created);
  saveLocalAdmissions(all);
  return created;
}

export function updateLocalAdmissionStatus(
  id: string,
  newStatus: AdmissionStatus,
  notes: string | null,
  verifiedBy: string
): AdmissionRecord | null {
  const all = getLocalAdmissions();
  const index = all.findIndex((a) => a.id === id);
  if (index === -1) return null;

  const target = all[index];
  const oldStatus = target.status;
  const now = new Date().toISOString();

  target.status = newStatus;
  target.verification_notes = notes;
  target.verified_by = verifiedBy;
  target.verified_at = now;

  target.status_logs = target.status_logs || [];
  target.status_logs.unshift({
    id: `log-${Date.now()}`,
    admission_id: id,
    previous_status: oldStatus,
    new_status: newStatus,
    notes: notes || `Status diperbarui menjadi ${newStatus}`,
    created_at: now,
  });

  saveLocalAdmissions(all);
  return target;
}

export function findLocalAdmission(
  regNo: string,
  birthDate: string
): AdmissionRecord | null {
  const all = getLocalAdmissions();
  const found = all.find(
    (a) => a.registration_number.trim().toUpperCase() === regNo.trim().toUpperCase()
  );
  if (!found) return null;
  if (found.applicant?.birth_date !== birthDate) return null;
  return found;
}
