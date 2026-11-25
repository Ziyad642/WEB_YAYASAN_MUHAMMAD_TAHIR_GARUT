import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PublicShell } from '@/components/layout/PublicShell';
import { ApplicantAuthClient } from '@/components/ppdb/ApplicantAuthClient';
import { getServerApplicant } from '@/lib/auth/applicant-store';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Masuk / Daftar Akun Wali Santri',
  description: 'Portal akun Wali Santri untuk pendaftaran dan riwayat PPDB Yayasan Muhammad Tahir Garut.',
};

export default async function ApplicantAuthPage() {
  const applicant = await getServerApplicant();
  if (applicant) {
    redirect('/ppdb/riwayat');
  }

  return (
    <PublicShell>
      <section className="bg-navy-deep py-10 text-white sm:py-14">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-wider text-gold">Portal Pendaftaran PPDB</p>
          <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
            Akun Wali Santri & Riwayat Pendaftaran
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-xs text-white/80 sm:text-sm">
            Pantau seluruh data anak yang Anda daftarkan, lihat catatan verifikasi panitia, serta cetak bukti pendaftaran kapan saja.
          </p>
        </div>
      </section>

      <section className="bg-softgray py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ApplicantAuthClient />
        </div>
      </section>
    </PublicShell>
  );
}
