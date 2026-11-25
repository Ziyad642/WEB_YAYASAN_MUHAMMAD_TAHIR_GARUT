import { ArrowRight, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicShell } from '@/components/layout/PublicShell';
import { getEducationUnits, getFoundationSettings } from '@/lib/data/public-repository';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Kontak Yayasan',
  description: 'Hubungi Yayasan Muhammad Tahir Garut atau sekretariat PPDB unit R.A., MI, dan SMP.',
};

export default async function KontakPage() {
  const [settings, units] = await Promise.all([
    getFoundationSettings(),
    getEducationUnits(),
  ]);

  const waClean = settings.whatsapp.replace(/[^0-9]/g, '');

  return (
    <PublicShell>
      <section className="bg-navy-deep py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-wider text-gold">Hubungi Kami</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Kontak {settings.foundation_name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/80 sm:text-base">
            Layanan informasi yayasan, kunjungan sekolah, dan konsultasi PPDB online.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-3xl border border-navy/10 bg-white p-6 shadow-card sm:p-8">
              <h2 className="text-xl font-extrabold text-navy-deep">Informasi Kontak Resmi</h2>
              <div className="mt-5 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-soft text-navy">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">Alamat Yayasan</p>
                    <p className="mt-0.5 font-semibold text-navy-deep">{settings.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-soft text-navy">
                    <Phone className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">Telepon</p>
                    <p className="mt-0.5 font-semibold text-navy-deep">{settings.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-soft text-navy">
                    <Mail className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">Email</p>
                    <p className="mt-0.5 font-semibold text-navy-deep">{settings.email}</p>
                  </div>
                </div>
              </div>

              {waClean && (
                <a
                  href={`https://wa.me/${waClean}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Hubungi via WhatsApp</span>
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl border border-navy/10 bg-white p-6 shadow-card sm:p-8">
              <h2 className="text-xl font-extrabold text-navy-deep">Kontak Masing-Masing Unit</h2>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {units.map((u) => (
                  <div key={u.id} className="rounded-2xl bg-softgray p-4">
                    <p className="text-sm font-extrabold text-navy-deep">{u.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{u.contact_phone || settings.phone}</p>
                    <p className="mt-0.5 break-all text-xs text-slate-500">
                      {u.contact_email || settings.email}
                    </p>
                    <Link
                      href={`/unit-pendidikan/${u.slug}`}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-navy hover:text-gold-dark"
                    >
                      <span>Profil Unit</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-navy-deep p-6 text-white shadow-navy sm:p-8">
              <h2 className="text-xl font-extrabold">Ingin Mendaftarkan Putra-Putri Anda?</h2>
              <p className="mt-2 text-sm text-white/80">
                Pendaftaran PPDB dilakukan secara terpusat secara online, cepat, dan transparan.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/ppdb"
                  className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-extrabold text-navy-deep hover:bg-gold-light"
                >
                  <span>Isi Formulir PPDB</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/cek-pendaftaran"
                  className="inline-flex items-center rounded-full border border-white/25 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
                >
                  Cek Status Pendaftaran
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
