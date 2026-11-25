import crypto from 'node:crypto';
import {
  DEFAULT_ADMISSION_PERIODS,
  DEFAULT_EDUCATION_UNITS,
} from '@/lib/data/default-content';
import {
  MASTER_TAB_NAME,
  UNIT_TAB_MAP,
  syncAdmissionToGoogleSheets,
} from '@/lib/google/sheets';
import { ensureApplicantForSubmission } from '@/lib/auth/applicant-store';
import { createLocalAdmission } from '@/lib/services/local-store';
import {
  createAdminSupabaseClient,
  isSupabaseAdminConfigured,
} from '@/lib/supabase/server';
import {
  ALLOWED_DOC_MIME_TYPES,
  MAX_DOC_SIZE_BYTES,
  type PpdbSubmissionInput,
} from '@/lib/validations/ppdb';
import type {
  AdmissionRecord,
  RequiredDocumentConfig,
  UnitCode,
} from '@/types/database';

export interface UploadedDocFile {
  key: string;
  label: string;
  file: File;
}

export interface PpdbSubmitResult {
  registrationNumber: string;
  admissionId: string;
  submittedAt: string;
  unitName: string;
  academicYear: string;
  periodName: string;
  applicantName: string;
  status: string;
  googleSyncStatus: 'pending' | 'success' | 'failed';
}

export async function getPpdbSummaryCounts() {
  if (!isSupabaseAdminConfigured()) return undefined;
  const admin = createAdminSupabaseClient();
  const { data: rows } = await admin
    .from('admissions')
    .select('status, unit:education_units(unit_code)');

  if (!rows) return undefined;
  let ra = 0;
  let mi = 0;
  let smp = 0;
  let accepted = 0;

  for (const row of rows) {
    const unitObj = Array.isArray(row.unit) ? row.unit[0] : row.unit;
    const code = unitObj?.unit_code;
    if (code === 'RA') ra += 1;
    if (code === 'MI') mi += 1;
    if (code === 'SMP') smp += 1;
    if (row.status === 'diterima') accepted += 1;
  }

  return {
    total: rows.length,
    ra,
    mi,
    smp,
    accepted,
  };
}

