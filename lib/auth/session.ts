import { cookies } from 'next/headers';
import {
  findAdminUser,
  findAdminUserById,
  toAuthSessionProfile,
} from '@/lib/auth/admin-users';
import {
  createAdminSupabaseClient,
  createServerSupabaseClient,
  isSupabaseAdminConfigured,
  isSupabaseServerConfigured,
} from '@/lib/supabase/server';
import type { AuthSessionProfile, UnitCode, UnitSlug, UserRoleCode } from '@/types/database';

export async function getServerAuthProfile(overrideRole?: string): Promise<AuthSessionProfile | null> {
  // Check for authenticated admin session
  try {
    const cookieStore = cookies();
    const adminSessionId = cookieStore.get('admin_session')?.value;
    if (adminSessionId) {
      const adminUser = findAdminUserById(adminSessionId) || findAdminUser(adminSessionId);
      if (adminUser) {
        return toAuthSessionProfile(adminUser);
      }
    }

    const demoSession = overrideRole || cookieStore.get('demo_admin_session')?.value;
    if (demoSession) {
      const adminUser = findAdminUser(demoSession);
      if (adminUser) {
        return toAuthSessionProfile(adminUser);
      }
    }
  } catch {
    // Ignore cookie read error outside request context
  }

  if (!isSupabaseServerConfigured()) return null;

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const client = isSupabaseAdminConfigured() ? createAdminSupabaseClient() : supabase;

  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select(
      `
      id,
      full_name,
      email,
      phone,
      is_active,
      role:roles(code, name),
      unit_access:user_unit_access(
        unit_id,
        can_manage_content,
        can_verify_ppdb,
        unit:education_units(id, unit_code, slug, name)
      )
    `
    )
    .eq('id', user.id)
    .single();

  if (profileError || !profile || !profile.is_active) {
    return null;
  }

  const roleObj = Array.isArray(profile.role) ? profile.role[0] : profile.role;
  const roleCode = (roleObj?.code ?? 'panitia_ppdb') as UserRoleCode;
  const roleName = roleObj?.name ?? 'Staf';

  const rawAccess = Array.isArray(profile.unit_access) ? profile.unit_access : [];
  const unitAccess = rawAccess
    .map((item) => {
      const u = Array.isArray(item.unit) ? item.unit[0] : item.unit;
      if (!u) return null;
      return {
        unit_id: item.unit_id as string,
        unit_code: u.unit_code as UnitCode,
        unit_slug: u.slug as UnitSlug,
        unit_name: u.name as string,
        can_manage_content: Boolean(item.can_manage_content),
        can_verify_ppdb: Boolean(item.can_verify_ppdb),
      };
    })
    .filter((v): v is NonNullable<typeof v> => v !== null);

  return {
    id: profile.id,
    full_name: profile.full_name,
    email: profile.email,
    phone: profile.phone,
    role: roleCode,
    role_name: roleName,
    is_active: profile.is_active,
    unit_access: unitAccess,
  };
}

export function canAccessUnit(profile: AuthSessionProfile, unitId: string): boolean {
  if (profile.role === 'super_admin') return true;
  return profile.unit_access.some((ua) => ua.unit_id === unitId);
}

export function canManageUnitContent(profile: AuthSessionProfile, unitId: string | null): boolean {
  if (profile.role === 'super_admin') return true;
  if (!unitId || profile.role !== 'admin_unit') return false;
  return profile.unit_access.some((ua) => ua.unit_id === unitId && ua.can_manage_content);
}

export function canVerifyUnitPpdb(profile: AuthSessionProfile, unitId: string): boolean {
  if (profile.role === 'super_admin') return true;
  if (profile.role !== 'admin_unit' && profile.role !== 'panitia_ppdb') return false;
  return profile.unit_access.some((ua) => ua.unit_id === unitId && ua.can_verify_ppdb);
}

export function getAllowedUnitIds(profile: AuthSessionProfile): string[] | 'ALL' {
  if (profile.role === 'super_admin') return 'ALL';
  return profile.unit_access.map((ua) => ua.unit_id);
}

export async function logAuditActivity(params: {
  actorId: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  unitId?: string | null;
  details?: Record<string, unknown>;
  ipAddress?: string;
}) {
  if (!isSupabaseAdminConfigured()) return;
  try {
    const admin = createAdminSupabaseClient();
    await admin.from('audit_logs').insert({
      actor_id: params.actorId,
      actor_email: params.actorEmail,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ?? '',
      unit_id: params.unitId ?? null,
      details: params.details ?? {},
      ip_address: params.ipAddress ?? '',
    });
  } catch (err) {
    console.error('[AuditLog] Gagal mencatat aktivitas:', err);
  }
}
