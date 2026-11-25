'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Play,
  PlayCircle,
  Sparkles,
  Star,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FadeInUp, HeroEntrance } from '@/components/ui/MotionPrimitives';
import { formatDateId, sanitizeExternalUrl } from '@/lib/utils';
import type { EducationUnit, FoundationSettings, NewsArticle } from '@/types/database';

interface LandingSectionsProps {
  settings: FoundationSettings;
  units: EducationUnit[];
  latestNews: NewsArticle[];
}

function renderHeroHeadline(title: string) {
  const keyword = 'Masa Depan';
  const index = title.indexOf(keyword);
  if (index === -1) return title;
  const before = title.slice(0, index);
  const after = title.slice(index + keyword.length);
  return (
    <>
      {before}
      <span className="text-gold">{keyword}</span>
      {after}
    </>
  );
}

function renderPpdbHeadline(title: string) {
  const keyword = 'Didik Baru Telah Dibuka!';
  const index = title.indexOf(keyword);
  if (index === -1) return title;
  const before = title.slice(0, index);
  const after = title.slice(index + keyword.length);
  return (
    <>
      {before}
      <span className="text-gold">{keyword}</span>
      {after}
    </>
  );
}

const UNIT_CARD_TINTS: Record<string, string> = {
  RA: 'from-[#fdf8ec] via-white to-[#f6ebd0]/45 border-[#e9bc58]/35',
  MI: 'from-[#eef4fa] via-white to-[#dce8f5]/50 border-[#102f55]/15',
  SMP: 'from-[#eef6f3] via-white to-[#d7ebe3]/45 border-[#0f5c43]/20',
};

