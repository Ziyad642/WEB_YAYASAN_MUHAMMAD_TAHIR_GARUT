import { ArrowRight, Calendar, Search } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PublicShell } from '@/components/layout/PublicShell';
import { getEducationUnits, getPublishedNews } from '@/lib/data/public-repository';
import { formatDateId } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Berita & Pengumuman',
  description: 'Kabar terbaru, kegiatan, dan pengumuman resmi Yayasan Muhammad Tahir Garut beserta unit R.A., MI, dan SMP.',
};

export default async function BeritaPage({
  searchParams,
}: {
  searchParams: { q?: string; kategori?: string; unit?: string };
}) {
  const [{ articles, categories }, units] = await Promise.all([
    getPublishedNews({
      query: searchParams.q,
      categorySlug: searchParams.kategori,
      unitSlug: searchParams.unit,
    }),
    getEducationUnits(),
  ]);

  return (
    <PublicShell>
      <section className="bg-navy-deep py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-wider text-gold">Publikasi Resmi</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Berita & Pengumuman</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/80 sm:text-base">
            Informasi kegiatan yayasan dan seluruh unit pendidikan di bawah Yayasan Muhammad Tahir Garut.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Search & Filter */}
        <form
          method="get"
          className="mb-8 flex flex-col gap-3 rounded-2xl border border-navy/10 bg-softgray p-4 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              name="q"
              defaultValue={searchParams.q ?? ''}
              placeholder="Cari judul atau ringkasan berita..."
              className="w-full rounded-xl border border-navy/15 bg-white py-2.5 pl-10 pr-4 text-sm text-navy focus:border-navy focus:outline-none"
            />
          </div>
          <select
            name="kategori"
            defaultValue={searchParams.kategori ?? ''}
            className="rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm text-navy focus:border-navy focus:outline-none"
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            name="unit"
            defaultValue={searchParams.unit ?? ''}
            className="rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm text-navy focus:border-navy focus:outline-none"
          >
            <option value="">Semua Lingkup</option>
            {units.map((u) => (
              <option key={u.id} value={u.slug}>
                {u.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-xl bg-navy px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-deep transition-colors"
          >
            Terapkan
          </button>
        </form>

        {articles.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-navy/20 bg-navy-soft/40 p-12 text-center">
            <p className="text-base font-bold text-navy-deep">Belum ada berita yang sesuai filter.</p>
            <Link
              href="/berita"
              className="mt-4 inline-flex rounded-full bg-navy px-5 py-2 text-xs font-bold text-white"
            >
              Reset Pencarian
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <article
                key={article.id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-navy/10 bg-white shadow-card hover:shadow-cardHover transition-all"
              >
                <Link
                  href={`/berita/${article.slug}`}
                  className="relative aspect-[16/10] overflow-hidden bg-navy-soft"
                >
                  <Image
                    src={article.thumbnail_url || '/images/campus-building.jpg'}
                    alt={article.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 400px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {article.category && (
                      <span className="rounded-full bg-navy-soft px-2.5 py-0.5 font-bold text-navy">
                        {article.category.name}
                      </span>
                    )}
                    <span className="rounded-full bg-gold-soft px-2.5 py-0.5 font-semibold text-gold-dark">
                      {article.unit ? article.unit.name : 'Yayasan Pusat'}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="h-3.5 w-3.5 text-gold-dark" />
                    <time dateTime={article.published_at}>{formatDateId(article.published_at)}</time>
                  </div>
                  <h2 className="mt-2 line-clamp-2 text-lg font-extrabold leading-snug text-navy-deep group-hover:text-navy">
                    <Link href={`/berita/${article.slug}`}>{article.title}</Link>
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                    {article.excerpt}
                  </p>
                  <div className="mt-auto pt-4">
                    <Link
                      href={`/berita/${article.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-navy hover:text-gold-dark"
                    >
                      <span>Baca Selengkapnya</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PublicShell>
  );
}
