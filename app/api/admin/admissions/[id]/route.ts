import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { canVerifyUnitPpdb, getServerAuthProfile, logAuditActivity } from '@/lib/auth/session';
import { getClientIp } from '@/lib/security/rate-limit';
import { deleteLocalAdmission, getLocalAdmissions } from '@/lib/services/local-store';
import { createAdminSupabaseClient, isSupabaseAdminConfigured } from '@/lib/supabase/server';

interface RouteContext {
  params: { id: string };
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const profile = await getServerAuthProfile();
    if (!profile) {
      return NextResponse.json({ error: 'Autentikasi diperlukan.' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'ID pendaftaran tidak valid.' }, { status: 400 });
    }

    // Periksa otorisasi unit jika bukan super admin
    const allAdmissions = getLocalAdmissions();
    const target = allAdmissions.find((a) => a.id === id);
    if (target && !canVerifyUnitPpdb(profile, target.unit_id)) {
      return NextResponse.json(
        { error: 'Anda tidak berwenang mengelola atau menghapus pendaftar unit ini.' },
        { status: 403 }
      );
    }

    // 1. Hapus dari local storage
    deleteLocalAdmission(id);

    // 2. Hapus dari Supabase jika dikonfigurasi
    if (isSupabaseAdminConfigured()) {
      try {
        const admin = createAdminSupabaseClient();
        await admin.from('admissions').delete().eq('id', id);
      } catch (err) {
        console.warn('Gagal menghapus admission di Supabase:', err);
      }
    }

    // 3. Log audit
    const ip = getClientIp(request);
    await logAuditActivity({
      actorId: profile.id,
      actorEmail: profile.email,
      action: 'DELETE_ADMISSION',
      entityType: 'admissions',
      entityId: id,
      unitId: target?.unit_id,
      details: { registration_number: target?.registration_number },
      ipAddress: ip,
    });

    revalidatePath('/admin/dashboard');
    revalidatePath('/ppdb/cek-status');

    return NextResponse.json({
      success: true,
      message: 'Data pendaftar berhasil dihapus permanen.',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal menghapus pendaftar.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
