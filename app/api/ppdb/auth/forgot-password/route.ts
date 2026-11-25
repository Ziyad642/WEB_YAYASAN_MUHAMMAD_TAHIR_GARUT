import { NextRequest, NextResponse } from 'next/server';
import { resetApplicantPassword } from '@/lib/auth/applicant-store';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`applicant-reset:${ip}`, 5, 10 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: `Terlalu banyak permintaan reset kata sandi. Coba lagi dalam ${rate.resetInSeconds} detik.` },
      { status: 429 }
    );
  }

  try {
    const body = await request.json().catch(() => null);
    const identifier = String(body?.identifier || '').trim();
    const newPassword = String(body?.newPassword || '').trim();

    if (!identifier || !newPassword) {
      return NextResponse.json(
        { error: 'Nomor WhatsApp/Email dan kata sandi baru wajib diisi.' },
        { status: 400 }
      );
    }

    const result = resetApplicantPassword(identifier, newPassword);
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Gagal mereset kata sandi.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Kata sandi berhasil diperbarui. Silakan masuk menggunakan kata sandi baru Anda.',
    });
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan sistem.' }, { status: 500 });
  }
}
