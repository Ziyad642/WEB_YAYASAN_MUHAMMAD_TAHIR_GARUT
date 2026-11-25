import { z } from 'zod';

export const ALLOWED_DOC_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'] as const;
export const MAX_DOC_SIZE_BYTES = 5 * 1024 * 1024; // 5MB per file

export const ppdbSubmissionSchema = z.object({
  unitId: z.string().min(1, 'ID unit pendidikan tidak valid.'),
  academicYearId: z.string().min(1, 'Tahun ajaran tidak valid.'),
  periodId: z.string().min(1, 'Periode pendaftaran tidak valid.'),
  applicant: z.object({
    fullName: z.string().trim().min(3, 'Nama lengkap minimal 3 karakter.').max(120),
    gender: z.enum(['L', 'P'], { message: 'Pilih jenis kelamin calon siswa.' }),
    birthPlace: z.string().trim().min(2, 'Tempat lahir wajib diisi.').max(80),
    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal lahir harus YYYY-MM-DD.')
      .refine((val) => {
        const d = new Date(val);
        return !Number.isNaN(d.getTime()) && d <= new Date();
      }, 'Tanggal lahir tidak valid.'),
    address: z.string().trim().min(8, 'Alamat lengkap calon siswa wajib diisi.').max(500),
    previousSchool: z.string().trim().max(150).optional().default(''),
    nisn: z.string().trim().max(30).optional().default(''),
  }),
  guardian: z.object({
    fatherName: z.string().trim().min(2, 'Nama ayah wajib diisi.').max(120),
    motherName: z.string().trim().min(2, 'Nama ibu wajib diisi.').max(120),
    guardianName: z.string().trim().max(120).optional().default(''),
    phone: z
      .string()
      .trim()
      .min(9, 'Nomor telepon/WhatsApp minimal 9 digit.')
      .max(20)
      .regex(/^[0-9+\-\s()]+$/, 'Format nomor telepon tidak valid.'),
    email: z.string().trim().email('Format email tidak valid.').optional().or(z.literal('')),
    parentAddress: z.string().trim().min(8, 'Alamat orang tua/wali wajib diisi.').max(500),
  }),
  statementAgreed: z.literal(true, {
    message: 'Anda wajib menyetujui pernyataan kebenaran data.',
  }),
});

export const ppdbCheckStatusSchema = z.object({
  registrationNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^MT-(RA|MI|SMP)-\d{4}-\d{4}$/, 'Format nomor pendaftaran harus seperti MT-RA-2027-0001.'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal lahir tidak valid.'),
});

export const ppdbStatusUpdateSchema = z.object({
  status: z.enum([
    'menunggu_verifikasi',
    'sedang_diverifikasi',
    'perlu_perbaikan_dokumen',
    'diterima',
    'tidak_diterima',
  ]),
  verificationNotes: z.string().trim().max(1000).optional().default(''),
});

export type PpdbSubmissionInput = z.infer<typeof ppdbSubmissionSchema>;
export type PpdbCheckStatusInput = z.infer<typeof ppdbCheckStatusSchema>;
export type PpdbStatusUpdateInput = z.infer<typeof ppdbStatusUpdateSchema>;
