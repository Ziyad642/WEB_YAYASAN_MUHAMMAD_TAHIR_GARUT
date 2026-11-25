import { Calendar, Clock, MapPin } from 'lucide-react';
import type { Metadata } from 'next';
import { PublicShell } from '@/components/layout/PublicShell';
import { getPublishedEvents } from '@/lib/data/public-repository';
import { formatDateId } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Agenda Kegiatan',
  description: 'Jadwal kegiatan akademik, keagamaan, dan PPDB Yayasan Muhammad Tahir Garut.',
};

export default async function AgendaPage() {
  const events = await getPublishedEvents();

  return (
    <PublicShell>
      <section className="bg-navy-deep py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-wider text-gold">Kalender Yayasan</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Agenda Kegiatan</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/80 sm:text-base">
            Jadwal kegiatan mendatang di lingkungan Yayasan Muhammad Tahir Garut dan unit pendidikan.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {events.map((event) => {
            const d = new Date(event.start_date);
            const day = Number.isNaN(d.getTime()) ? '-' : d.getDate();
            const month = Number.isNaN(d.getTime())
              ? '-'
              : new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' }).format(d);

            return (
              <div
                key={event.id}
                className="flex flex-col gap-4 rounded-3xl border border-navy/10 bg-white p-5 shadow-card sm:flex-row sm:items-center sm:p-6"
              >
                <div className="flex h-20 w-24 shrink-0 flex-col items-center justify-center rounded-2xl bg-navy text-white">
                  <span className="text-2xl font-extrabold text-gold">{day}</span>
                  <span className="text-xs font-semibold uppercase">{month}</span>
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-gold-soft px-3 py-0.5 text-xs font-bold text-gold-dark">
                      {event.unit ? event.unit.name : 'Yayasan Pusat'}
                    </span>
                  </div>
                  <h2 className="mt-2 text-lg font-extrabold text-navy-deep">{event.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{event.description}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gold-dark" />
                      {formatDateId(event.start_date)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-gold-dark" />
                      {formatDateId(event.start_date, { hour: '2-digit', minute: '2-digit' })} WIB
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-gold-dark" />
                      {event.location}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </PublicShell>
  );
}
