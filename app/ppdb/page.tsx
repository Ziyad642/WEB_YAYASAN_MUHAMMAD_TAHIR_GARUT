import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PublicShell } from '@/components/layout/PublicShell';
import { PpdbWizard } from '@/components/ppdb/PpdbWizard';
import { getServerApplicant } from '@/lib/auth/applicant-store';
import { getPpdbOptions } from '@/lib/data/public-repository';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'PPDB Online Terpusat',
  description:
    'Pendaftaran Peserta Didik Baru (PPDB) Online Yayasan Muhammad Tahir Garut untuk unit R.A., MI, dan SMP.',
};

export default async function PpdbPage({
  searchParams,
}: {
  searchParams: { unit?: string };
}) {
  const applicant = await getServerApplicant();
  if (!applicant) {
    const unitParam = searchParams.unit ? `&unit=${encodeURIComponent(searchParams.unit)}` : '';
    redirect(`/ppdb/masuk?redirect=/ppdb${unitParam}`);
  }

  const { units, academicYears, periods } = await getPpdbOptions();

  return (
    <PublicShell>
      <section className="bg-navy-deep py-12 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gold">
                Penerimaan Peserta Didik Baru
              </p>
              <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
                PPDB Online Terpusat Yayasan Muhammad Tahir Garut
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/80 sm:text-base">
                Satu pintu pendaftaran online untuk jenjang R.A., MI, dan SMP. Lengkapi formulir bertahap di bawah ini.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/ppdb/riwayat"
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-navy-deep hover:bg-gold-light"
              >
                Dashboard Akun Saya →
              </Link>
              <Link
                href="/cek-pendaftaran"
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-gold/50 bg-white/10 px-5 py-2.5 text-sm font-bold text-gold-light hover:bg-white/20"
              >
                Cek Status
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-softgray py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PpdbWizard
            units={units}
            academicYears={academicYears}
            periods={periods}
            initialUnitSlug={searchParams.unit}
            applicant={applicant}
          />
        </div>
      </section>
    </PublicShell>
  );
}
