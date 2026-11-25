import { NextRequest, NextResponse } from 'next/server';
import { canAccessUnit, getAllowedUnitIds, getServerAuthProfile, logAuditActivity } from '@/lib/auth/session';
import { getClientIp } from '@/lib/security/rate-limit';
import { resyncAdmissionById } from '@/lib/services/ppdb-service';
import { createAdminSupabaseClient, isSupabaseAdminConfigured } from '@/lib/supabase/server';

export async function GET() {
  const profile = await getServerAuthProfile();
  if (!profile) {
    return NextResponse.json({ error: 'Autentikasi diperlukan.' }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ logs: [] });
  }

  const admin = createAdminSupabaseClient();
  const allowedUnits = getAllowedUnitIds(profile);

  const { data, error } = await admin
    .from('google_sync_logs')
    .select('*, admission:admissions(id, unit_id, status, unit:education_units(name, unit_code))')
    .order('updated_at', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const logs = (data ?? []).filter((row) => {
    if (allowedUnits === 'ALL') return true;
    const adm = Array.isArray(row.admission) ? row.admission[0] : row.admission;
    return adm && allowedUnits.includes(adm.unit_id);
  });

  return NextResponse.json({ logs });
}

export async function POST(request: NextRequest) {
  const profile = await getServerAuthProfile();
  if (!profile) {
    return NextResponse.json({ error: 'Autentikasi diperlukan.' }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({
      success: true,
      result: { ok: true, message: 'Sinkronisasi berhasil diproses (Mode Demo/Lokal).' },
      totalAttempted: 1,
      successCount: 1,
      failedCount: 0,
    });
  }

  const body = await request.json().catch(() => ({}));
  const admissionId = typeof body.admissionId === 'string' ? body.admissionId : null;
  const admin = createAdminSupabaseClient();

  if (admissionId) {
    const { data: adm } = await admin
      .from('admissions')
      .select('id, unit_id, registration_number')
      .eq('id', admissionId)
      .single();

    if (!adm) {
      return NextResponse.json({ error: 'Data pendaftaran tidak ditemukan.' }, { status: 404 });
    }
    if (!canAccessUnit(profile, adm.unit_id)) {
      return NextResponse.json({ error: 'Akses ditolak untuk unit ini.' }, { status: 403 });
    }

    const result = await resyncAdmissionById(admissionId);
    await logAuditActivity({
      actorId: profile.id,
      actorEmail: profile.email,
      action: 'MANUAL_GOOGLE_SYNC',
      entityType: 'google_sync_logs',
      entityId: admissionId,
      unitId: adm.unit_id,
      details: { registration_number: adm.registration_number, ok: result.ok, error: result.error },
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ success: result.ok, result });
  }

  // Batch retry untuk semua antrean yang statusnya failed atau pending (sesuai hak akses unit)
  const allowedUnits = getAllowedUnitIds(profile);
  const { data: pendingRows } = await admin
    .from('google_sync_logs')
    .select('admission_id, admission:admissions(unit_id)')
    .in('sync_status', ['failed', 'pending'])
    .limit(30);

  const targets = (pendingRows ?? []).filter((row) => {
    if (allowedUnits === 'ALL') return true;
    const adm = Array.isArray(row.admission) ? row.admission[0] : row.admission;
    return adm && allowedUnits.includes(adm.unit_id);
  });

  let successCount = 0;
  let failedCount = 0;

  for (const row of targets) {
    const res = await resyncAdmissionById(row.admission_id).catch(() => ({ ok: false }));
    if (res.ok) successCount += 1;
    else failedCount += 1;
  }

  await logAuditActivity({
    actorId: profile.id,
    actorEmail: profile.email,
    action: 'BATCH_RETRY_GOOGLE_SYNC',
    entityType: 'google_sync_logs',
    details: { totalAttempted: targets.length, successCount, failedCount },
    ipAddress: getClientIp(request),
  });

  return NextResponse.json({
    success: true,
    totalAttempted: targets.length,
    successCount,
    failedCount,
  });
}
