import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PublicShell } from '@/components/layout/PublicShell';
import { getEducationUnits } from '@/lib/data/public-repository';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Unit Pendidikan',
  description: 'Daftar unit pendidikan di bawah Yayasan Muhammad Tahir Garut: R.A., MI, dan SMP.',
};

export default async function UnitPendidikanListPage() {
  const units = await getEducationUnits();

  return (
    <PublicShell>
      <section className="bg-navy-deep py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-wider text-gold">Ekosistem Pendidikan</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Unit Pendidikan Yayasan Muhammad Tahir Garut
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/85 sm:text-base">
            Satu yayasan dengan tiga jenjang pendidikan berkesinambungan dari usia dini hingga menengah pertama.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {units.map((unit) => (
            <div
              key={unit.id}
              className="flex flex-col overflow-hidden rounded-3xl border border-navy/10 bg-white shadow-card hover:shadow-cardHover transition-all"
            >
              <div className="relative aspect-[16/9] bg-navy-soft">
                <Image
                  src={unit.banner_image_url || '/images/campus-building.jpg'}
                  alt={unit.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/75 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-white p-1 shadow-md">
                    <Image
                      src={unit.logo_url}
                      alt={unit.name}
                      fill
                      sizes="48px"
                      className="object-contain p-0.5"
                    />
                  </div>
                  <div className="text-white">
                    <p className="text-xs font-semibold text-gold-light">{unit.level_label}</p>
                    <h2 className="text-lg font-extrabold">{unit.name}</h2>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <p className="text-sm leading-relaxed text-slate-600">{unit.short_description}</p>
                <div className="mt-6 flex flex-wrap gap-2.5 pt-2">
                  <Link
                    href={`/unit-pendidikan/${unit.slug}`}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-navy px-4 py-2.5 text-sm font-bold text-white hover:bg-navy-deep transition-colors"
                  >
                    <span>Lihat Profil</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/ppdb?unit=${unit.slug}`}
                    className="inline-flex items-center justify-center rounded-full bg-gold px-4 py-2.5 text-sm font-bold text-navy-deep hover:bg-gold-light transition-colors"
                  >
                    PPDB
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
