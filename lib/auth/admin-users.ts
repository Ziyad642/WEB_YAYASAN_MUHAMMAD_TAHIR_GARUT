import {
  type AdminUserAccount,
  OFFICIAL_ADMIN_ACCOUNTS,
} from '@/lib/auth/admin-account-constants';
import { readDataJson, writeDataJson } from '@/lib/storage/data-storage';
import type { AuthSessionProfile } from '@/types/database';

export type { AdminUserAccount };
export { OFFICIAL_ADMIN_ACCOUNTS };

const ADMIN_USERS_FILE = 'admin-users.json';

export function getStoredAdminUsers(): AdminUserAccount[] {
  return readDataJson<AdminUserAccount[]>(ADMIN_USERS_FILE, OFFICIAL_ADMIN_ACCOUNTS);
}

export function saveStoredAdminUsers(users: AdminUserAccount[]): void {
  writeDataJson(ADMIN_USERS_FILE, users);
}

export function createStoredAdminUser(
  user: Omit<AdminUserAccount, 'id'>
): AdminUserAccount {
  const users = getStoredAdminUsers();
  const newUser: AdminUserAccount = {
    ...user,
    id: `user-${Date.now()}`,
  };
  users.push(newUser);
  saveStoredAdminUsers(users);
  return newUser;
}

export function updateStoredAdminUser(
  id: string,
  patch: Partial<AdminUserAccount>
): AdminUserAccount | null {
  const users = getStoredAdminUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;

  users[index] = {
    ...users[index],
    ...patch,
  };
  saveStoredAdminUsers(users);
  return users[index];
}

export function deleteStoredAdminUser(id: string): boolean {
  const users = getStoredAdminUsers();
  // Tidak boleh menghapus Ketua Yayasan pusat
  const target = users.find((u) => u.id === id);
  if (target?.username === 'ketuayayasan') {
    return false;
  }
  const filtered = users.filter((u) => u.id !== id);
  if (filtered.length === users.length) return false;
  saveStoredAdminUsers(filtered);
  return true;
}

export function findAdminUser(identifier: string): AdminUserAccount | null {
  const clean = identifier.trim().toLowerCase();
  const users = getStoredAdminUsers();
  return (
    users.find(
      (acc) => acc.username.toLowerCase() === clean || acc.email.toLowerCase() === clean
    ) || null
  );
}

export function findAdminUserById(id: string): AdminUserAccount | null {
  const users = getStoredAdminUsers();
  return users.find((acc) => acc.id === id) || null;
}

export function verifyAdminCredentials(
  identifier: string,
  password: string
): AuthSessionProfile | null {
  const user = findAdminUser(identifier);
  if (!user) return null;
  if (user.password !== password) return null;
  if (!user.is_active) return null;

  return toAuthSessionProfile(user);
}

export function toAuthSessionProfile(user: AdminUserAccount): AuthSessionProfile {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    role_name: user.role_name,
    is_active: user.is_active,
    unit_access: user.unit_access,
  };
}
