import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PublicShell } from '@/components/layout/PublicShell';
import { ApplicantDashboardClient } from '@/components/ppdb/ApplicantDashboardClient';
import {
  getApplicantAdmissions,
  getServerApplicant,
} from '@/lib/auth/applicant-store';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Riwayat Pendaftaran Santri / Siswa',
  description: 'Portal Riwayat Pendaftaran PPDB Yayasan Muhammad Tahir Garut.',
};

export default async function ApplicantRiwayatPage() {
  const applicant = await getServerApplicant();
  if (!applicant) {
    redirect('/ppdb/masuk?redirect=/ppdb/riwayat');
  }

  const admissions = getApplicantAdmissions(applicant);

  return (
    <PublicShell>
      <section className="bg-navy-deep py-10 text-white sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-wider text-gold">Portal Pendaftar</p>
          <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
            Dashboard & Riwayat Pendaftaran Siswa
          </h1>
          <p className="mt-2 max-w-2xl text-xs text-white/80 sm:text-sm">
            Pantau status verifikasi, hasil seleksi, catatan panitia, dan cetak bukti pendaftaran santri Anda di sini.
          </p>
        </div>
      </section>

      <section className="bg-softgray py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ApplicantDashboardClient applicant={applicant} admissions={admissions} />
        </div>
      </section>
    </PublicShell>
  );
}
