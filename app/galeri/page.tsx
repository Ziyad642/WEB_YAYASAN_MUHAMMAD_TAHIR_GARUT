import type { Metadata } from 'next';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { PublicShell } from '@/components/layout/PublicShell';
import { getPublishedGalleries } from '@/lib/data/public-repository';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Galeri Kegiatan',
  description: 'Dokumentasi foto dan video kegiatan pendidikan Yayasan Muhammad Tahir Garut.',
};

export default async function GaleriPage() {
  const albums = await getPublishedGalleries();

  return (
    <PublicShell>
      <section className="bg-navy-deep py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-wider text-gold">Dokumentasi</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Galeri Foto & Video</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/80 sm:text-base">
            Rekam jejak aktivitas belajar, pembinaan karakter, dan kegiatan sekolah di Yayasan Muhammad Tahir Garut.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <GalleryGrid albums={albums} />
      </section>
    </PublicShell>
  );
}