export async function submitPpdbApplication(
  input: PpdbSubmissionInput,
  files: UploadedDocFile[],
  userId?: string
): Promise<PpdbSubmitResult> {
  // If Supabase is not yet configured, use persistent local JSON database
  if (!isSupabaseAdminConfigured()) {
    const unit = DEFAULT_EDUCATION_UNITS.find((u) => u.id === input.unitId) ?? DEFAULT_EDUCATION_UNITS[0];
    const period = DEFAULT_ADMISSION_PERIODS.find((p) => p.id === input.periodId) ?? DEFAULT_ADMISSION_PERIODS[0];
    const now = new Date().toISOString();

    const linkedAccount = ensureApplicantForSubmission(
      input.guardian.fatherName || input.guardian.motherName,
      input.guardian.phone,
      input.guardian.email || undefined
    );

    const created = createLocalAdmission({
      user_id: userId || linkedAccount.id,
      unit_id: unit.id,
      academic_year_id: period.academic_year_id,
      period_id: period.id,
      unitCode: unit.unit_code as UnitCode,
      status: 'menunggu_verifikasi',
      verification_notes: null,
      statement_agreed: input.statementAgreed,
      submitted_at: now,
      unit: {
        id: unit.id,
        slug: unit.slug,
        unit_code: unit.unit_code,
        name: unit.name,
        logo_url: unit.logo_url,
      },
      academic_year: {
        id: period.academic_year_id,
        name: '2027/2028',
      },
      period: {
        id: period.id,
        name: period.name,
      },
      applicant: {
        id: `app-${Date.now()}`,
        full_name: input.applicant.fullName,
        gender: input.applicant.gender,
        birth_place: input.applicant.birthPlace,
        birth_date: input.applicant.birthDate,
        address: input.applicant.address,
        previous_school: input.applicant.previousSchool ?? null,
      },
      guardian: {
        id: `grd-${Date.now()}`,
        father_name: input.guardian.fatherName,
        mother_name: input.guardian.motherName,
        guardian_name: input.guardian.guardianName ?? null,
        phone: input.guardian.phone,
        email: input.guardian.email || null,
        parent_address: input.guardian.parentAddress,
      },
      documents: files.map((f, i) => ({
        id: `doc-${Date.now()}-${i}`,
        admission_id: `adm-${Date.now()}`,
        document_key: f.key,
        document_label: f.label,
        file_name: f.file.name,
        file_path: `local/admissions/${f.file.name}`,
        file_size_bytes: f.file.size,
        mime_type: f.file.type,
        is_verified: false,
      })),
      status_logs: [
        {
          id: `log-${Date.now()}`,
          admission_id: `adm-${Date.now()}`,
          previous_status: null,
          new_status: 'menunggu_verifikasi',
          notes: 'Pendaftaran formulir daring dikirim oleh wali murid (Tersimpan di Database Lokal).',
          created_at: now,
        },
      ],
    });

    return {
      registrationNumber: created.registration_number,
      admissionId: created.id,
      submittedAt: now,
      unitName: unit.name,
      academicYear: '2027/2028',
      periodName: period.name,
      applicantName: input.applicant.fullName,
      status: 'menunggu_verifikasi',
      googleSyncStatus: 'pending',
    };
  }

  const admin = createAdminSupabaseClient();

  // 1. Verifikasi unit pendidikan, tahun ajaran, dan periode pendaftaran aktif
  const [{ data: unit, error: unitErr }, { data: period, error: periodErr }] = await Promise.all([
    admin
      .from('education_units')
      .select('id, name, unit_code, slug, required_documents, is_active')
      .eq('id', input.unitId)
      .eq('is_active', true)
      .single(),
    admin
      .from('admission_periods')
      .select('id, name, unit_id, academic_year_id, is_open, academic_year:academic_years(id, name, start_year)')
      .eq('id', input.periodId)
      .eq('unit_id', input.unitId)
      .eq('is_open', true)
      .single(),
  ]);

  if (unitErr || !unit) {
    throw new Error('Unit pendidikan tidak ditemukan atau tidak aktif.');
  }
  if (periodErr || !period) {
    throw new Error('Periode/gelombang pendaftaran tidak tersedia atau sudah ditutup.');
  }

  // 2. Validasi dokumen persyaratan sesuai konfigurasi unit
  const requiredDocs = (unit.required_documents as RequiredDocumentConfig[]) ?? [];
  const fileMap = new Map(files.map((f) => [f.key, f]));

  for (const reqDoc of requiredDocs) {
    const uploaded = fileMap.get(reqDoc.key);
    if (reqDoc.required && !uploaded) {
      throw new Error(`Dokumen wajib "${reqDoc.label}" belum diunggah.`);
    }
    if (uploaded) {
      if (!ALLOWED_DOC_MIME_TYPES.includes(uploaded.file.type as (typeof ALLOWED_DOC_MIME_TYPES)[number])) {
        throw new Error(`Format file "${reqDoc.label}" harus JPG, PNG, atau PDF.`);
      }
      if (uploaded.file.size > MAX_DOC_SIZE_BYTES) {
        throw new Error(`Ukuran file "${reqDoc.label}" maksimal 5MB.`);
      }
    }
  }

  // 3. Buat nomor pendaftaran unik secara atomik di server PostgreSQL
  const academicYearObj = Array.isArray(period.academic_year)
    ? period.academic_year[0]
    : period.academic_year;
  const regYear = academicYearObj?.start_year ?? new Date().getFullYear();

  const { data: regNumberData, error: regNumErr } = await admin.rpc(
    'generate_registration_number',
    {
      p_unit_code: unit.unit_code,
      p_year: regYear,
    }
  );

  if (regNumErr || !regNumberData) {
    throw new Error(`Gagal membuat nomor pendaftaran: ${regNumErr?.message ?? 'RPC error'}`);
  }

  const registrationNumber = String(regNumberData);

  // 4. Simpan data utama admissions
  const { data: admission, error: admissionErr } = await admin
    .from('admissions')
    .insert({
      registration_number: registrationNumber,
      unit_id: unit.id,
      academic_year_id: period.academic_year_id,
      period_id: period.id,
      status: 'menunggu_verifikasi',
      statement_agreed: true,
    })
    .select('id, submitted_at, status')
    .single();

  if (admissionErr || !admission) {
    throw new Error(`Gagal menyimpan data pendaftaran: ${admissionErr?.message ?? ''}`);
  }

  // 5. Simpan data calon siswa, orang tua, dan log status awal
  const { error: applicantErr } = await admin.from('applicants').insert({
    admission_id: admission.id,
    full_name: input.applicant.fullName,
    gender: input.applicant.gender,
    birth_place: input.applicant.birthPlace,
    birth_date: input.applicant.birthDate,
    address: input.applicant.address,
    previous_school: input.applicant.previousSchool || '',
    nisn: input.applicant.nisn || '',
  });

  if (applicantErr) {
    await admin.from('admissions').delete().eq('id', admission.id);
    throw new Error(`Gagal menyimpan data calon siswa: ${applicantErr.message}`);
  }

  const { error: guardianErr } = await admin.from('guardians').insert({
    admission_id: admission.id,
    father_name: input.guardian.fatherName,
    mother_name: input.guardian.motherName,
    guardian_name: input.guardian.guardianName || '',
    phone: input.guardian.phone,
    email: input.guardian.email || '',
    parent_address: input.guardian.parentAddress,
  });

  if (guardianErr) {
    await admin.from('admissions').delete().eq('id', admission.id);
    throw new Error(`Gagal menyimpan data orang tua/wali: ${guardianErr.message}`);
  }

  // 6. Upload dokumen persyaratan ke bucket privat ppdb-documents
  const docRows: Array<{
    admission_id: string;
    document_key: string;
    document_label: string;
    file_path: string;
    file_name: string;
    mime_type: string;
    file_size_bytes: number;
  }> = [];

  for (const item of files) {
    const ext = item.file.name.split('.').pop()?.toLowerCase() || 'bin';
    const safeExt = ext.replace(/[^a-z0-9]/g, '');
    const objectPath = `${unit.unit_code}/${registrationNumber}/${item.key}-${crypto.randomUUID()}.${safeExt}`;
    const buffer = Buffer.from(await item.file.arrayBuffer());

    const { error: uploadErr } = await admin.storage
      .from('ppdb-documents')
      .upload(objectPath, buffer, {
        contentType: item.file.type,
        upsert: false,
      });

    if (uploadErr) {
      await admin.from('admissions').delete().eq('id', admission.id);
      throw new Error(`Gagal mengunggah dokumen ${item.label}: ${uploadErr.message}`);
    }

    docRows.push({
      admission_id: admission.id,
      document_key: item.key,
      document_label: item.label,
      file_path: objectPath,
      file_name: item.file.name,
      mime_type: item.file.type,
      file_size_bytes: item.file.size,
    });
  }

  if (docRows.length > 0) {
    await admin.from('admission_documents').insert(docRows);
  }

  await admin.from('admission_status_logs').insert({
    admission_id: admission.id,
    previous_status: null,
    new_status: 'menunggu_verifikasi',
    notes: 'Pendaftaran berhasil dikirim melalui portal PPDB online.',
  });

  // 7. Antrean & sinkronisasi ke Google Sheets (tab unit + Semua Pendaftar + Laporan PPDB)
  const targetTab = UNIT_TAB_MAP[unit.unit_code as UnitCode] ?? MASTER_TAB_NAME;
  const fullRecordForSync: AdmissionRecord = {
    id: admission.id,
    registration_number: registrationNumber,
    unit_id: unit.id,
    academic_year_id: period.academic_year_id,
    period_id: period.id,
    status: 'menunggu_verifikasi',
    verification_notes: '',
    statement_agreed: true,
    submitted_at: admission.submitted_at,
    unit: {
      id: unit.id,
      slug: unit.slug,
      unit_code: unit.unit_code,
      name: unit.name,
      logo_url: '',
    },
    academic_year: {
      id: period.academic_year_id,
      name: academicYearObj?.name ?? '-',
    },
    period: {
      id: period.id,
      name: period.name,
    },
    applicant: {
      id: '',
      full_name: input.applicant.fullName,
      gender: input.applicant.gender,
      birth_place: input.applicant.birthPlace,
      birth_date: input.applicant.birthDate,
      address: input.applicant.address,
      previous_school: input.applicant.previousSchool,
    },
    guardian: {
      id: '',
      father_name: input.guardian.fatherName,
      mother_name: input.guardian.motherName,
      guardian_name: input.guardian.guardianName,
      phone: input.guardian.phone,
      email: input.guardian.email,
      parent_address: input.guardian.parentAddress,
    },
  };

  const summaryCounts = await getPpdbSummaryCounts();
  const syncResult = await syncAdmissionToGoogleSheets(fullRecordForSync, summaryCounts);

  await admin.from('google_sync_logs').insert({
    admission_id: admission.id,
    registration_number: registrationNumber,
    target_sheet_tab: targetTab,
    sync_status: syncResult.ok ? 'success' : 'failed',
    attempt_count: 1,
    last_error: syncResult.error ?? '',
    payload_snapshot: fullRecordForSync,
    synced_at: syncResult.ok ? syncResult.syncedAt : null,
  });

  return {
    registrationNumber,
    admissionId: admission.id,
    submittedAt: admission.submitted_at,
    unitName: unit.name,
    academicYear: academicYearObj?.name ?? '-',
    periodName: period.name,
    applicantName: input.applicant.fullName,
    status: admission.status,
    googleSyncStatus: syncResult.ok ? 'success' : 'failed',
  };
}

