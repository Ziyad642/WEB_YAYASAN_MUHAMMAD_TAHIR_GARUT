import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AdminLoginForm } from '@/components/dashboard/AdminLoginForm';
import { getServerAuthProfile } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Login Admin',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const profile = await getServerAuthProfile();
  if (profile) {
    redirect('/admin/dashboard');
  }

  return <AdminLoginForm initialError={searchParams.error} />;
}
