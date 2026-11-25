import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Fitur demo login telah dinonaktifkan. Silakan gunakan kredensial resmi pengelola.' },
    { status: 403 }
  );
}

export async function GET() {
  return NextResponse.json(
    { error: 'Endpoint demo login tidak tersedia.' },
    { status: 404 }
  );
}
