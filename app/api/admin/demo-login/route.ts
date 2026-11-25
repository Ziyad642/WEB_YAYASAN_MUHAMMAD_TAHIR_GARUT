import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { role = 'super_admin' } = await request.json();

    const cookieStore = cookies();
    cookieStore.set('demo_admin_session', role, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return NextResponse.json({ success: true, role });
  } catch {
    return NextResponse.json({ error: 'Failed to set demo session' }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = cookies();
  cookieStore.delete('demo_admin_session');
  return NextResponse.json({ success: true });
}
