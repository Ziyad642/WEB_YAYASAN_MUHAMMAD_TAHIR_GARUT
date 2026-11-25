import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  cookieStore.delete('applicant_session');
  return NextResponse.json({ success: true, message: 'Berhasil keluar dari akun pendaftar.' });
}

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  cookieStore.delete('applicant_session');
  return NextResponse.redirect(new URL('/ppdb/masuk', request.url));
}
