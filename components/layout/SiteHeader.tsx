'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  Home,
  Mail,
  MapPin,
  Menu,
  Phone,
  Search,
  User,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn, sanitizeExternalUrl } from '@/lib/utils';
import type { EducationUnit, FoundationSettings } from '@/types/database';

interface SiteHeaderProps {
  settings: FoundationSettings;
  units: EducationUnit[];
}

export function SiteHeader({ settings, units }: SiteHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unitDropdownOpen, setUnitDropdownOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    setSearchOpen(false);
    setMobileMenuOpen(false);
    router.push(trimmed ? `/berita?q=${encodeURIComponent(trimmed)}` : '/berita');
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const socialItems = [
    { label: 'YouTube', href: settings.social_youtube, short: 'YT' },
    { label: 'Instagram', href: settings.social_instagram, short: 'IG' },
    { label: 'Facebook', href: settings.social_facebook, short: 'FB' },
    { label: 'TikTok', href: settings.social_tiktok, short: 'TT' },
  ].filter((s) => s.href);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Bar Info & Social + PPDB CTA */}
      <div className="bg-navy-deep text-white/90 text-xs border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="inline-flex items-center gap-1.5 text-white/85">
              <MapPin className="h-3.5 w-3.5 text-gold shrink-0" aria-hidden="true" />
              <span className="line-clamp-1 max-w-[230px] sm:max-w-xs">{settings.address}</span>
            </span>
            <a
              href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`}
              className="hidden sm:inline-flex items-center gap-1.5 hover:text-gold transition-colors"
            >
              <Phone className="h-3.5 w-3.5 text-gold shrink-0" aria-hidden="true" />
              <span>{settings.phone}</span>
            </a>
            <a
              href={`mailto:${settings.email}`}
              className="hidden md:inline-flex items-center gap-1.5 hover:text-gold transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-gold shrink-0" aria-hidden="true" />
              <span>{settings.email}</span>
            </a>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5">
              {socialItems.map((item) => (
                <a
                  key={item.label}
                  href={sanitizeExternalUrl(item.href)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white hover:bg-gold hover:text-navy-deep transition-colors"
                >
                  {item.short}
                </a>
              ))}
            </div>
            <Link
              href="/ppdb/riwayat"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 px-3 py-1 text-xs font-semibold text-white transition-all"
            >
              <User className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
              <span>Riwayat PPDB</span>
            </Link>
            <Link
              href="/ppdb"
              className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-1 text-xs font-bold text-navy-deep shadow-gold hover:bg-gold-light transition-all"
            >
              <span>PPDB Online</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <nav
        aria-label="Navigasi utama"
        className="bg-white/95 backdrop-blur-md border-b border-navy/10 shadow-sm"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group min-w-0">
            <div className="relative h-11 w-11 sm:h-12 sm:w-12 shrink-0 overflow-hidden rounded-xl bg-white p-0.5 shadow-sm ring-1 ring-navy/10">
              <Image
                src={settings.logo_url || '/logos/logo-yayasan.png'}
                alt={`Logo ${settings.foundation_name}`}
                fill
                sizes="48px"
                className="object-contain"
                priority
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm sm:text-base font-extrabold tracking-tight text-navy-deep group-hover:text-navy transition-colors">
                {settings.foundation_name}
              </p>
              <p className="truncate text-[11px] sm:text-xs font-medium text-slate-500">
                {settings.tagline}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all',
                isActive('/')
                  ? 'bg-navy text-white shadow-sm'
                  : 'text-navy hover:bg-navy-soft'
              )}
            >
              <Home className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Beranda</span>
            </Link>

            {/* Dropdown Tentang Yayasan */}
            <div
              className="relative"
              onMouseEnter={() => setAboutDropdownOpen(true)}
              onMouseLeave={() => setAboutDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setAboutDropdownOpen((prev) => !prev)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold transition-all',
                  isActive('/tentang') || isActive('/cek-pendaftaran')
                    ? 'bg-navy text-white shadow-sm'
                    : 'text-navy hover:bg-navy-soft'
                )}
              >
                <span>Tentang Yayasan</span>
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <AnimatePresence>
                {aboutDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.16 }}
                    className="absolute left-0 mt-1.5 w-60 rounded-2xl bg-white p-2 shadow-cardHover ring-1 ring-navy/10"
                  >
                    <Link
                      href="/tentang"
                      onClick={() => setAboutDropdownOpen(false)}
                      className="block rounded-xl px-3.5 py-2.5 text-sm font-semibold text-navy hover:bg-navy-soft transition-colors"
                    >
                      Profil, Sejarah & Visi Misi
                    </Link>
                    <Link
                      href="/ppdb"
                      onClick={() => setAboutDropdownOpen(false)}
                      className="block rounded-xl px-3.5 py-2.5 text-sm font-semibold text-navy hover:bg-navy-soft transition-colors"
                    >
                      PPDB Online Terpusat
                    </Link>
                    <Link
                      href="/cek-pendaftaran"
                      onClick={() => setAboutDropdownOpen(false)}
                      className="block rounded-xl px-3.5 py-2.5 text-sm font-semibold text-navy hover:bg-navy-soft transition-colors"
                    >
                      Cek Status Pendaftaran
                    </Link>
                    <Link
                      href="/ppdb/riwayat"
                      onClick={() => setAboutDropdownOpen(false)}
                      className="block rounded-xl px-3.5 py-2.5 text-sm font-semibold text-navy hover:bg-navy-soft transition-colors"
                    >
                      Riwayat Pendaftaran Santri
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dropdown Unit Pendidikan */}
            <div
              className="relative"
              onMouseEnter={() => setUnitDropdownOpen(true)}
              onMouseLeave={() => setUnitDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setUnitDropdownOpen((prev) => !prev)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold transition-all',
                  isActive('/unit-pendidikan')
                    ? 'bg-navy text-white shadow-sm'
                    : 'text-navy hover:bg-navy-soft'
                )}
              >
                <span>Unit Pendidikan</span>
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <AnimatePresence>
                {unitDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.16 }}
                    className="absolute left-0 mt-1.5 w-72 rounded-2xl bg-white p-2 shadow-cardHover ring-1 ring-navy/10"
                  >
                    <Link
                      href="/unit-pendidikan"
                      onClick={() => setUnitDropdownOpen(false)}
                      className="block rounded-xl px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-gold-dark hover:bg-navy-soft transition-colors"
                    >
                      Lihat Semua Unit
                    </Link>
                    <div className="my-1 border-t border-slate-100" />
                    {units.map((unit) => (
                      <Link
                        key={unit.id}
                        href={`/unit-pendidikan/${unit.slug}`}
                        onClick={() => setUnitDropdownOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-navy-soft transition-colors"
                      >
                        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-navy/10">
                          <Image
                            src={unit.logo_url}
                            alt={unit.name}
                            fill
                            sizes="32px"
                            className="object-contain p-0.5"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-navy">{unit.name}</p>
                          <p className="truncate text-xs text-slate-500">{unit.level_label}</p>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/berita"
              className={cn(
                'rounded-full px-3.5 py-2 text-sm font-semibold transition-all',
                isActive('/berita') ? 'bg-navy text-white shadow-sm' : 'text-navy hover:bg-navy-soft'
              )}
            >
              Berita
            </Link>
            <Link
              href="/galeri"
              className={cn(
                'rounded-full px-3.5 py-2 text-sm font-semibold transition-all',
                isActive('/galeri') ? 'bg-navy text-white shadow-sm' : 'text-navy hover:bg-navy-soft'
              )}
            >
              Galeri
            </Link>
            <Link
              href="/agenda"
              className={cn(
                'rounded-full px-3.5 py-2 text-sm font-semibold transition-all',
                isActive('/agenda') ? 'bg-navy text-white shadow-sm' : 'text-navy hover:bg-navy-soft'
              )}
            >
              Agenda
            </Link>
            <Link
              href="/kontak"
              className={cn(
                'rounded-full px-3.5 py-2 text-sm font-semibold transition-all',
                isActive('/kontak') ? 'bg-navy text-white shadow-sm' : 'text-navy hover:bg-navy-soft'
              )}
            >
              Kontak
            </Link>
          </div>

          {/* Right Controls: Search + Mobile Menu Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen((prev) => !prev)}
              aria-label="Cari informasi dan berita"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-navy-soft text-navy hover:bg-navy hover:text-white transition-colors"
            >
              {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={mobileMenuOpen}
              className="inline-flex lg:hidden h-10 w-10 items-center justify-center rounded-full bg-navy text-white hover:bg-navy-deep transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Search Drawer */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-navy/10 bg-navy-soft/60"
            >
              <form
                onSubmit={handleSearchSubmit}
                className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3 sm:px-6"
              >
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari berita, pengumuman, atau informasi kegiatan yayasan..."
                  className="w-full rounded-full border border-navy/15 bg-white px-4 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-navy focus:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-deep transition-colors"
                >
                  Cari
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-navy/10 bg-white"
            >
              <div className="space-y-1 px-4 py-4">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm font-bold text-navy hover:bg-navy-soft"
                >
                  Beranda
                </Link>
                <Link
                  href="/tentang"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-navy hover:bg-navy-soft"
                >
                  Tentang Yayasan
                </Link>
                <div className="rounded-xl bg-navy-soft/60 p-2">
                  <p className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-navy/60">
                    Unit Pendidikan
                  </p>
                  <Link
                    href="/unit-pendidikan"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-navy hover:bg-white"
                  >
                    Semua Unit Pendidikan
                  </Link>
                  {units.map((unit) => (
                    <Link
                      key={unit.id}
                      href={`/unit-pendidikan/${unit.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-navy hover:bg-white"
                    >
                      <Image
                        src={unit.logo_url}
                        alt={unit.name}
                        width={24}
                        height={24}
                        className="h-6 w-6 object-contain"
                      />
                      <span>{unit.name}</span>
                    </Link>
                  ))}
                </div>
                <Link
                  href="/berita"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-navy hover:bg-navy-soft"
                >
                  Berita
                </Link>
                <Link
                  href="/galeri"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-navy hover:bg-navy-soft"
                >
                  Galeri
                </Link>
                <Link
                  href="/agenda"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-navy hover:bg-navy-soft"
                >
                  Agenda
                </Link>
                <Link
                  href="/kontak"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-navy hover:bg-navy-soft"
                >
                  Kontak
                </Link>
                <Link
                  href="/ppdb/riwayat"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm font-bold text-gold-dark hover:bg-navy-soft"
                >
                  Riwayat Pendaftaran Siswa
                </Link>
                <div className="pt-2 grid grid-cols-2 gap-2">
                  <Link
                    href="/ppdb"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center rounded-xl bg-gold px-4 py-3 text-sm font-bold text-navy-deep"
                  >
                    Daftar PPDB
                  </Link>
                  <Link
                    href="/cek-pendaftaran"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center rounded-xl bg-navy px-4 py-3 text-sm font-bold text-white"
                  >
                    Cek Status
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
