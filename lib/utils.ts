import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { AdmissionStatus, SyncStatus } from '@/types/database';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateId(dateInput: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date);
}

export function formatDateTimeId(dateInput: string | Date): string {
  return formatDateId(dateInput, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export const ADMISSION_STATUS_META: Record<
  AdmissionStatus,
  { label: string; badgeClass: string; description: string }
> = {
  menunggu_verifikasi: {
    label: 'Menunggu Verifikasi',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    description: 'Formulir dan berkas telah diterima sistem dan sedang menunggu antrean pemeriksaan panitia PPDB.',
  },
  sedang_diverifikasi: {
    label: 'Sedang Diverifikasi',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    description: 'Panitia PPDB unit sedang memeriksa kelengkapan data dan keabsahan dokumen persyaratan.',
  },
  perlu_perbaikan_dokumen: {
    label: 'Perlu Perbaikan Dokumen',
    badgeClass: 'bg-orange-50 text-orange-800 border-orange-200',
    description: 'Terdapat berkas atau data yang perlu dilengkapi/diperbaiki. Silakan baca catatan panitia atau hubungi admin unit.',
  },
  diterima: {
    label: 'Diterima',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    description: 'Selamat! Calon peserta didik dinyatakan diterima. Ikuti arahan daftar ulang dari panitia unit.',
  },
  tidak_diterima: {
    label: 'Tidak Diterima',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    description: 'Mohon maaf, calon peserta didik belum dapat diterima pada periode ini.',
  },
};

const STATUS_ALIAS_MAP: Record<string, AdmissionStatus> = {
  pending: 'menunggu_verifikasi',
  verified: 'sedang_diverifikasi',
  in_progress: 'sedang_diverifikasi',
  revision_needed: 'perlu_perbaikan_dokumen',
  accepted: 'diterima',
  rejected: 'tidak_diterima',
};

export function getAdmissionStatusMeta(status?: string | null) {
  if (!status) {
    return ADMISSION_STATUS_META.menunggu_verifikasi;
  }
  const normalizedKey = (STATUS_ALIAS_MAP[status] ?? status) as AdmissionStatus;
  return (
    ADMISSION_STATUS_META[normalizedKey] ?? {
      label: status,
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
      description: '',
    }
  );
}

export const SYNC_STATUS_META: Record<SyncStatus, { label: string; badgeClass: string }> = {
  pending: {
    label: 'Menunggu Sinkronisasi',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  success: {
    label: 'Tersinkron',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  failed: {
    label: 'Gagal Sinkron',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

export function sanitizeExternalUrl(url?: string | null): string {
  if (!url) return '#';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return trimmed;
  }
  return '#';
}
