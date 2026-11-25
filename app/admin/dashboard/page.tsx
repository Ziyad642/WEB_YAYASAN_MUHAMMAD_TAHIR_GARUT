import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AdminDashboardShell } from '@/components/dashboard/AdminDashboardShell';
import { getServerAuthProfile } from '@/lib/auth/session';
import { getAdminDashboardData } from '@/lib/data/admin-repository';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard Admin Yayasan',
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const profile = await getServerAuthProfile();
  if (!profile) {
    redirect('/admin?error=unauthorized');
  }

  const data = await getAdminDashboardData(profile);

  return <AdminDashboardShell profile={profile} data={data} initialTab={searchParams?.tab as any} />;
}
