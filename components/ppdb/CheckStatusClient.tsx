'use client';

import { AlertCircle, CheckCircle2, Clock, Loader2, Search } from 'lucide-react';
import { useState } from 'react';
import { ADMISSION_STATUS_META, cn, formatDateTimeId } from '@/lib/utils';
import type { AdmissionStatus } from '@/types/database';

interface StatusLookupResult {
  registrationNumber: string;
  applicantMaskedName: string;
  unitName: string;
  academicYear: string;
  periodName: string;
  status: AdmissionStatus;
  verificationNotes: string;
  submittedAt: string;
  verifiedAt?: string | null;
  statusLogs: Array<{
    new_status: AdmissionStatus;
    notes: string;
    created_at: string;
  }>;
}

export function CheckStatusClient({ initialNomor = '' }: { initialNomor?: string }) {
  const [registrationNumber, setRegistrationNumber] = useState(initialNomor);
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<StatusLookupResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/ppdb/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber: registrationNumber.trim().toUpperCase(),
          birthDate,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Data pendaftaran tidak ditemukan.');
      }
      setResult(json.data as StatusLookupResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memeriksa status pendaftaran.');
    } finally {
      setLoading(false);
    }
  };

  const statusMeta = result ? ADMISSION_STATUS_META[result.status] : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-navy/10 bg-white p-6 shadow-card sm:p-8"
      >
        <h2 className="text-lg font-extrabold text-navy-deep">
          Masukkan Data Verifikasi Pendaftaran
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Demi menjaga kerahasiaan data calon siswa, pengecekan memerlukan kombinasi Nomor Pendaftaran dan Tanggal Lahir.
        </p>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase text-navy">
              Nomor Pendaftaran *
            </label>
            <input
              type="text"
              required
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
              placeholder="Contoh: MT-RA-2027-0001"
              className="mt-1.5 w-full rounded-xl border border-navy/15 px-4 py-3 font-mono text-sm uppercase focus:border-navy focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-navy">
              Tanggal Lahir Siswa *
            </label>
            <input
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-navy focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-bold text-white hover:bg-navy-deep disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Memeriksa Data...</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              <span>Cek Status Pendaftaran</span>
            </>
          )}
        </button>
      </form>

      {result && statusMeta && (
        <div className="rounded-3xl border border-navy/10 bg-white p-6 shadow-card sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy/10 pb-4">
            <div>
              <p className="text-xs font-semibold text-slate-500">Nomor Pendaftaran</p>
              <p className="font-mono text-xl font-extrabold text-navy-deep">
                {result.registrationNumber}
              </p>
            </div>
            <span
              className={cn(
                'inline-flex rounded-full border px-4 py-1.5 text-xs font-extrabold',
                statusMeta.badgeClass
              )}
            >
              {statusMeta.label}
            </span>
          </div>

          <p className="mt-4 text-sm text-slate-600">{statusMeta.description}</p>

          <dl className="mt-5 grid grid-cols-1 gap-3 rounded-2xl bg-softgray p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-500">Calon Siswa (Disamarkan)</dt>
              <dd className="font-bold text-navy-deep">{result.applicantMaskedName}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Unit Pendidikan</dt>
              <dd className="font-bold text-navy-deep">{result.unitName}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Tahun Ajaran / Periode</dt>
              <dd className="font-semibold text-navy-deep">
                {result.academicYear} — {result.periodName}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Waktu Pengiriman</dt>
              <dd className="font-semibold text-navy-deep">{formatDateTimeId(result.submittedAt)}</dd>
            </div>
          </dl>

          {result.verificationNotes && (
            <div className="mt-4 rounded-2xl border border-gold/40 bg-gold-soft p-4">
              <p className="text-xs font-bold uppercase text-gold-dark">Catatan Panitia PPDB</p>
              <p className="mt-1 text-sm text-navy-deep">{result.verificationNotes}</p>
            </div>
          )}

          {result.statusLogs.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-extrabold text-navy-deep">Riwayat Status Verifikasi</h3>
              <ul className="mt-3 space-y-2.5">
                {result.statusLogs.map((log, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-navy/10 p-3 text-xs"
                  >
                    {i === 0 ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    ) : (
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    )}
                    <div>
                      <p className="font-bold text-navy-deep">
                        {ADMISSION_STATUS_META[log.new_status]?.label ?? log.new_status}
                      </p>
                      {log.notes && <p className="mt-0.5 text-slate-600">{log.notes}</p>}
                      <p className="mt-1 text-[11px] text-slate-400">
                        {formatDateTimeId(log.created_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
