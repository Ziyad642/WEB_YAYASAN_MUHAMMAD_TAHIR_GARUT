import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/PublicShell';
import { getNewsBySlug, getPublishedNews } from '@/lib/data/public-repository';
import { formatDateId } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = await getNewsBySlug(params.slug);
  if (!article) return { title: 'Berita Tidak Ditemukan' };
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.thumbnail_url }],
    },
  };
}

export default async function BeritaDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const [article, { articles }] = await Promise.all([
    getNewsBySlug(params.slug),
    getPublishedNews({ limit: 4 }),
  ]);

  if (!article) notFound();

  const related = articles.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <PublicShell>
      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Link
          href="/berita"
          className="inline-flex items-center gap-2 text-sm font-bold text-navy hover:text-gold-dark"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Daftar Berita</span>
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
          {article.category && (
            <span className="inline-flex items-center gap-1 rounded-full bg-navy-soft px-3 py-1 font-bold text-navy">
              <Tag className="h-3 w-3" />
              <span>{article.category.name}</span>
            </span>
          )}
          <span className="rounded-full bg-gold-soft px-3 py-1 font-bold text-gold-dark">
            {article.unit ? article.unit.name : 'Yayasan Muhammad Tahir Garut'}
          </span>
          <span className="inline-flex items-center gap-1.5 text-slate-500">
            <Calendar className="h-3.5 w-3.5 text-gold-dark" />
            <time dateTime={article.published_at}>{formatDateId(article.published_at)}</time>
          </span>
        </div>

        <h1 className="mt-4 text-2xl font-extrabold leading-tight text-navy-deep sm:text-4xl">
          {article.title}
        </h1>
        <p className="mt-3 text-base font-medium leading-relaxed text-slate-600">
          {article.excerpt}
        </p>

        <div className="relative mt-7 aspect-[16/9] overflow-hidden rounded-3xl bg-navy-soft shadow-card">
          <Image
            src={article.thumbnail_url || '/images/campus-building.jpg'}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 896px"
            className="object-cover"
          />
        </div>

        <div className="mt-8 space-y-4 whitespace-pre-line text-base leading-relaxed text-slate-700">
          {article.content}
        </div>

        {related.length > 0 && (
          <div className="mt-14 border-t border-navy/10 pt-10">
            <h2 className="text-xl font-extrabold text-navy-deep">Berita Lainnya</h2>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/berita/${item.slug}`}
                  className="group overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm hover:shadow-card transition-all"
                >
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={item.thumbnail_url || '/images/campus-building.jpg'}
                      alt={item.title}
                      fill
                      sizes="260px"
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-3.5">
                    <p className="text-[11px] text-slate-500">{formatDateId(item.published_at)}</p>
                    <h3 className="mt-1 line-clamp-2 text-sm font-bold text-navy-deep">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </PublicShell>
  );
}