export async function resyncAdmissionById(admissionId: string) {
  if (!isSupabaseAdminConfigured()) {
    throw new Error('Supabase belum dikonfigurasi.');
  }
  const admin = createAdminSupabaseClient();

  const { data: row, error } = await admin
    .from('admissions')
    .select(
      `
      *,
      unit:education_units(id, slug, unit_code, name, logo_url),
      academic_year:academic_years(id, name),
      period:admission_periods(id, name),
      applicant:applicants(*),
      guardian:guardians(*),
      google_sync:google_sync_logs(*)
    `
    )
    .eq('id', admissionId)
    .single();

  if (error || !row) {
    throw new Error('Data pendaftaran tidak ditemukan.');
  }

  const normalized: AdmissionRecord = {
    ...row,
    unit: Array.isArray(row.unit) ? row.unit[0] : row.unit,
    academic_year: Array.isArray(row.academic_year) ? row.academic_year[0] : row.academic_year,
    period: Array.isArray(row.period) ? row.period[0] : row.period,
    applicant: Array.isArray(row.applicant) ? row.applicant[0] : row.applicant,
    guardian: Array.isArray(row.guardian) ? row.guardian[0] : row.guardian,
    google_sync: Array.isArray(row.google_sync) ? row.google_sync[0] : row.google_sync,
  };

  const summaryCounts = await getPpdbSummaryCounts();
  const syncResult = await syncAdmissionToGoogleSheets(normalized, summaryCounts);
  const currentAttempts = normalized.google_sync?.attempt_count ?? 0;

  await admin.from('google_sync_logs').upsert(
    {
      admission_id: normalized.id,
      registration_number: normalized.registration_number,
      target_sheet_tab: syncResult.targetTab,
      sync_status: syncResult.ok ? 'success' : 'failed',
      attempt_count: currentAttempts + 1,
      last_error: syncResult.error ?? '',
      payload_snapshot: normalized,
      synced_at: syncResult.ok ? syncResult.syncedAt : normalized.google_sync?.synced_at ?? null,
    },
    { onConflict: 'admission_id' }
  );

  return syncResult;
}
