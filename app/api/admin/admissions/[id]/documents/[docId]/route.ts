import { NextRequest, NextResponse } from 'next/server';
import { canAccessUnit, getServerAuthProfile, logAuditActivity } from '@/lib/auth/session';
import { getClientIp } from '@/lib/security/rate-limit';
import { getLocalAdmissions } from '@/lib/services/local-store';
import { createAdminSupabaseClient, isSupabaseAdminConfigured } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; docId: string } }
) {
  const profile = await getServerAuthProfile();
  if (!profile) {
    return NextResponse.json({ error: 'Autentikasi diperlukan.' }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    const all = getLocalAdmissions();
    const adm = all.find((a) => a.id === params.id);
    const doc = adm?.documents?.find((d) => d.id === params.docId);
    if (!doc) {
      return NextResponse.json({ error: 'Dokumen tidak ditemukan.' }, { status: 404 });
    }
    return NextResponse.json({
      signedUrl: '/sample-doc.pdf',
      fileName: doc.file_name,
    });
  }

  const admin = createAdminSupabaseClient();
  const { data: doc, error } = await admin
    .from('admission_documents')
    .select('id, file_path, file_name, mime_type, admission:admissions(id, unit_id, registration_number)')
    .eq('id', params.docId)
    .eq('admission_id', params.id)
    .single();

  if (error || !doc) {
    return NextResponse.json({ error: 'Dokumen tidak ditemukan.' }, { status: 404 });
  }

  const admission = Array.isArray(doc.admission) ? doc.admission[0] : doc.admission;
  if (!admission || !canAccessUnit(profile, admission.unit_id)) {
    return NextResponse.json(
      { error: 'Anda tidak berwenang mengakses dokumen unit ini.' },
      { status: 403 }
    );
  }

  // Signed URL berlaku 120 detik dari bucket privat ppdb-documents
  const { data: signed, error: signErr } = await admin.storage
    .from('ppdb-documents')
    .createSignedUrl(doc.file_path, 120);

  if (signErr || !signed) {
    return NextResponse.json(
      { error: `Gagal membuat Signed URL: ${signErr?.message ?? 'Storage error'}` },
      { status: 500 }
    );
  }

  await logAuditActivity({
    actorId: profile.id,
    actorEmail: profile.email,
    action: 'VIEW_PPDB_DOCUMENT',
    entityType: 'admission_documents',
    entityId: doc.id,
    unitId: admission.unit_id,
    details: { registration_number: admission.registration_number, file_name: doc.file_name },
    ipAddress: getClientIp(request),
  });

  return NextResponse.json({
    signedUrl: signed.signedUrl,
    fileName: doc.file_name,
    mimeType: doc.mime_type,
    expiresInSeconds: 120,
  });
}