export function LandingSections({ settings, units, latestNews }: LandingSectionsProps) {
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  return (
    <div className="bg-white">
      {/* =====================================================================
          HERO SECTION
          ===================================================================== */}
      <section className="relative overflow-hidden bg-navy-deep text-white">
        {/* Background Photo */}
        <div className="absolute inset-0">
          <Image
            src={settings.hero_image_url || '/images/hero-students.jpg'}
            alt="Lingkungan sekolah dan aktivitas siswa Yayasan Muhammad Tahir Garut"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center md:object-right"
          />
          {/* Navy gradient overlay kiri ke kanan agar teks kontras & foto kanan tetap cerah */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/90 to-navy-deep/25 md:via-navy-deep/85 md:to-transparent"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-transparent to-navy-deep/30"
          />
        </div>

        {/* Hero Content */}
        <div className="relative mx-auto max-w-7xl px-4 pb-28 pt-14 sm:px-6 sm:pb-32 sm:pt-20 lg:px-8 lg:pb-36 lg:pt-24">
          <div className="max-w-2xl">
            <HeroEntrance delay={0.05}>
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-navy/75 px-4 py-1.5 text-xs font-bold tracking-wide text-gold-light backdrop-blur-sm">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" aria-hidden="true" />
                <span>{settings.hero_badge}</span>
              </span>
            </HeroEntrance>

            <HeroEntrance delay={0.12}>
              <h1 className="mt-5 text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-[54px]">
                {renderHeroHeadline(settings.hero_title)}
              </h1>
            </HeroEntrance>

            <HeroEntrance delay={0.2}>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base lg:text-lg">
                {settings.hero_subtitle}
              </p>
            </HeroEntrance>

            <HeroEntrance delay={0.28}>
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Link
                  href="#unit-pendidikan"
                  className="inline-flex min-h-[48px] items-center gap-2.5 rounded-full bg-gold px-6 py-3 text-sm font-extrabold text-navy-deep shadow-gold hover:bg-gold-light hover:-translate-y-0.5 transition-all"
                >
                  <span>Jelajahi Unit Pendidikan</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>

                <Link
                  href="/tentang"
                  className="inline-flex min-h-[48px] items-center gap-2.5 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm hover:bg-white/20 hover:-translate-y-0.5 transition-all"
                >
                  <PlayCircle className="h-4 w-4 text-gold" aria-hidden="true" />
                  <span>Profil Yayasan</span>
                </Link>
              </div>
            </HeroEntrance>
          </div>
        </div>

        {/* Organic Curved Bottom Wave */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden leading-none">
          <svg
            viewBox="0 0 1440 90"
            preserveAspectRatio="none"
            className="h-12 w-full sm:h-16 md:h-20"
          >
            <path
              d="M0,45 C320,95 1120,0 1440,55 L1440,90 L0,90 Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>
      </section>

      {/* =====================================================================
          FLOATING CARD: UNIT PENDIDIKAN DI BAWAH YAYASAN
          ===================================================================== */}
      <section
        id="unit-pendidikan"
        className="relative z-10 mx-auto -mt-14 max-w-7xl px-4 sm:-mt-20 sm:px-6 lg:px-8"
      >
        <FadeInUp>
          <div className="rounded-3xl bg-white p-5 shadow-glass ring-1 ring-navy/10 sm:p-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-3">
                <span className="hidden h-[2px] w-10 bg-gold/60 sm:block" />
                <h2 className="text-xl font-extrabold text-navy-deep sm:text-2xl">
                  Unit Pendidikan di Bawah Yayasan
                </h2>
                <span className="hidden h-[2px] w-10 bg-gold/60 sm:block" />
              </div>
              <p className="mt-1.5 text-sm text-slate-500">
                Pilih unit pendidikan untuk informasi lebih lanjut.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {units.map((unit) => (
                <motion.div
                  key={unit.id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={`/unit-pendidikan/${unit.slug}`}
                    className={`group flex h-full items-center justify-between gap-4 rounded-2xl border bg-gradient-to-br p-4 shadow-sm transition-all hover:shadow-cardHover ${
                      UNIT_CARD_TINTS[unit.unit_code] ??
                      'from-navy-soft via-white to-white border-navy/15'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-navy/10">
                        <Image
                          src={unit.logo_url}
                          alt={`Logo ${unit.name}`}
                          fill
                          sizes="64px"
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="truncate text-base font-extrabold text-navy-deep group-hover:text-navy">
                            {unit.name}
                          </h3>
                        </div>
                        <p className="mt-0.5 text-xs font-medium text-slate-600 line-clamp-2">
                          {unit.level_label}
                        </p>
                        {unit.is_logo_placeholder && (
                          <span className="mt-1 inline-block rounded-full bg-navy/10 px-2 py-0.5 text-[10px] font-semibold text-navy">
                            Logo placeholder
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-navy shadow-sm ring-1 ring-navy/10 group-hover:bg-navy group-hover:text-white transition-colors">
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeInUp>
      </section>

      {/* =====================================================================
          TENTANG YAYASAN & BERITA TERBARU (2 KOLOM SEPERTI REFERENSI)
          ===================================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
          {/* Kolom Kiri: Tentang Yayasan */}
          <FadeInUp className="lg:col-span-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-12 sm:items-center">
              <div className="sm:col-span-6">
                <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-navy-soft shadow-card ring-1 ring-navy/10">
                  <Image
                    src={settings.about_image_url || '/images/campus-building.jpg'}
                    alt={`Lingkungan ${settings.foundation_name}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 300px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {settings.about_video_url ? (
                    <button
                      type="button"
                      onClick={() => setVideoModalOpen(true)}
                      aria-label="Putar video profil yayasan"
                      className="absolute inset-0 flex items-center justify-center bg-navy-deep/25 transition-colors group-hover:bg-navy-deep/40"
                    >
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-navy-deep shadow-lg transition-transform group-hover:scale-110">
                        <Play className="h-6 w-6 fill-navy-deep ml-0.5" />
                      </span>
                    </button>
                  ) : (
                    <Link
                      href="/galeri"
                      aria-label="Lihat galeri lingkungan yayasan"
                      className="absolute inset-0 flex items-center justify-center bg-navy-deep/15 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <span className="rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-navy-deep shadow-md">
                        Lihat Galeri
                      </span>
                    </Link>
                  )}
                </div>
              </div>

              <div className="sm:col-span-6">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-dark">
                  <span className="h-[2px] w-6 bg-gold" />
                  <span>Tentang Yayasan</span>
                </div>
                <h2 className="mt-2 text-2xl font-extrabold leading-snug text-navy-deep">
                  Mengenal Lebih Dekat {settings.foundation_name}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 line-clamp-4">
                  {settings.short_description}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Link
                    href="/tentang"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-navy-deep transition-all"
                  >
                    <span>Selengkapnya</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Ringkasan Visi */}
            <div className="mt-6 rounded-2xl border border-navy/10 bg-navy-soft/70 p-5">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy text-gold">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-navy/70">
                    Visi Yayasan
                  </p>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-navy-deep">
                    {settings.vision}
                  </p>
                </div>
              </div>
            </div>
          </FadeInUp>

          {/* Kolom Kanan: Berita Terbaru (3 Kartu) */}
          <FadeInUp delay={0.08} className="lg:col-span-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-dark">
                  <span className="h-[2px] w-6 bg-gold" />
                  <span>Informasi Terkini</span>
                </div>
                <h2 className="mt-1 text-2xl font-extrabold text-navy-deep">
                  Berita Terbaru
                </h2>
              </div>
              <Link
                href="/berita"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-navy hover:text-gold-dark transition-colors"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {latestNews.slice(0, 3).map((article) => (
                <motion.article
                  key={article.id}
                  whileHover={{ y: -4 }}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-card transition-all hover:shadow-cardHover"
                >
                  <Link
                    href={`/berita/${article.slug}`}
                    className="relative aspect-[16/10] overflow-hidden bg-navy-soft"
                  >
                    <Image
                      src={article.thumbnail_url || '/images/campus-building.jpg'}
                      alt={article.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 240px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                      <Calendar className="h-3.5 w-3.5 text-gold-dark shrink-0" />
                      <time dateTime={article.published_at}>
                        {formatDateId(article.published_at)}
                      </time>
                    </div>
                    <h3 className="mt-2 line-clamp-2 text-sm font-extrabold leading-snug text-navy-deep group-hover:text-navy">
                      <Link href={`/berita/${article.slug}`}>{article.title}</Link>
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                      {article.excerpt}
                    </p>
                    <div className="mt-auto pt-3">
                      <Link
                        href={`/berita/${article.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-navy hover:text-gold-dark transition-colors"
                      >
                        <span>Baca Selengkapnya</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* =====================================================================
          BANNER CTA PPDB
          ===================================================================== */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <FadeInUp>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-deep via-navy to-navy-light p-6 text-white shadow-navy sm:p-10">
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-2/5 opacity-25 md:block">
              <Image
                src={settings.about_image_url || '/images/campus-building.jpg'}
                alt=""
                fill
                sizes="40vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/70 to-transparent" />
            </div>

            <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="flex items-start gap-4 sm:items-center">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-gold ring-1 ring-gold/30">
                  <BookOpen className="h-7 w-7" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold sm:text-2xl lg:text-[26px]">
                    {renderPpdbHeadline(settings.ppdb_banner_title)}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm text-white/85">
                    {settings.ppdb_banner_subtitle}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link
                  href="/ppdb"
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-gold px-7 py-3 text-sm font-extrabold text-navy-deep shadow-gold hover:bg-gold-light hover:-translate-y-0.5 transition-all"
                >
                  <span>Daftar Sekarang</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/cek-pendaftaran"
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/20 transition-all"
                >
                  <span>Cek Pendaftaran</span>
                </Link>
              </div>
            </div>
          </div>
        </FadeInUp>
      </section>

      {/* Video Modal jika admin mengisi about_video_url */}
      {videoModalOpen && settings.about_video_url && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setVideoModalOpen(false)}
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-2xl bg-navy-deep p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 text-white">
              <p className="text-sm font-bold">Video Profil {settings.foundation_name}</p>
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/20"
              >
                Tutup
              </button>
            </div>
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
              <iframe
                src={sanitizeExternalUrl(settings.about_video_url)}
                title="Video Profil Yayasan"
                className="h-full w-full"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
