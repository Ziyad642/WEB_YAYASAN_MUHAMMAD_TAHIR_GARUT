import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { canManageUnitContent, getServerAuthProfile, logAuditActivity } from '@/lib/auth/session';
import { getClientIp } from '@/lib/security/rate-limit';
import {
  getStoredEducationUnits,
  getStoredEvents,
  getStoredFoundationSettings,
  getStoredGalleries,
  getStoredNews,
  getStoredTeachers,
  saveStoredEvents,
  saveStoredGalleries,
  saveStoredNews,
  saveStoredTeachers,
  updateStoredEducationUnit,
  updateStoredFoundationSettings,
} from '@/lib/services/cms-store';
import { createAdminSupabaseClient, isSupabaseAdminConfigured } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';
import {
  educationUnitUpdateSchema,
  eventSchema,
  foundationSettingsUpdateSchema,
  gallerySchema,
  newsSchema,
  teacherSchema,
} from '@/lib/validations/cms';

export async function POST(request: NextRequest) {
  const profile = await getServerAuthProfile();
  if (!profile) {
    return NextResponse.json({ error: 'Autentikasi diperlukan.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.resource !== 'string' || typeof body.action !== 'string') {
    return NextResponse.json({ error: 'Permintaan CMS tidak valid.' }, { status: 400 });
  }

  const { resource, action, id, payload } = body as {
    resource: string;
    action: 'create' | 'update' | 'delete';
    id?: string;
    payload?: Record<string, unknown>;
  };

  // =========================================================================
  // PERSISTENCE UNTUK LOCAL / HYBRID STORAGE (JIKA SUPABASE BELUM DISETEL)
  // =========================================================================
  if (!isSupabaseAdminConfigured()) {
    try {
      // 1. Pengaturan Yayasan
      if (resource === 'foundation_settings' && action === 'update') {
        if (profile.role !== 'super_admin') {
          return NextResponse.json({ error: 'Khusus Super Admin Yayasan.' }, { status: 403 });
        }
        const parsed = foundationSettingsUpdateSchema.safeParse(payload);
        if (!parsed.success) {
          return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? 'Data pengaturan tidak valid.' },
            { status: 400 }
          );
        }
        const updated = updateStoredFoundationSettings(parsed.data);
        revalidatePath('/');
        revalidatePath('/tentang');
        revalidatePath('/kontak');
        revalidatePath('/admin/dashboard');
        return NextResponse.json({
          success: true,
          data: updated,
          message: 'Pengaturan yayasan berhasil disimpan permanen.',
        });
      }

      // 2. Unit Pendidikan
      if (resource === 'education_units' && action === 'update' && id) {
        if (!canManageUnitContent(profile, id)) {
          return NextResponse.json(
            { error: 'Anda tidak berwenang mengubah profil unit ini.' },
            { status: 403 }
          );
        }
        const parsed = educationUnitUpdateSchema.safeParse(payload);
        if (!parsed.success) {
          return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? 'Data unit tidak valid.' },
            { status: 400 }
          );
        }
        const updated = updateStoredEducationUnit(id, parsed.data);
        revalidatePath('/');
        revalidatePath('/admin/dashboard');
        return NextResponse.json({
          success: true,
          data: updated,
          message: 'Data profil unit berhasil diperbarui permanen.',
        });
      }

      // 3. Berita
      if (resource === 'news') {
        const currentNews = getStoredNews();
        if (action === 'delete' && id) {
          saveStoredNews(currentNews.filter((n) => n.id !== id));
          revalidatePath('/');
          revalidatePath('/berita');
          revalidatePath('/admin/dashboard');
          return NextResponse.json({ success: true, message: 'Berita berhasil dihapus.' });
        }
        const parsed = newsSchema.safeParse(payload);
        if (!parsed.success) {
          return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? 'Data berita tidak valid.' },
            { status: 400 }
          );
        }
        if (action === 'create') {
          const newItem = {
            ...parsed.data,
            id: `news-${Date.now()}`,
            slug: parsed.data.slug ? slugify(parsed.data.slug) : `${slugify(parsed.data.title)}-${Date.now().toString(36)}`,
            author_id: profile.id,
            published_at: new Date().toISOString(),
          };
          saveStoredNews([newItem as any, ...currentNews]);
          revalidatePath('/');
          revalidatePath('/berita');
          revalidatePath('/admin/dashboard');
          return NextResponse.json({ success: true, id: newItem.id });
        }
        if (action === 'update' && id) {
          const index = currentNews.findIndex((n) => n.id === id);
          if (index !== -1) {
            currentNews[index] = { ...currentNews[index], ...parsed.data };
            saveStoredNews(currentNews);
          }
          revalidatePath('/');
          revalidatePath('/berita');
          revalidatePath('/admin/dashboard');
          return NextResponse.json({ success: true });
        }
      }

      // 4. Agenda / Acara
      if (resource === 'events') {
        const currentEvents = getStoredEvents();
        if (action === 'delete' && id) {
          saveStoredEvents(currentEvents.filter((e) => e.id !== id));
          revalidatePath('/');
          revalidatePath('/agenda');
          revalidatePath('/admin/dashboard');
          return NextResponse.json({ success: true });
        }
        const parsed = eventSchema.safeParse(payload);
        if (!parsed.success) {
          return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? 'Data agenda tidak valid.' },
            { status: 400 }
          );
        }
        if (action === 'create') {
          const newItem = {
            ...parsed.data,
            id: `evt-${Date.now()}`,
            created_by: profile.id,
          };
          saveStoredEvents([...currentEvents, newItem as any]);
          revalidatePath('/');
          revalidatePath('/agenda');
          revalidatePath('/admin/dashboard');
          return NextResponse.json({ success: true, id: newItem.id });
        }
      }

      // 5. Galeri Foto
      if (resource === 'galleries') {
        const currentGalleries = getStoredGalleries();
        if (action === 'delete' && id) {
          saveStoredGalleries(currentGalleries.filter((g) => g.id !== id));
          revalidatePath('/');
          revalidatePath('/galeri');
          revalidatePath('/admin/dashboard');
          return NextResponse.json({ success: true });
        }
        const parsed = gallerySchema.safeParse(payload);
        if (!parsed.success) {
          return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? 'Data galeri tidak valid.' },
            { status: 400 }
          );
        }
        if (action === 'create') {
          const newItem = {
            ...parsed.data,
            id: `gal-${Date.now()}`,
            created_by: profile.id,
          };
          saveStoredGalleries([newItem as any, ...currentGalleries]);
          revalidatePath('/');
          revalidatePath('/galeri');
          revalidatePath('/admin/dashboard');
          return NextResponse.json({ success: true, id: newItem.id });
        }
      }

      // 6. Tenaga Pendidik / Guru
      if (resource === 'teachers') {
        const currentTeachers = getStoredTeachers();
        if (action === 'delete' && id) {
          saveStoredTeachers(currentTeachers.filter((t) => t.id !== id));
          revalidatePath('/');
          revalidatePath('/admin/dashboard');
          return NextResponse.json({ success: true });
        }
        const parsed = teacherSchema.safeParse(payload);
        if (!parsed.success) {
          return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? 'Data guru tidak valid.' },
            { status: 400 }
          );
        }
        if (action === 'create') {
          const newItem = {
            ...parsed.data,
            id: `tch-${Date.now()}`,
          };
          saveStoredTeachers([...currentTeachers, newItem as any]);
          revalidatePath('/');
          revalidatePath('/admin/dashboard');
          return NextResponse.json({ success: true, id: newItem.id });
        }
      }

      return NextResponse.json({
        success: true,
        message: `Operasi ${resource} (${action}) berhasil disimpan.`,
      });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Gagal menyimpan perubahan.' },
        { status: 500 }
      );
    }
  }

  // =========================================================================
  // SUPABASE ADMIN MODE (PRODUCTION DENGAN SUPABASE AKTIF)
  // =========================================================================
  const admin = createAdminSupabaseClient();
  const ip = getClientIp(request);

  try {
    // 1. Pengaturan Yayasan (khusus Super Admin)
    if (resource === 'foundation_settings' && action === 'update') {
      if (profile.role !== 'super_admin') {
        return NextResponse.json({ error: 'Khusus Super Admin Yayasan.' }, { status: 403 });
      }
      const parsed = foundationSettingsUpdateSchema.safeParse(payload);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Data tidak valid.' }, { status: 400 });
      }
      const { data: existing } = await admin.from('foundation_settings').select('id').limit(1).maybeSingle();
      if (existing) {
        await admin.from('foundation_settings').update(parsed.data).eq('id', existing.id);
      } else {
        await admin.from('foundation_settings').insert(parsed.data);
      }
      // Sync also to local persistent store and revalidate paths
      updateStoredFoundationSettings(parsed.data);
      revalidatePath('/');
      revalidatePath('/tentang');
      revalidatePath('/kontak');
      revalidatePath('/admin/dashboard');

      await logAuditActivity({
        actorId: profile.id,
        actorEmail: profile.email,
        action: 'UPDATE_FOUNDATION_SETTINGS',
        entityType: 'foundation_settings',
        entityId: existing?.id,
        ipAddress: ip,
      });
      return NextResponse.json({ success: true });
    }

    // 2. Unit Pendidikan (Super Admin atau Admin Unit yang ditugaskan)
    if (resource === 'education_units' && action === 'update' && id) {
      if (!canManageUnitContent(profile, id)) {
        return NextResponse.json({ error: 'Anda tidak berwenang mengubah profil unit ini.' }, { status: 403 });
      }
      const parsed = educationUnitUpdateSchema.safeParse(payload);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Data unit tidak valid.' }, { status: 400 });
      }
      const { error } = await admin.from('education_units').update(parsed.data).eq('id', id);
      if (error) throw new Error(error.message);

      updateStoredEducationUnit(id, parsed.data);
      revalidatePath('/');
      revalidatePath('/admin/dashboard');

      await logAuditActivity({
        actorId: profile.id,
        actorEmail: profile.email,
        action: 'UPDATE_EDUCATION_UNIT',
        entityType: 'education_units',
        entityId: id,
        unitId: id,
        ipAddress: ip,
      });
      return NextResponse.json({ success: true });
    }

    // 3. Berita
    if (resource === 'news') {
      if (action === 'delete' && id) {
        const { data: target } = await admin.from('news').select('unit_id, title').eq('id', id).single();
        if (!target) return NextResponse.json({ error: 'Berita tidak ditemukan.' }, { status: 404 });
        if (!canManageUnitContent(profile, target.unit_id)) {
          return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
        }
        await admin.from('news').delete().eq('id', id);
        await logAuditActivity({
          actorId: profile.id,
          actorEmail: profile.email,
          action: 'DELETE_NEWS',
          entityType: 'news',
          entityId: id,
          unitId: target.unit_id,
          details: { title: target.title },
          ipAddress: ip,
        });
        return NextResponse.json({ success: true });
      }

      const parsed = newsSchema.safeParse(payload);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Data berita tidak valid.' }, { status: 400 });
      }
      const unitId = parsed.data.unit_id ?? null;
      if (!canManageUnitContent(profile, unitId)) {
        return NextResponse.json({ error: 'Anda tidak berwenang mengelola berita pada lingkup ini.' }, { status: 403 });
      }

      const finalSlug = parsed.data.slug ? slugify(parsed.data.slug) : `${slugify(parsed.data.title)}-${Date.now().toString(36)}`;
      if (action === 'create') {
        const { data, error } = await admin
          .from('news')
          .insert({
            ...parsed.data,
            slug: finalSlug,
            author_id: profile.id,
            published_at: new Date().toISOString(),
          })
          .select('id')
          .single();
        if (error) throw new Error(error.message);
        await logAuditActivity({
          actorId: profile.id,
          actorEmail: profile.email,
          action: 'CREATE_NEWS',
          entityType: 'news',
          entityId: data.id,
          unitId,
          details: { title: parsed.data.title },
          ipAddress: ip,
        });
        return NextResponse.json({ success: true, id: data.id });
      }
      if (action === 'update' && id) {
        const { error } = await admin.from('news').update(parsed.data).eq('id', id);
        if (error) throw new Error(error.message);
        return NextResponse.json({ success: true });
      }
    }

    // 4. Galeri
    if (resource === 'galleries') {
      if (action === 'delete' && id) {
        const { data: target } = await admin.from('galleries').select('unit_id, title').eq('id', id).single();
        if (!target) return NextResponse.json({ error: 'Album tidak ditemukan.' }, { status: 404 });
        if (!canManageUnitContent(profile, target.unit_id)) {
          return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
        }
        await admin.from('galleries').delete().eq('id', id);
        return NextResponse.json({ success: true });
      }

      const parsed = gallerySchema.safeParse(payload);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Data galeri tidak valid.' }, { status: 400 });
      }
      const unitId = parsed.data.unit_id ?? null;
      if (!canManageUnitContent(profile, unitId)) {
        return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
      }

      if (action === 'create') {
        const { items, ...albumData } = parsed.data;
        const { data: created, error } = await admin
          .from('galleries')
          .insert({
            ...albumData,
            slug: `${slugify(albumData.title)}-${Date.now().toString(36)}`,
            created_by: profile.id,
          })
          .select('id')
          .single();
        if (error) throw new Error(error.message);

        if (items.length > 0) {
          await admin.from('gallery_items').insert(
            items.map((item, idx) => ({
              gallery_id: created.id,
              media_type: item.media_type,
              media_url: item.media_url,
              caption: item.caption ?? '',
              display_order: idx + 1,
            }))
          );
        }
        return NextResponse.json({ success: true, id: created.id });
      }
    }

    // 5. Agenda Kegiatan
    if (resource === 'events') {
      if (action === 'delete' && id) {
        const { data: target } = await admin.from('events').select('unit_id').eq('id', id).single();
        if (!target || !canManageUnitContent(profile, target.unit_id)) {
          return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
        }
        await admin.from('events').delete().eq('id', id);
        return NextResponse.json({ success: true });
      }
      const parsed = eventSchema.safeParse(payload);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Data agenda tidak valid.' }, { status: 400 });
      }
      const unitId = parsed.data.unit_id ?? null;
      if (!canManageUnitContent(profile, unitId)) {
        return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
      }
      if (action === 'create') {
        const { error } = await admin.from('events').insert({ ...parsed.data, created_by: profile.id });
        if (error) throw new Error(error.message);
        return NextResponse.json({ success: true });
      }
    }

    // 6. Tenaga Pendidik
    if (resource === 'teachers') {
      if (action === 'delete' && id) {
        const { data: target } = await admin.from('teachers').select('unit_id').eq('id', id).single();
        if (!target || !canManageUnitContent(profile, target.unit_id)) {
          return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
        }
        await admin.from('teachers').delete().eq('id', id);
        return NextResponse.json({ success: true });
      }
      const parsed = teacherSchema.safeParse(payload);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Data guru tidak valid.' }, { status: 400 });
      }
      if (!canManageUnitContent(profile, parsed.data.unit_id)) {
        return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
      }
      if (action === 'create') {
        const { error } = await admin.from('teachers').insert(parsed.data);
        if (error) throw new Error(error.message);
        return NextResponse.json({ success: true });
      }
    }

    // 7. Tahun Ajaran & Gelombang PPDB (Super Admin atau Admin Unit untuk gelombang unitnya)
    if (resource === 'academic_years') {
      if (profile.role !== 'super_admin') {
        return NextResponse.json({ error: 'Khusus Super Admin Yayasan.' }, { status: 403 });
      }
      if (action === 'create' && payload) {
        const { error } = await admin.from('academic_years').insert({
          name: String(payload.name),
          start_year: Number(payload.start_year),
          end_year: Number(payload.end_year),
          is_active: Boolean(payload.is_active),
        });
        if (error) throw new Error(error.message);
        return NextResponse.json({ success: true });
      }
    }

    if (resource === 'admission_periods') {
      if (action === 'update' && id && payload) {
        const { data: target } = await admin.from('admission_periods').select('unit_id').eq('id', id).single();
        if (!target || !canManageUnitContent(profile, target.unit_id)) {
          return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
        }
        const { error } = await admin
          .from('admission_periods')
          .update({ is_open: Boolean(payload.is_open), quota: Number(payload.quota || 60) })
          .eq('id', id);
        if (error) throw new Error(error.message);
        return NextResponse.json({ success: true });
      }
      if (action === 'create' && payload) {
        const unitId = String(payload.unit_id);
        if (!canManageUnitContent(profile, unitId)) {
          return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
        }
        const { error } = await admin.from('admission_periods').insert({
          academic_year_id: String(payload.academic_year_id),
          unit_id: unitId,
          name: String(payload.name),
          start_date: String(payload.start_date),
          end_date: String(payload.end_date),
          quota: Number(payload.quota || 60),
          is_open: Boolean(payload.is_open ?? true),
          notes: String(payload.notes ?? ''),
        });
        if (error) throw new Error(error.message);
        return NextResponse.json({ success: true });
      }
    }

    // 8. Manajemen Pengguna Admin (Khusus Super Admin)
    if (resource === 'users') {
      if (profile.role !== 'super_admin') {
        return NextResponse.json({ error: 'Khusus Super Admin Yayasan.' }, { status: 403 });
      }
      if (action === 'create' && payload) {
        const email = String(payload.email).trim().toLowerCase();
        const password = String(payload.password);
        const fullName = String(payload.full_name).trim();
        const roleCode = String(payload.role_code);
        const unitIds = Array.isArray(payload.unit_ids) ? (payload.unit_ids as string[]) : [];

        if (!email || password.length < 8 || !fullName) {
          return NextResponse.json({ error: 'Nama, email, dan password (min 8 karakter) wajib diisi.' }, { status: 400 });
        }

        const { data: roleRow } = await admin.from('roles').select('id').eq('code', roleCode).single();
        if (!roleRow) return NextResponse.json({ error: 'Role tidak ditemukan.' }, { status: 400 });

        const { data: createdUser, error: authErr } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName },
        });

        if (authErr || !createdUser.user) {
          return NextResponse.json({ error: authErr?.message ?? 'Gagal membuat akun.' }, { status: 400 });
        }

        await admin.from('profiles').insert({
          id: createdUser.user.id,
          full_name: fullName,
          email,
          role_id: roleRow.id,
          is_active: true,
        });

        if (roleCode !== 'super_admin' && unitIds.length > 0) {
          await admin.from('user_unit_access').insert(
            unitIds.map((uId) => ({
              user_id: createdUser.user.id,
              unit_id: uId,
              can_manage_content: roleCode === 'admin_unit',
              can_verify_ppdb: true,
            }))
          );
        }

        await logAuditActivity({
          actorId: profile.id,
          actorEmail: profile.email,
          action: 'CREATE_ADMIN_USER',
          entityType: 'profiles',
          entityId: createdUser.user.id,
          details: { email, roleCode, unitIds },
          ipAddress: ip,
        });

        return NextResponse.json({ success: true, id: createdUser.user.id });
      }
    }

    return NextResponse.json({ error: 'Operasi CMS tidak dikenali.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Gagal memproses operasi CMS.' },
      { status: 500 }
    );
  }
}
