import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export function isSupabaseServerConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      anonKey &&
      url.startsWith('https://') &&
      !url.includes('your-project-ref') &&
      !anonKey.includes('your-supabase-anon-key')
  );
}

export function isSupabaseAdminConfigured(): boolean {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(
    isSupabaseServerConfigured() &&
      serviceKey &&
      !serviceKey.includes('your-supabase-service-role-key')
  );
}

export function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Konfigurasi NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY belum lengkap.');
  }

  const cookieStore = cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Diabaikan saat dipanggil dari Server Component read-only
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // Diabaikan saat dipanggil dari Server Component read-only
        }
      },
    },
  });
}

/**
 * Server-only Admin Client menggunakan SUPABASE_SERVICE_ROLE_KEY.
 * JANGAN PERNAH diimpor di komponen 'use client'.
 */
export function createAdminSupabaseClient() {
  if (typeof window !== 'undefined') {
    throw new Error('createAdminSupabaseClient tidak boleh dijalankan di browser!');
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey || serviceKey.includes('your-supabase-service-role-key')) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di server.');
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
