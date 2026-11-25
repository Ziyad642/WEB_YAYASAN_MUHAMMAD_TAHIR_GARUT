import {
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  Compass,
  GraduationCap,
  Heart,
  Laptop,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FadeInUp } from '@/components/ui/MotionPrimitives';
import { formatDateId } from '@/lib/utils';
import type {
  EducationUnit,
  GalleryAlbum,
  NewsArticle,
  SchoolEvent,
  Teacher,
  UnitFacility,
  UnitProgram,
} from '@/types/database';

interface UnitDetailViewProps {
  unit: EducationUnit;
  programs: UnitProgram[];
  facilities: UnitFacility[];
  teachers?: Teacher[];
  news: NewsArticle[];
  galleries: GalleryAlbum[];
  events: SchoolEvent[];
}

const ICON_MAP: Record<string, typeof BookOpen> = {
  BookOpen,
  Sparkles,
  Award,
  Compass,
  Heart,
  Laptop,
};

export function UnitDetailView({
  unit,
  programs,
  facilities,
  teachers,
  news,
  galleries,
  events,
}: UnitDetailViewProps) {
  return (
    <div className="bg-white">
      {/* Unit Hero Banner */}
      <section className="relative overflow-hidden bg-navy-deep text-white">
        <div className="absolute inset-0">
          <Image
            src={unit.banner_image_url || '/images/campus-building.jpg'}
            alt={unit.name}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/90 to-navy/70" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-3xl bg-white p-2 shadow-xl ring-2 ring-gold/60">
                <Image
                  src={unit.logo_url}
                  alt={`Logo resmi ${unit.name}`}
                  fill
                  sizes="112px"
                  className="object-contain p-1"
                  priority
                />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white"
                    style={{ backgroundColor: unit.accent_color || '#102F55' }}
                  >
                    {unit.level_label}
                  </span>
                  {unit.is_logo_placeholder && (
                    <span className="inline-flex items-center rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold text-gold-light">
                      Logo Placeholder — Mudah Diganti Admin
                    </span>
                  )}
                </div>
                <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {unit.name}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-white/85 sm:text-base">
                  {unit.short_description}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                href={`/ppdb?unit=${unit.slug}`}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-extrabold text-navy-deep shadow-gold hover:bg-gold-light transition-all"
              >
                <span>Daftar PPDB {unit.unit_code}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Profil & Sejarah */}
        <FadeInUp>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-3xl border border-navy/10 bg-white p-6 shadow-card sm:p-8">
                <h2 className="text-xl font-extrabold text-navy-deep sm:text-2xl">
                  Profil & Sejarah {unit.name}
                </h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600 sm:text-base">
                  {unit.full_profile}
                </p>
                {unit.history && (
                  <div className="mt-5 rounded-2xl bg-navy-soft/70 p-4 text-sm text-navy">
                    <p className="font-bold text-navy-deep">Sejarah Singkat</p>
                    <p className="mt-1 leading-relaxed text-slate-600">{unit.history}</p>
                  </div>
                )}
              </div>

              {/* Visi & Misi */}
              <div className="rounded-3xl border border-navy/10 bg-white p-6 shadow-card sm:p-8">
                <h2 className="text-xl font-extrabold text-navy-deep">Visi & Misi</h2>
                <div className="mt-4 rounded-2xl border border-gold/30 bg-gold-soft p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-gold-dark">Visi</p>
                  <p className="mt-1.5 text-sm font-semibold leading-relaxed text-navy-deep sm:text-base">
                    {unit.vision}
                  </p>
                </div>
                <div className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-navy/60">Misi</p>
                  <ul className="mt-3 space-y-2.5">
                    {unit.mission.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Sidebar Info Unit & PPDB */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl bg-navy-deep p-6 text-white shadow-navy sm:p-8">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1 text-xs font-bold text-gold-light">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>Informasi PPDB {unit.unit_code}</span>
                </span>
                <h3 className="mt-3 text-xl font-extrabold">Penerimaan Peserta Didik Baru</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/85">{unit.ppdb_info}</p>
                <div className="mt-5 rounded-2xl bg-white/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-gold-light">
                    Persyaratan Dokumen Unit
                  </p>
                  <ul className="mt-2 space-y-1.5 text-xs text-white/85">
                    {unit.required_documents.map((doc) => (
                      <li key={doc.key} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-gold shrink-0" />
                        <span>
                          {doc.label} {doc.required ? '(Wajib)' : '(Opsional)'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                  <Link
                    href={`/ppdb?unit=${unit.slug}`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-extrabold text-navy-deep hover:bg-gold-light transition-colors"
                  >
                    <span>Daftar Online</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/cek-pendaftaran"
                    className="inline-flex items-center justify-center rounded-full border border-white/25 px-5 py-3 text-sm font-bold text-white hover:bg-white/10 transition-colors"
                  >
                    Cek Status
                  </Link>
                </div>
              </div>

              {/* Kontak Unit */}
              <div className="rounded-3xl border border-navy/10 bg-softgray p-6">
                <h3 className="text-base font-extrabold text-navy-deep">Kontak & Pimpinan Unit</h3>
                <dl className="mt-4 space-y-3 text-sm">
                  {unit.headmaster_name && (
                    <div className="flex items-start gap-2.5">
                      <Users className="mt-0.5 h-4 w-4 text-gold-dark shrink-0" />
                      <div>
                        <dt className="text-xs text-slate-500">Kepala Unit</dt>
                        <dd className="font-semibold text-navy-deep">{unit.headmaster_name}</dd>
                      </div>
                    </div>
                  )}
                  {unit.contact_phone && (
                    <div className="flex items-start gap-2.5">
                      <Phone className="mt-0.5 h-4 w-4 text-gold-dark shrink-0" />
                      <div>
                        <dt className="text-xs text-slate-500">Telepon</dt>
                        <dd className="font-semibold text-navy-deep">{unit.contact_phone}</dd>
                      </div>
                    </div>
                  )}
                  {unit.contact_email && (
                    <div className="flex items-start gap-2.5">
                      <Mail className="mt-0.5 h-4 w-4 text-gold-dark shrink-0" />
                      <div>
                        <dt className="text-xs text-slate-500">Email</dt>
                        <dd className="font-semibold text-navy-deep">{unit.contact_email}</dd>
                      </div>
                    </div>
                  )}
                  {unit.address && (
                    <div className="flex items-start gap-2.5">
                      <MapPin className="mt-0.5 h-4 w-4 text-gold-dark shrink-0" />
                      <div>
                        <dt className="text-xs text-slate-500">Alamat</dt>
                        <dd className="font-semibold text-navy-deep">{unit.address}</dd>
                      </div>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* Program Unggulan */}
        <FadeInUp>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gold-dark">Kurikulum & Pembinaan</p>
              <h2 className="mt-1 text-2xl font-extrabold text-navy-deep">Program Unggulan</h2>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => {
              const Icon = ICON_MAP[program.icon_name] ?? BookOpen;
              return (
                <div
                  key={program.id}
                  className="rounded-2xl border border-navy/10 bg-white p-6 shadow-card hover:shadow-cardHover transition-all"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-navy-soft text-navy">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-extrabold text-navy-deep">{program.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {program.description}
                  </p>
                </div>
              );
            })}
          </div>
        </FadeInUp>

        {/* Fasilitas & Prestasi */}
        <FadeInUp>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-navy/10 bg-white p-6 shadow-card sm:p-8">
              <div className="flex items-center gap-2 text-navy-deep">
                <Building2 className="h-5 w-5 text-gold-dark" />
                <h2 className="text-xl font-extrabold">Fasilitas Sekolah</h2>
              </div>
              <div className="mt-5 space-y-4">
                {facilities.map((fac) => (
                  <div
                    key={fac.id}
                    className="flex items-start gap-4 rounded-2xl bg-softgray p-4"
                  >
                    <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-navy-soft">
                      <Image
                        src={fac.image_url || '/images/campus-building.jpg'}
                        alt={fac.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-navy-deep">{fac.name}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">
                        {fac.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-navy/10 bg-white p-6 shadow-card sm:p-8">
              <div className="flex items-center gap-2 text-navy-deep">
                <Award className="h-5 w-5 text-gold-dark" />
                <h2 className="text-xl font-extrabold">Prestasi & Keunggulan</h2>
              </div>
              <ul className="mt-5 space-y-3">
                {unit.achievements.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 rounded-2xl border border-gold/25 bg-gold-soft/70 p-4 text-sm font-medium text-navy-deep"
                  >
                    <Award className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </FadeInUp>

        {/* Tenaga Pendidik (Opsional jika ada) */}
        {teachers && teachers.length > 0 && (
          <FadeInUp>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gold-dark">SDM Pendidik</p>
              <h2 className="mt-1 text-2xl font-extrabold text-navy-deep">Tenaga Pendidik</h2>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="rounded-2xl border border-navy/10 bg-white p-5 text-center shadow-card"
                >
                  <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-navy-soft text-navy ring-2 ring-gold/40">
                    {teacher.photo_url ? (
                      <Image
                        src={teacher.photo_url}
                        alt={teacher.full_name}
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Users className="h-8 w-8 text-navy/60" />
                    )}
                  </div>
                  <h3 className="mt-4 text-sm font-extrabold text-navy-deep">{teacher.full_name}</h3>
                  <p className="mt-0.5 text-xs font-semibold text-gold-dark">{teacher.position}</p>
                  {teacher.subject_or_specialty && (
                    <p className="mt-1 text-xs text-slate-500">{teacher.subject_or_specialty}</p>
                  )}
                </div>
              ))}
            </div>
          </FadeInUp>
        )}

        {/* Berita, Galeri & Agenda Unit */}
        <FadeInUp>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-navy-deep">Berita & Kegiatan Unit</h2>
                <Link href="/berita" className="text-xs font-bold text-navy hover:text-gold-dark">
                  Semua Berita →
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {news.slice(0, 2).map((item) => (
                  <Link
                    key={item.id}
                    href={`/berita/${item.slug}`}
                    className="group overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-card"
                  >
                    <div className="relative aspect-[16/10] bg-navy-soft">
                      <Image
                        src={item.thumbnail_url || '/images/campus-building.jpg'}
                        alt={item.title}
                        fill
                        sizes="300px"
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-[11px] font-semibold text-slate-500">
                        {formatDateId(item.published_at)}
                      </p>
                      <h3 className="mt-1 line-clamp-2 text-sm font-extrabold text-navy-deep">
                        {item.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-navy-deep">Agenda & Galeri</h2>
                <Link href="/galeri" className="text-xs font-bold text-navy hover:text-gold-dark">
                  Lihat Galeri →
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {events.slice(0, 2).map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-2xl border border-navy/10 bg-navy-soft/50 p-4"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-gold-dark">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDateId(ev.start_date)}</span>
                    </div>
                    <p className="mt-1 text-sm font-extrabold text-navy-deep">{ev.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{ev.location}</p>
                  </div>
                ))}
                {galleries.slice(0, 1).map((gal) => (
                  <Link
                    key={gal.id}
                    href="/galeri"
                    className="flex items-center gap-3 rounded-2xl border border-navy/10 bg-white p-3 shadow-sm hover:shadow-card transition-all"
                  >
                    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={gal.cover_image_url}
                        alt={gal.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-navy-deep">{gal.title}</p>
                      <p className="text-xs text-slate-500">Buka dokumentasi kegiatan →</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </FadeInUp>
      </div>
    </div>
  );
}
