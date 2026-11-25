import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PublicShell } from '@/components/layout/PublicShell';
import { getEducationUnits, getFoundationSettings } from '@/lib/data/public-repository';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tentang Yayasan',
  description: 'Profil resmi, sejarah, visi, misi, dan struktur unit pendidikan Yayasan Muhammad Tahir Garut.',
};

export default async function TentangPage() {
  const [settings, units] = await Promise.all([
    getFoundationSettings(),
    getEducationUnits(),
  ]);

  return (
    <PublicShell>
      {/* Header Banner */}
      <section className="bg-navy-deep py-14 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-gold/20 px-3.5 py-1 text-xs font-bold text-gold-light">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Profil Lembaga</span>
              </span>
              <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl">
                Tentang {settings.foundation_name}
              </h1>
              <p className="mt-3 text-sm text-white/85 sm:text-base">
                {settings.short_description}
              </p>
            </div>
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-3xl bg-white p-2 shadow-xl">
              <Image
                src={settings.logo_url || '/logos/logo-yayasan.png'}
                alt={settings.foundation_name}
                fill
                sizes="112px"
                className="object-contain p-1"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Sejarah & Foto Lingkungan */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-card ring-1 ring-navy/10">
              <Image
                src={settings.about_image_url || '/images/campus-building.jpg'}
                alt={`Kampus ${settings.foundation_name}`}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          </div>
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-2xl font-extrabold text-navy-deep">Sejarah Singkat Yayasan</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600 sm:text-base">
              {settings.history}
            </p>
            {settings.is_placeholder_data && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                Catatan: Data profil ini masih menggunakan teks placeholder yang dapat disunting oleh Super Admin melalui Dashboard Admin.
              </div>
            )}
          </div>
        </div>

        {/* Visi & Misi */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5 rounded-3xl bg-navy-deep p-8 text-white shadow-navy">
            <p className="text-xs font-bold uppercase tracking-wider text-gold">Visi Yayasan</p>
            <h2 className="mt-3 text-xl font-extrabold leading-relaxed sm:text-2xl">
              &ldquo;{settings.vision}&rdquo;
            </h2>
          </div>

          <div className="lg:col-span-7 rounded-3xl border border-navy/10 bg-white p-8 shadow-card">
            <p className="text-xs font-bold uppercase tracking-wider text-gold-dark">Misi Yayasan</p>
            <h2 className="mt-1 text-xl font-extrabold text-navy-deep">
              Komitmen Penyelenggaraan Pendidikan
            </h2>
            <ul className="mt-5 space-y-3">
              {settings.mission.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 sm:text-base">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Unit Pendidikan */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-navy-deep">
                Tiga Jenjang Pendidikan Terpadu
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Keseluruhan unit berada dalam satu ekosistem manajemen dan mutu pendidikan yayasan.
              </p>
            </div>
            <Link
              href="/ppdb"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-extrabold text-navy-deep shadow-gold hover:bg-gold-light"
            >
              <span>Daftar PPDB Online</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            {units.map((unit) => (
              <Link
                key={unit.id}
                href={`/unit-pendidikan/${unit.slug}`}
                className="group rounded-3xl border border-navy/10 bg-white p-6 shadow-card hover:shadow-cardHover transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-navy-soft p-1">
                    <Image
                      src={unit.logo_url}
                      alt={unit.name}
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-navy-deep group-hover:text-navy">
                      {unit.name}
                    </h3>
                    <p className="text-xs font-semibold text-gold-dark">{unit.level_label}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  {unit.short_description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-navy">
                  <span>Lihat Profil Unit</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
