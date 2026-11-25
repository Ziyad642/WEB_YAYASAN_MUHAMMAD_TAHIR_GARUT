'use client';

import { Calendar, Image as ImageIcon, Video, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { formatDateId, sanitizeExternalUrl } from '@/lib/utils';
import type { GalleryAlbum, GalleryItem } from '@/types/database';

export function GalleryGrid({ albums }: { albums: GalleryAlbum[] }) {
  const [activeAlbum, setActiveAlbum] = useState<GalleryAlbum | null>(null);
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const openAlbum = (album: GalleryAlbum) => {
    setActiveAlbum(album);
    setActiveItem(album.items?.[0] ?? null);
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {albums.map((album) => (
          <button
            key={album.id}
            type="button"
            onClick={() => openAlbum(album)}
            className="group flex flex-col overflow-hidden rounded-3xl border border-navy/10 bg-white text-left shadow-card hover:shadow-cardHover transition-all"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-navy-soft">
              <Image
                src={album.cover_image_url || '/images/campus-building.jpg'}
                alt={album.title}
                fill
                sizes="(max-width: 640px) 100vw, 400px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-navy-deep/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                <ImageIcon className="h-3.5 w-3.5 text-gold" />
                <span>{album.items?.length ?? 1} Media</span>
              </span>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="rounded-full bg-gold-soft px-2.5 py-0.5 font-bold text-gold-dark">
                  {album.unit ? album.unit.name : 'Yayasan Pusat'}
                </span>
                {album.event_date && (
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDateId(album.event_date)}
                  </span>
                )}
              </div>
              <h2 className="mt-3 text-base font-extrabold text-navy-deep">{album.title}</h2>
              {album.description && (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                  {album.description}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeAlbum && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActiveAlbum(null)}
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-navy/10 px-6 py-4">
              <div>
                <h3 className="text-lg font-extrabold text-navy-deep">{activeAlbum.title}</h3>
                <p className="text-xs text-slate-500">{activeAlbum.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveAlbum(null)}
                aria-label="Tutup galeri"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-navy-soft text-navy hover:bg-navy hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              {activeItem ? (
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-navy-deep">
                  {activeItem.media_type === 'video' ? (
                    <iframe
                      src={sanitizeExternalUrl(activeItem.media_url)}
                      title={activeItem.caption || activeAlbum.title}
                      className="h-full w-full"
                      allowFullScreen
                    />
                  ) : (
                    <Image
                      src={activeItem.media_url}
                      alt={activeItem.caption || activeAlbum.title}
                      fill
                      sizes="900px"
                      className="object-contain"
                    />
                  )}
                </div>
              ) : (
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-navy-deep">
                  <Image
                    src={activeAlbum.cover_image_url}
                    alt={activeAlbum.title}
                    fill
                    sizes="900px"
                    className="object-contain"
                  />
                </div>
              )}

              {activeItem?.caption && (
                <p className="mt-3 text-center text-sm font-medium text-navy">
                  {activeItem.caption}
                </p>
              )}

              {activeAlbum.items && activeAlbum.items.length > 1 && (
                <div className="mt-4 flex gap-2.5 overflow-x-auto pb-1">
                  {activeAlbum.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveItem(item)}
                      className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                        activeItem?.id === item.id ? 'border-gold' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      {item.media_type === 'video' ? (
                        <span className="flex h-full w-full items-center justify-center bg-navy text-white">
                          <Video className="h-5 w-5 text-gold" />
                        </span>
                      ) : (
                        <Image
                          src={item.media_url}
                          alt={item.caption || ''}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
