import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { canVerifyUnitPpdb, getServerAuthProfile, logAuditActivity } from '@/lib/auth/session';
import { getClientIp } from '@/lib/security/rate-limit';
import { deleteLocalAdmissionsBatch, getLocalAdmissions } from '@/lib/services/local-store';
import { createAdminSupabaseClient, isSupabaseAdminConfigured } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const profile = await getServerAuthProfile();
    if (!profile) {
      return NextResponse.json({ error: 'Autentikasi diperlukan.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { mode, ids, unit_id, period_id, confirmationText } = body as {
      mode: 'selected' | 'by_unit' | 'by_period' | 'all';
      ids?: string[];
      unit_id?: string;
      period_id?: string;
      confirmationText?: string;
    };

    const isSuperAdmin = profile.role === 'super_admin';

    // 1. Keamanan Mode 'all' (Hapus Semua)
    if (mode === 'all') {
      if (!isSuperAdmin) {
        return NextResponse.json(
          { error: 'Hanya Ketua Yayasan (Super Admin) yang diizinkan menghapus seluruh data pendaftar.' },
          { status: 403 }
        );
      }
      if (confirmationText !== 'HAPUS SEMUA DATA PPDB') {
        return NextResponse.json(
          { error: 'Teks konfirmasi salah. Ketik "HAPUS SEMUA DATA PPDB" untuk melanjutkan.' },
          { status: 400 }
        );
      }
    }

    // 2. Keamanan Kepala Sekolah: tidak boleh menghapus data unit lain
    if (!isSuperAdmin) {
      if (mode === 'by_unit' && unit_id && !canVerifyUnitPpdb(profile, unit_id)) {
        return NextResponse.json(
          { error: 'Anda tidak berwenang mengelola atau menghapus pendaftar unit ini.' },
          { status: 403 }
        );
      }
    }

    const allAdmissions = getLocalAdmissions();
    let predicate: (a: any) => boolean;

    if (mode === 'all') {
      predicate = () => true;
    } else if (mode === 'selected' && Array.isArray(ids) && ids.length > 0) {
      if (!isSuperAdmin) {
        const invalid = allAdmissions.some(
          (a) => ids.includes(a.id) && !canVerifyUnitPpdb(profile, a.unit_id)
        );
        if (invalid) {
          return NextResponse.json(
            { error: 'Terdapat pendaftar dari unit lain yang tidak dapat Anda hapus.' },
            { status: 403 }
          );
        }
      }
      predicate = (a) => ids.includes(a.id);
    } else if (mode === 'by_unit' && unit_id) {
      predicate = (a) => a.unit_id === unit_id;
    } else if (mode === 'by_period' && period_id) {
      predicate = (a) => a.admission_period_id === period_id;
    } else {
      return NextResponse.json({ error: 'Parameter penghapusan data tidak valid.' }, { status: 400 });
    }

    const deletedCount = deleteLocalAdmissionsBatch(predicate);

    if (isSupabaseAdminConfigured()) {
      try {
        const admin = createAdminSupabaseClient();
        if (mode === 'all') {
          await admin.from('admissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        } else if (mode === 'selected' && ids && ids.length > 0) {
          await admin.from('admissions').delete().in('id', ids);
        } else if (mode === 'by_unit' && unit_id) {
          await admin.from('admissions').delete().eq('unit_id', unit_id);
        } else if (mode === 'by_period' && period_id) {
          await admin.from('admissions').delete().eq('admission_period_id', period_id);
        }
      } catch (err) {
        console.warn('Gagal batch delete Supabase admissions:', err);
      }
    }

    const ip = getClientIp(request);
    await logAuditActivity({
      actorId: profile.id,
      actorEmail: profile.email,
      action: 'BATCH_DELETE_ADMISSIONS',
      entityType: 'admissions',
      entityId: mode,
      unitId: unit_id || undefined,
      details: { mode, count: deletedCount, period_id },
      ipAddress: ip,
    });

    revalidatePath('/admin/dashboard');
    revalidatePath('/ppdb/cek-status');

    return NextResponse.json({
      success: true,
      count: deletedCount,
      message: `Sebanyak ${deletedCount} data pendaftar berhasil dihapus permanen.`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal memproses penghapusan massal.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
