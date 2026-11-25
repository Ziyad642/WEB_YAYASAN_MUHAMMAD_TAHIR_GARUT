import { cookies } from 'next/headers';
import { getLocalAdmissions } from '@/lib/services/local-store';
import { readDataJson, writeDataJson } from '@/lib/storage/data-storage';
import type { AdmissionRecord } from '@/types/database';

export interface ApplicantAccount {
  id: string;
  full_name: string;
  phone: string; // WhatsApp / No HP
  email?: string;
  password: string;
  created_at: string;
}

const APPLICANTS_FILE = 'applicants.json';

const INITIAL_APPLICANTS: ApplicantAccount[] = [
  {
    id: 'app-user-001',
    full_name: 'Ahmad Fauzi',
    phone: '081234567891',
    email: 'ahmad.fauzi@gmail.com',
    password: 'WaliSantri2027!',
    created_at: '2026-11-23T08:00:00Z',
  },
  {
    id: 'app-user-002',
    full_name: 'Dadan Hamdani',
    phone: '081234567892',
    email: 'dadan.hamdani@gmail.com',
    password: 'WaliSantri2027!',
    created_at: '2026-11-23T11:00:00Z',
  },
];

export function getApplicants(): ApplicantAccount[] {
  return readDataJson<ApplicantAccount[]>(APPLICANTS_FILE, INITIAL_APPLICANTS);
}

export function saveApplicants(applicants: ApplicantAccount[]): void {
  writeDataJson(APPLICANTS_FILE, applicants);
}

export function createApplicantAccount(data: {
  full_name: string;
  phone: string;
  email?: string;
  password: string;
}): { success: boolean; account?: ApplicantAccount; error?: string } {
  const applicants = getApplicants();
  const cleanPhone = data.phone.trim().replace(/[^0-9]/g, '');

  if (cleanPhone.length < 9) {
    return { success: false, error: 'Nomor WhatsApp/HP minimal 9 digit angka.' };
  }

  const existing = applicants.find((a) => {
    const p1 = a.phone.replace(/[^0-9]/g, '');
    const matchPhone = p1 === cleanPhone;
    const matchEmail = data.email && a.email && a.email.toLowerCase() === data.email.trim().toLowerCase();
    return matchPhone || matchEmail;
  });

  if (existing) {
    return {
      success: false,
      error: 'Nomor WhatsApp atau Email ini sudah terdaftar. Silakan langsung masuk.',
    };
  }

  const newAccount: ApplicantAccount = {
    id: `app-user-${Date.now()}`,
    full_name: data.full_name.trim(),
    phone: cleanPhone,
    email: data.email ? data.email.trim().toLowerCase() : undefined,
    password: data.password.trim(),
    created_at: new Date().toISOString(),
  };

  applicants.push(newAccount);
  saveApplicants(applicants);

  return { success: true, account: newAccount };
}

export function findApplicantUser(identifier: string): ApplicantAccount | null {
  const applicants = getApplicants();
  const clean = identifier.trim().toLowerCase();
  const cleanPhone = clean.replace(/[^0-9]/g, '');

  return (
    applicants.find((a) => {
      const matchPhone = cleanPhone.length >= 9 && a.phone.replace(/[^0-9]/g, '') === cleanPhone;
      const matchEmail = a.email && a.email.toLowerCase() === clean;
      return matchPhone || matchEmail;
    }) || null
  );
}

export function verifyApplicantCredentials(
  identifier: string,
  password: string
): ApplicantAccount | null {
  const user = findApplicantUser(identifier);
  if (!user) return null;
  if (user.password !== password.trim()) return null;

  return user;
}

export function getApplicantById(id: string): ApplicantAccount | null {
  const applicants = getApplicants();
  return applicants.find((a) => a.id === id) || null;
}

export async function getServerApplicant(): Promise<ApplicantAccount | null> {
  try {
    const cookieStore = cookies();
    const applicantId = cookieStore.get('applicant_session')?.value;
    if (!applicantId) return null;
    return getApplicantById(applicantId);
  } catch {
    return null;
  }
}

export function getApplicantAdmissions(applicant: ApplicantAccount): AdmissionRecord[] {
  const allAdmissions = getLocalAdmissions();
  const cleanApplicantPhone = applicant.phone.replace(/[^0-9]/g, '');

  return allAdmissions.filter((adm) => {
    // 1. Direct user_id association
    if (adm.user_id && adm.user_id === applicant.id) return true;

    // 2. Fallback to phone / email association
    const guardianPhone = (adm.guardian?.phone || '').replace(/[^0-9]/g, '');
    const guardianEmail = (adm.guardian?.email || '').toLowerCase();
    const applicantEmail = (applicant.email || '').toLowerCase();

    const matchPhone = cleanApplicantPhone && guardianPhone && guardianPhone === cleanApplicantPhone;
    const matchEmail = applicantEmail && guardianEmail && guardianEmail === applicantEmail;

    return Boolean(matchPhone || matchEmail);
  });
}

export function resetApplicantPassword(
  identifier: string,
  newPassword: string
): { success: boolean; error?: string } {
  const applicants = getApplicants();
  const clean = identifier.trim().toLowerCase();
  const cleanPhone = clean.replace(/[^0-9]/g, '');

  const user = applicants.find((a) => {
    const matchPhone = cleanPhone.length >= 9 && a.phone.replace(/[^0-9]/g, '') === cleanPhone;
    const matchEmail = a.email && a.email.toLowerCase() === clean;
    return matchPhone || matchEmail;
  });

  if (!user) {
    return {
      success: false,
      error: 'Nomor WhatsApp atau Email tidak terdaftar dalam sistem.',
    };
  }

  if (newPassword.trim().length < 6) {
    return {
      success: false,
      error: 'Kata sandi baru minimal 6 karakter.',
    };
  }

  user.password = newPassword.trim();
  saveApplicants(applicants);
  return { success: true };
}

export function ensureApplicantForSubmission(
  fullName: string,
  phone: string,
  email?: string
): ApplicantAccount {
  const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
  const applicants = getApplicants();
  const existing = applicants.find((a) => a.phone.replace(/[^0-9]/g, '') === cleanPhone);
  if (existing) return existing;

  const newAcc: ApplicantAccount = {
    id: `app-user-${Date.now()}`,
    full_name: fullName.trim(),
    phone: cleanPhone,
    email: email ? email.trim().toLowerCase() : undefined,
    password: 'WaliSantri2027!',
    created_at: new Date().toISOString(),
  };
  applicants.push(newAcc);
  saveApplicants(applicants);
  return newAcc;
}
