import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthProfile } from '@/lib/auth/session';
import { createAdminSupabaseClient, isSupabaseAdminConfigured } from '@/lib/supabase/server';

const ALLOWED_PUBLIC_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
];

export async function POST(request: NextRequest) {
  const profile = await getServerAuthProfile();
  if (!profile || (profile.role !== 'super_admin' && profile.role !== 'admin_unit')) {
    return NextResponse.json({ error: 'Akses unggah media ditolak.' }, { status: 403 });
  }

  if (!isSupabaseAdminConfigured()) {
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = String(formData.get('folder') || 'cms').replace(/[^a-z0-9_-]/gi, '');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File gambar wajib dipilih.' }, { status: 400 });
    }
    if (!ALLOWED_PUBLIC_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Format gambar harus JPG, PNG, WebP, atau SVG.' }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Ukuran gambar maksimal 5MB.' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      fs.writeFileSync(path.join(uploadDir, fileName), buffer);
      const publicUrl = `/uploads/${folder}/${fileName}`;
      return NextResponse.json({ success: true, publicUrl, path: `${folder}/${fileName}` });
    } catch {
      // Fallback for read-only serverless environment (Vercel Lambda): return base64 Data URI
      const base64Data = buffer.toString('base64');
      const publicUrl = `data:${file.type};base64,${base64Data}`;
      return NextResponse.json({ success: true, publicUrl, path: `inline/${fileName}` });
    }
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const folder = String(formData.get('folder') || 'cms').replace(/[^a-z0-9_-]/gi, '');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'File gambar wajib dipilih.' }, { status: 400 });
  }
  if (!ALLOWED_PUBLIC_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Format gambar harus JPG, PNG, WebP, atau SVG.' }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Ukuran gambar maksimal 5MB.' }, { status: 400 });
  }

  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
  const storagePath = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const admin = createAdminSupabaseClient();
  const { error } = await admin.storage.from('public-assets').upload(storagePath, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: publicUrlData } = admin.storage.from('public-assets').getPublicUrl(storagePath);
  return NextResponse.json({ success: true, publicUrl: publicUrlData.publicUrl, path: storagePath });
}
