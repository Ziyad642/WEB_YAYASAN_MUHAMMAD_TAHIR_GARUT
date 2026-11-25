import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { MotionProvider } from '@/components/ui/MotionPrimitives';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Yayasan Muhammad Tahir Garut | Pendidikan Islam Terpadu',
    template: '%s | Yayasan Muhammad Tahir Garut',
  },
  description:
    'Website resmi Yayasan Muhammad Tahir Garut. Informasi profil yayasan, unit pendidikan R.A., MI, SMP, berita kegiatan, serta sistem PPDB online terpadu.',
  keywords: [
    'Yayasan Muhammad Tahir Garut',
    'RA Muhammad Tahir Garut',
    'MI Muhammad Tahir Garut',
    'SMP Muhammad Tahir Garut',
    'PPDB Online Garut',
    'Pendidikan Islam Garut',
  ],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'Yayasan Muhammad Tahir Garut',
    title: 'Yayasan Muhammad Tahir Garut | Mencetak Generasi Unggul untuk Masa Depan',
    description:
      'Ekosistem digital pendidikan Islam Yayasan Muhammad Tahir Garut untuk jenjang RA, MI, dan SMP.',
    images: [{ url: '/images/hero-students.jpg', width: 1200, height: 630 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Yayasan Muhammad Tahir Garut',
    url: siteUrl,
    logo: `${siteUrl}/logos/logo-yayasan.png`,
    description:
      'Lembaga pendidikan Islam di Garut yang menaungi jenjang R.A., MI, dan SMP.',
  };

  return (
    <html lang="id" className={plusJakarta.variable}>
      <body className="font-sans text-navy antialiased selection:bg-gold/30 selection:text-navy-deep">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
