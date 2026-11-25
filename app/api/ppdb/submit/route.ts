import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { submitPpdbApplication, type UploadedDocFile } from '@/lib/services/ppdb-service';
import { ppdbSubmissionSchema } from '@/lib/validations/ppdb';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`ppdb-submit:${ip}`, 8, 15 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: `Terlalu banyak percobaan pendaftaran. Silakan coba lagi dalam ${rate.resetInSeconds} detik.`,
      },
      { status: 429 }
    );
  }

  try {
    const applicantUserId = request.cookies.get('applicant_session')?.value;
    const formData = await request.formData();
    const rawPayload = formData.get('payload');

    if (typeof rawPayload !== 'string') {
      return NextResponse.json(
        { error: 'Format pengiriman formulir tidak valid.' },
        { status: 400 }
      );
    }

    const parsedJson = JSON.parse(rawPayload);
    const validated = ppdbSubmissionSchema.safeParse(parsedJson);

    if (!validated.success) {
      const firstIssue = validated.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message ?? 'Data formulir belum lengkap atau tidak valid.' },
        { status: 400 }
      );
    }

    const files: UploadedDocFile[] = [];
    for (const [key, value] of Array.from(formData.entries())) {
      if (key.startsWith('doc_') && value instanceof File && value.size > 0) {
        const docKey = key.replace(/^doc_/, '');
        const docLabel = String(formData.get(`label_${docKey}`) || docKey);
        files.push({ key: docKey, label: docLabel, file: value });
      }
    }

    const result = await submitPpdbApplication(validated.data, files, applicantUserId);
    revalidatePath('/ppdb/riwayat');
    revalidatePath('/admin/dashboard');

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses pendaftaran.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
