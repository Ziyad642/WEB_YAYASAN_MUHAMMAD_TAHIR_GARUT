import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createApplicantAccount } from '@/lib/auth/applicant-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const fullName = String(body.full_name || body.fullName || '').trim();
    const phone = String(body.phone || '').trim();
    const email = body.email ? String(body.email).trim() : undefined;
    const password = String(body.password || '').trim();

    if (!fullName || fullName.length < 3) {
      return NextResponse.json({ error: 'Nama lengkap minimal 3 karakter.' }, { status: 400 });
    }
    if (!phone || phone.length < 9) {
      return NextResponse.json({ error: 'Nomor WhatsApp/HP minimal 9 digit.' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Kata sandi minimal 6 karakter.' }, { status: 400 });
    }

    const result = createApplicantAccount({
      full_name: fullName,
      phone,
      email,
      password,
    });

    if (!result.success || !result.account) {
      return NextResponse.json({ error: result.error || 'Gagal mendaftar akun.' }, { status: 400 });
    }

    const cookieStore = cookies();
    cookieStore.set('applicant_session', result.account.id, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 hari
    });

    return NextResponse.json({
      success: true,
      applicant: {
        id: result.account.id,
        full_name: result.account.full_name,
        phone: result.account.phone,
        email: result.account.email,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
