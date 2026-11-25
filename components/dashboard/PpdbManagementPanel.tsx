'use client';

import {
  CheckCircle2,
  Download,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { AdminDashboardPayload } from '@/lib/data/admin-repository';
import {
  ADMISSION_STATUS_META,
  SYNC_STATUS_META,
  cn,
  formatDateTimeId,
  getAdmissionStatusMeta,
} from '@/lib/utils';
import type { AdmissionRecord, AdmissionStatus } from '@/types/database';

interface PpdbManagementPanelProps {
  admissions: AdmissionRecord[];
  syncLogs: AdminDashboardPayload['syncLogs'];
  canVerify: boolean;
  onRefresh: () => void;
  mode: 'admissions' | 'google-sync';
}

export function PpdbManagementPanel({
  admissions,
  syncLogs,
  canVerify,
  onRefresh,
  mode,
}: PpdbManagementPanelProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selected, setSelected] = useState<AdmissionRecord | null>(null);
  const [newStatus, setNewStatus] = useState<AdmissionStatus>('menunggu_verifikasi');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [docLoadingId, setDocLoadingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [batchSyncing, setBatchSyncing] = useState(false);
  const [feedback, setFeedback] = useState('');

  const filteredAdmissions = useMemo(() => {
    return admissions.filter((a) => {
      const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        a.registration_number.toLowerCase().includes(q) ||
        (a.applicant?.full_name ?? '').toLowerCase().includes(q) ||
        (a.guardian?.phone ?? '').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [admissions, search, statusFilter]);

  const openModal = (record: AdmissionRecord) => {
    setSelected(record);
    setNewStatus(record.status);
    setNotes(record.verification_notes ?? '');
    setFeedback('');
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    setFeedback('');

    try {
      const res = await fetch(`/api/admin/admissions/${selected.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, verificationNotes: notes }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal memperbarui status.');
      setFeedback('Status verifikasi berhasil diperbarui & dikirim ke antrean Google Sheets.');
      setSelected(null);
      onRefresh();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDocument = async (admissionId: string, docId: string) => {
    setDocLoadingId(docId);
    try {
      const res = await fetch(`/api/admin/admissions/${admissionId}/documents/${docId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal membuka dokumen.');
      window.open(json.signedUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal mengakses dokumen privat.');
    } finally {
      setDocLoadingId(null);
    }
  };

  const handleManualSync = async (admissionId?: string) => {
    if (admissionId) setSyncingId(admissionId);
    else setBatchSyncing(true);
    setFeedback('');

    try {
      const res = await fetch('/api/admin/google-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(admissionId ? { admissionId } : {}),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Sinkronisasi gagal.');
      setFeedback(
        admissionId
          ? json.success
            ? 'Sinkronisasi Google Sheets berhasil.'
            : `Sinkronisasi gagal: ${json.result?.error ?? ''}`
          : `Retry selesai: ${json.successCount} berhasil, ${json.failedCount} gagal.`
      );
      onRefresh();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Gagal melakukan sinkronisasi.');
    } finally {
      setSyncingId(null);
      setBatchSyncing(false);
    }
  };

  const exportCsv = () => {
    const headers = [
      'No Pendaftaran',
      'Unit',
      'Tahun Ajaran',
      'Nama Calon Siswa',
      'JK',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Nama Ayah',
      'Nama Ibu',
      'No Telepon',
      'Status',
      'Tanggal Daftar',
    ];
    const rows = filteredAdmissions.map((a) => [
      a.registration_number,
      a.unit?.name ?? '',
      a.academic_year?.name ?? '',
      a.applicant?.full_name ?? '',
      a.applicant?.gender ?? '',
      a.applicant?.birth_place ?? '',
      a.applicant?.birth_date ?? '',
      a.guardian?.father_name ?? '',
      a.guardian?.mother_name ?? '',
      a.guardian?.phone ?? '',
      getAdmissionStatusMeta(a.status)?.label ?? a.status,
      a.submitted_at,
    ]);
    const csv = [headers, ...rows]
      .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-ppdb-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (mode === 'google-sync') {
    return (
      <div className="space-y-5">
        <div className="flex flex-col gap-3 rounded-2xl border border-navy/10 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-navy-deep">
              Sinkronisasi Otomatis Google Sheets
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Supabase tetap menjadi database utama. Google Sheets berfungsi sebagai salinan rekap per tab (Semua Pendaftar, R.A., MI, SMP, Laporan PPDB).
            </p>
          </div>
          <button
            type="button"
            disabled={batchSyncing}
            onClick={() => handleManualSync()}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full bg-navy px-5 py-2 text-xs font-bold text-white hover:bg-navy-deep disabled:opacity-60 shrink-0"
          >
            {batchSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>Retry Semua yang Gagal/Pending</span>
          </button>
        </div>

        {feedback && (
          <div className="rounded-2xl border border-navy/15 bg-navy-soft p-3.5 text-xs font-semibold text-navy-deep">
            {feedback}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white">
          <div className="divide-y divide-navy/10">
            {syncLogs.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Belum ada antrean sinkronisasi Google Sheets.
              </div>
            ) : (
              syncLogs.map((log) => {
                const meta = SYNC_STATUS_META[log.sync_status] ?? {
                  label: log.sync_status || 'Sinkron',
                  badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
                };
                return (
                  <div
                    key={log.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-extrabold text-navy-deep">
                          {log.registration_number}
                        </span>
                        <span
                          className={cn(
                            'rounded-full border px-2.5 py-0.5 text-[11px] font-bold',
                            meta?.badgeClass || 'bg-slate-100 text-slate-700 border-slate-200'
                          )}
                        >
                          {meta?.label || log.sync_status}
                        </span>
                        <span className="text-xs text-slate-500">
                          Tab: <strong>{log.target_sheet_tab}</strong>
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Percobaan: {log.attempt_count}x{' '}
                        {log.synced_at ? `• Terakhir sukses: ${formatDateTimeId(log.synced_at)}` : ''}
                      </p>
                      {log.last_error && (
                        <p className="mt-1 text-xs text-rose-600">{log.last_error}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={syncingId === log.admission_id}
                      onClick={() => handleManualSync(log.admission_id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-navy/20 px-4 py-2 text-xs font-bold text-navy hover:bg-navy-soft shrink-0"
                    >
                      {syncingId === log.admission_id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                      )}
                      <span>Sinkron Ulang</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-navy/10 bg-white p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nomor pendaftaran, nama siswa, atau no HP..."
            className="w-full rounded-xl border border-navy/15 py-2.5 pl-9 pr-3 text-sm focus:border-navy focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm font-semibold text-navy"
        >
          <option value="ALL">Semua Status</option>
          {Object.entries(ADMISSION_STATUS_META).map(([key, meta]) => (
            <option key={key} value={key}>
              {meta.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-xs font-bold text-white hover:bg-navy-deep"
        >
          <Download className="h-4 w-4" />
          <span>Ekspor CSV</span>
        </button>
      </div>

      {feedback && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800">
          {feedback}
        </div>
      )}

      {/* List Data Pendaftar (Responsive Cards on Mobile + Clean Table on Desktop) */}
      <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white">
        {filteredAdmissions.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Belum ada pendaftar PPDB yang sesuai filter.
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="divide-y divide-navy/10 md:hidden">
              {filteredAdmissions.map((adm) => {
                const statusMeta = getAdmissionStatusMeta(adm.status) || {
                  label: adm.status || 'Menunggu Verifikasi',
                  badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
                  description: '',
                };
                return (
                  <div key={adm.id} className="space-y-2 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-extrabold text-navy-deep">
                        {adm.registration_number}
                      </span>
                      <span
                        className={cn(
                          'rounded-full border px-2.5 py-0.5 text-[11px] font-bold',
                          statusMeta?.badgeClass || 'bg-amber-50 text-amber-800 border-amber-200'
                        )}
                      >
                        {statusMeta?.label || adm.status || 'Menunggu Verifikasi'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-navy-deep">
                      {adm.applicant?.full_name ?? '-'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {adm.unit?.name} • {adm.guardian?.phone}
                    </p>
                    <button
                      type="button"
                      onClick={() => openModal(adm)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-navy-soft px-3.5 py-1.5 text-xs font-bold text-navy"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Periksa & Verifikasi</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-softgray text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">No. Pendaftaran</th>
                    <th className="px-4 py-3">Calon Siswa</th>
                    <th className="px-4 py-3">Unit</th>
                    <th className="px-4 py-3">Kontak Ortu</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/10">
                  {filteredAdmissions.map((adm) => {
                    const statusMeta = getAdmissionStatusMeta(adm.status) || {
                      label: adm.status || 'Menunggu Verifikasi',
                      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
                      description: '',
                    };
                    return (
                      <tr key={adm.id} className="hover:bg-navy-soft/30">
                        <td className="px-4 py-3 font-mono text-xs font-bold text-navy-deep">
                          {adm.registration_number}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-navy-deep">
                            {adm.applicant?.full_name ?? '-'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDateTimeId(adm.submitted_at)}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold text-navy">
                          {adm.unit?.name}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {adm.guardian?.phone ?? '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold',
                              statusMeta?.badgeClass || 'bg-amber-50 text-amber-800 border-amber-200'
                            )}
                          >
                            {statusMeta?.label || adm.status || 'Menunggu Verifikasi'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => openModal(adm)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-navy px-3.5 py-1.5 text-xs font-bold text-white hover:bg-navy-deep"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Detail</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal Detail & Verifikasi Pendaftar */}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-navy/10 pb-4">
              <div>
                <p className="font-mono text-xs font-bold text-gold-dark">
                  {selected.registration_number}
                </p>
                <h3 className="text-xl font-extrabold text-navy-deep">
                  {selected.applicant?.full_name}
                </h3>
                <p className="text-xs text-slate-500">
                  {selected.unit?.name} • {selected.period?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full bg-navy-soft p-2 text-navy hover:bg-navy hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 rounded-2xl bg-softgray p-4 text-xs sm:grid-cols-2">
              <div>
                <p className="text-slate-500">TTL / Jenis Kelamin</p>
                <p className="font-bold text-navy-deep">
                  {selected.applicant?.birth_place}, {selected.applicant?.birth_date} (
                  {selected.applicant?.gender === 'L' ? 'Laki-laki' : 'Perempuan'})
                </p>
              </div>
              <div>
                <p className="text-slate-500">Asal Sekolah</p>
                <p className="font-bold text-navy-deep">
                  {selected.applicant?.previous_school || '-'}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Orang Tua (Ayah / Ibu)</p>
                <p className="font-bold text-navy-deep">
                  {selected.guardian?.father_name} / {selected.guardian?.mother_name}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Telepon / WhatsApp</p>
                <p className="font-bold text-navy-deep">{selected.guardian?.phone}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-slate-500">Alamat Siswa</p>
                <p className="font-semibold text-navy-deep">{selected.applicant?.address}</p>
              </div>
            </div>

            {/* Dokumen Persyaratan (Signed URL) */}
            <div className="mt-5">
              <h4 className="text-sm font-extrabold text-navy-deep">
                Dokumen Persyaratan (Bucket Privat)
              </h4>
              <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {(selected.documents ?? []).map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    disabled={docLoadingId === doc.id}
                    onClick={() => handleOpenDocument(selected.id, doc.id)}
                    className="flex items-center justify-between rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-left text-xs hover:bg-navy-soft"
                  >
                    <div>
                      <p className="font-bold text-navy-deep">{doc.document_label}</p>
                      <p className="text-[11px] text-slate-500">{doc.file_name}</p>
                    </div>
                    {docLoadingId === doc.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-navy" />
                    ) : (
                      <ExternalLink className="h-4 w-4 text-navy" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Update Status */}
            {canVerify && (
              <form
                onSubmit={handleStatusUpdate}
                className="mt-6 space-y-4 border-t border-navy/10 pt-5"
              >
                <h4 className="text-sm font-extrabold text-navy-deep">
                  Perbarui Status Verifikasi
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-navy">Status Baru</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as AdmissionStatus)}
                      className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2.5 text-sm font-semibold text-navy"
                    >
                      {Object.entries(ADMISSION_STATUS_META).map(([key, meta]) => (
                        <option key={key} value={key}>
                          {meta.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy">
                      Catatan Panitia (Opsional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Berkas lengkap / mohon unggah ulang KK"
                      className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2.5 text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-sm font-extrabold text-navy-deep hover:bg-gold-light disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    <span>Simpan Status & Sinkronkan</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
