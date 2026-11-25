import type { Metadata } from 'next';
import { PublicShell } from '@/components/layout/PublicShell';
import { CheckStatusClient } from '@/components/ppdb/CheckStatusClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Cek Status Pendaftaran PPDB',
  description: 'Cek status verifikasi pendaftaran PPDB Online Yayasan Muhammad Tahir Garut.',
};

export default function CekPendaftaranPage({
  searchParams,
}: {
  searchParams: { nomor?: string };
}) {
  return (
    <PublicShell>
      <section className="bg-navy-deep py-12 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-wider text-gold">Transparansi PPDB</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Cek Status Pendaftaran
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/80 sm:text-base">
            Pantau perkembangan verifikasi berkas dan hasil seleksi PPDB secara daring.
          </p>
        </div>
      </section>

      <section className="bg-softgray py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <CheckStatusClient initialNomor={searchParams.nomor ?? ''} />
        </div>
      </section>
    </PublicShell>
  );
}
