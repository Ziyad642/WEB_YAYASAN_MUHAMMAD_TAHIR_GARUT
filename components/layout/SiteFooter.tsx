import { Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { sanitizeExternalUrl } from '@/lib/utils';
import type { FoundationSettings } from '@/types/database';

interface SiteFooterProps {
  settings: FoundationSettings;
}

export function SiteFooter({ settings }: SiteFooterProps) {
  const socialLinks = [
    { label: 'YouTube', href: settings.social_youtube, short: 'YT' },
    { label: 'Instagram', href: settings.social_instagram, short: 'IG' },
    { label: 'Facebook', href: settings.social_facebook, short: 'FB' },
    { label: 'TikTok', href: settings.social_tiktok, short: 'TT' },
  ].filter((item) => item.href);

  return (
    <footer className="relative overflow-hidden bg-navy-deep text-white">
      {/* Subtle geometric accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-navy-light/30 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center">
          {/* Logo & Yayasan */}
          <div className="md:col-span-4 flex items-center gap-3.5">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-white p-1 shadow-md">
              <Image
                src={settings.logo_url || '/logos/logo-yayasan.png'}
                alt={settings.foundation_name}
                fill
                sizes="56px"
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">{settings.foundation_name}</h2>
              <p className="text-xs text-gold-light">{settings.tagline}</p>
              <div className="mt-2 space-y-1 text-xs text-white/75">
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-gold shrink-0" />
                  <span>{settings.address}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-gold shrink-0" />
                  <span>{settings.phone}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-gold shrink-0" />
                  <span>{settings.email}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav
            aria-label="Navigasi footer"
            className="md:col-span-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-white/85 md:justify-center"
          >
            <Link href="/" className="hover:text-gold transition-colors">
              Beranda
            </Link>
            <span className="text-white/30">|</span>
            <Link href="/tentang" className="hover:text-gold transition-colors">
              Tentang Yayasan
            </Link>
            <span className="text-white/30">|</span>
            <Link href="/unit-pendidikan" className="hover:text-gold transition-colors">
              Unit Pendidikan
            </Link>
            <span className="text-white/30">|</span>
            <Link href="/berita" className="hover:text-gold transition-colors">
              Berita
            </Link>
            <span className="text-white/30">|</span>
            <Link href="/galeri" className="hover:text-gold transition-colors">
              Galeri
            </Link>
            <span className="text-white/30">|</span>
            <Link href="/agenda" className="hover:text-gold transition-colors">
              Agenda
            </Link>
            <span className="text-white/30">|</span>
            <Link href="/ppdb" className="hover:text-gold font-semibold text-gold-light transition-colors">
              PPDB Online
            </Link>
            <span className="text-white/30">|</span>
            <Link href="/cek-pendaftaran" className="hover:text-gold transition-colors">
              Cek Status
            </Link>
            <span className="text-white/30">|</span>
            <Link href="/kontak" className="hover:text-gold transition-colors">
              Kontak
            </Link>
          </nav>

          {/* Social & Admin Portal Link */}
          <div className="md:col-span-3 flex flex-col items-start md:items-end gap-3">
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={sanitizeExternalUrl(social.href)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white hover:bg-gold hover:text-navy-deep transition-colors"
                >
                  {social.short}
                </a>
              ))}
            </div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/75 hover:border-gold hover:text-gold transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Portal Admin Yayasan</span>
            </Link>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-xs text-white/65 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {settings.foundation_name}. All rights reserved.
          </p>
          <p className="italic text-gold-light/90">
            &ldquo;{settings.footer_quote}&rdquo;
          </p>
        </div>
      </div>
    </footer>
  );
}
