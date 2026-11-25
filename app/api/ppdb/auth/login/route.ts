import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { verifyApplicantCredentials } from '@/lib/auth/applicant-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const identifier = String(body.identifier || body.phone || body.email || '').trim();
    const password = String(body.password || '').trim();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Nomor WhatsApp/Email dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    const applicant = verifyApplicantCredentials(identifier, password);
    if (!applicant) {
      return NextResponse.json(
        { error: 'Nomor WhatsApp/Email atau kata sandi tidak cocok.' },
        { status: 401 }
      );
    }

    const cookieStore = cookies();
    cookieStore.set('applicant_session', applicant.id, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 hari
    });

    return NextResponse.json({
      success: true,
      applicant: {
        id: applicant.id,
        full_name: applicant.full_name,
        phone: applicant.phone,
        email: applicant.email,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
