import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCredentials } from '@/lib/auth/admin-users';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const identifier = String(body.identifier || body.email || body.username || '').trim();
    const password = String(body.password || '').trim();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Username/Email dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    const profile = verifyAdminCredentials(identifier, password);
    if (!profile) {
      return NextResponse.json(
        { error: 'Username/Email atau kata sandi tidak cocok.' },
        { status: 401 }
      );
    }

    const cookieStore = cookies();
    cookieStore.set('admin_session', profile.id, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 jam
    });

    // Hapus sesi demo lama jika ada
    cookieStore.delete('demo_admin_session');

    return NextResponse.json({ success: true, profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan pada server login.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
