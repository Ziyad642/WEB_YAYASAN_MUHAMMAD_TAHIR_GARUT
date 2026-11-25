import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { canVerifyUnitPpdb, getServerAuthProfile, logAuditActivity } from '@/lib/auth/session';
import { getClientIp } from '@/lib/security/rate-limit';
import { updateLocalAdmissionStatus } from '@/lib/services/local-store';
import { resyncAdmissionById } from '@/lib/services/ppdb-service';
import { createAdminSupabaseClient, isSupabaseAdminConfigured } from '@/lib/supabase/server';
import { ppdbStatusUpdateSchema } from '@/lib/validations/ppdb';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const profile = await getServerAuthProfile();
  if (!profile) {
    return NextResponse.json({ error: 'Autentikasi diperlukan.' }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    const body = await request.json().catch(() => null);
    const parsed = ppdbStatusUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Data status tidak valid.' },
        { status: 400 }
      );
    }
    const updated = updateLocalAdmissionStatus(
      params.id,
      parsed.data.status,
      parsed.data.verificationNotes ?? null,
      profile.full_name
    );
    if (!updated) {
      return NextResponse.json({ error: 'Data pendaftaran tidak ditemukan.' }, { status: 404 });
    }
    revalidatePath('/ppdb/riwayat');
    revalidatePath('/admin/dashboard');
    return NextResponse.json({ success: true, data: updated });
  }

  const body = await request.json().catch(() => null);
  const parsed = ppdbStatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Data status tidak valid.' },
      { status: 400 }
    );
  }

  const admin = createAdminSupabaseClient();
  const { data: existing, error: fetchErr } = await admin
    .from('admissions')
    .select('id, unit_id, status, registration_number')
    .eq('id', params.id)
    .single();

  if (fetchErr || !existing) {
    return NextResponse.json({ error: 'Data pendaftaran tidak ditemukan.' }, { status: 404 });
  }

  if (!canVerifyUnitPpdb(profile, existing.unit_id)) {
    return NextResponse.json(
      { error: 'Anda tidak memiliki hak verifikasi PPDB untuk unit pendidikan ini.' },
      { status: 403 }
    );
  }

  const { status, verificationNotes } = parsed.data;
  const now = new Date().toISOString();

  const { error: updateErr } = await admin
    .from('admissions')
    .update({
      status,
      verification_notes: verificationNotes,
      verified_by: profile.id,
      verified_at: now,
    })
    .eq('id', existing.id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  await admin.from('admission_status_logs').insert({
    admission_id: existing.id,
    previous_status: existing.status,
    new_status: status,
    notes: verificationNotes || `Status diperbarui oleh ${profile.full_name}`,
    changed_by: profile.id,
  });

  await logAuditActivity({
    actorId: profile.id,
    actorEmail: profile.email,
    action: 'UPDATE_PPDB_STATUS',
    entityType: 'admissions',
    entityId: existing.id,
    unitId: existing.unit_id,
    details: {
      registration_number: existing.registration_number,
      previous_status: existing.status,
      new_status: status,
      notes: verificationNotes,
    },
    ipAddress: getClientIp(request),
  });

  // Perbarui rekap Google Sheets secara otomatis
  const syncResult = await resyncAdmissionById(existing.id).catch(() => null);

  return NextResponse.json({
    success: true,
    status,
    syncResult,
  });
}
