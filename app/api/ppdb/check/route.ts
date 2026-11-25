import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { findLocalAdmission } from '@/lib/services/local-store';
import {
  createAdminSupabaseClient,
  isSupabaseAdminConfigured,
} from '@/lib/supabase/server';
import { ppdbCheckStatusSchema } from '@/lib/validations/ppdb';

function maskName(fullName: string): string {
  return fullName
    .split(/\s+/)
    .map((part) => {
      if (part.length <= 2) return `${part[0] ?? ''}*`;
      return `${part.slice(0, 2)}${'*'.repeat(Math.min(part.length - 2, 5))}`;
    })
    .join(' ');
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`ppdb-check:${ip}`, 15, 10 * 60 * 1000);

  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: `Batas pengecekan tercapai. Silakan tunggu ${rate.resetInSeconds} detik sebelum mencoba kembali.`,
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = ppdbCheckStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Input pencarian tidak valid.' },
        { status: 400 }
      );
    }

    if (!isSupabaseAdminConfigured()) {
      const local = findLocalAdmission(parsed.data.registrationNumber, parsed.data.birthDate);
      if (!local) {
        return NextResponse.json(
          { error: 'Data pendaftaran tidak ditemukan atau tanggal lahir tidak sesuai.' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          registrationNumber: local.registration_number,
          unitName: local.unit?.name ?? 'Unit Pendidikan',
          unitSlug: local.unit?.slug ?? 'ra',
          academicYear: local.academic_year?.name ?? '2027/2028',
          periodName: local.period?.name ?? 'Gelombang 1',
          maskedName: maskName(local.applicant?.full_name ?? 'Calon Santri'),
          status: local.status,
          verificationNotes: local.verification_notes ?? null,
          submittedAt: local.submitted_at,
          verifiedAt: local.verified_at ?? null,
          history: (local.status_logs || []).map((log) => ({
            new_status: log.new_status,
            notes: log.notes,
            created_at: log.created_at,
          })),
        },
      });
    }

    const admin = createAdminSupabaseClient();
    const { registrationNumber, birthDate } = parsed.data;

    const { data: admission, error } = await admin
      .from('admissions')
      .select(
        `
        id,
        registration_number,
        status,
        verification_notes,
        submitted_at,
        verified_at,
        unit:education_units(name, unit_code, slug),
        academic_year:academic_years(name),
        period:admission_periods(name),
        applicant:applicants(full_name, birth_date),
        status_logs:admission_status_logs(new_status, notes, created_at)
      `
      )
      .eq('registration_number', registrationNumber)
      .maybeSingle();

    if (error || !admission) {
      return NextResponse.json(
        { error: 'Data pendaftaran tidak ditemukan atau tanggal lahir tidak sesuai.' },
        { status: 404 }
      );
    }

    const applicant = Array.isArray(admission.applicant)
      ? admission.applicant[0]
      : admission.applicant;

    if (!applicant || applicant.birth_date !== birthDate) {
      return NextResponse.json(
        { error: 'Data pendaftaran tidak ditemukan atau tanggal lahir tidak sesuai.' },
        { status: 404 }
      );
    }

    const unit = Array.isArray(admission.unit) ? admission.unit[0] : admission.unit;
    const academicYear = Array.isArray(admission.academic_year)
      ? admission.academic_year[0]
      : admission.academic_year;
    const period = Array.isArray(admission.period) ? admission.period[0] : admission.period;

    // Hanya kembalikan informasi non-sensitif (tanpa alamat, NIK, no HP, atau file pribadi)
    return NextResponse.json({
      success: true,
      data: {
        registrationNumber: admission.registration_number,
        applicantMaskedName: maskName(applicant.full_name),
        unitName: unit?.name ?? '-',
        unitSlug: unit?.slug ?? 'ra',
        academicYear: academicYear?.name ?? '-',
        periodName: period?.name ?? '-',
        status: admission.status,
        verificationNotes: admission.verification_notes ?? '',
        submittedAt: admission.submitted_at,
        verifiedAt: admission.verified_at,
        statusLogs: Array.isArray(admission.status_logs)
          ? [...admission.status_logs].sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
          : [],
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memeriksa status pendaftaran.' },
      { status: 500 }
    );
  }
}
