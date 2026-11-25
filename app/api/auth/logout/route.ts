import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  cookieStore.delete('admin_session');
  cookieStore.delete('demo_admin_session');
  cookieStore.delete('applicant_session');

  // Also clear possible Supabase cookie names
  cookieStore.delete('sb-access-token');
  cookieStore.delete('sb-refresh-token');

  return NextResponse.json({ success: true, message: 'Berhasil keluar.' });
}

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  cookieStore.delete('admin_session');
  cookieStore.delete('demo_admin_session');
  cookieStore.delete('applicant_session');

  return NextResponse.redirect(new URL('/admin', request.url));
}
