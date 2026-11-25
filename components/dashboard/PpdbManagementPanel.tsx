'use client';

import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  Download,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { AdminDashboardPayload } from '@/lib/data/admin-repository';
import {
  ADMISSION_STATUS_META,
  cn,
  formatDateTimeId,
  getAdmissionStatusMeta,
} from '@/lib/utils';
import type { AdmissionPeriod, AdmissionRecord, AdmissionStatus, EducationUnit } from '@/types/database';

interface PpdbManagementPanelProps {
  admissions: AdmissionRecord[];
  syncLogs: AdminDashboardPayload['syncLogs'];
  canVerify: boolean;
  onRefresh: () => void;
  isSuperAdmin?: boolean;
  units?: EducationUnit[];
  admissionPeriods?: AdmissionPeriod[];
}

export function PpdbManagementPanel({
  admissions,
  syncLogs,
  canVerify,
  onRefresh,
  isSuperAdmin = false,
  units = [],
  admissionPeriods = [],
}: PpdbManagementPanelProps) {
  // Sub tabs: 'list' (Daftar Pendaftar), 'periods' (Gelombang PPDB), 'cleanup' (Pembersihan & Hapus Massal)
  const [subTab, setSubTab] = useState<'list' | 'periods' | 'cleanup'>('list');

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [unitFilter, setUnitFilter] = useState<string>('ALL');
  const [periodFilter, setPeriodFilter] = useState<string>('ALL');

  // Selection states for batch operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal Detail states
  const [selected, setSelected] = useState<AdmissionRecord | null>(null);
  const [newStatus, setNewStatus] = useState<AdmissionStatus>('menunggu_verifikasi');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [docLoadingId, setDocLoadingId] = useState<string | null>(null);

  // Deletion loading states
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Mass deletion states
  const [cleanupTargetUnit, setCleanupTargetUnit] = useState<string>(units[0]?.id ?? '');
  const [cleanupTargetPeriod, setCleanupTargetPeriod] = useState<string>(admissionPeriods[0]?.id ?? '');
  const [showPurgeAllModal, setShowPurgeAllModal] = useState(false);
  const [purgeConfirmationText, setPurgeConfirmationText] = useState('');

  // Periods state
  const [localPeriods, setLocalPeriods] = useState<AdmissionPeriod[]>(admissionPeriods);

  // Sync filtered list
  const filteredAdmissions = useMemo(() => {
    return admissions.filter((a) => {
      const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
      const matchUnit = unitFilter === 'ALL' || a.unit_id === unitFilter;
      const matchPeriod = periodFilter === 'ALL' || a.period_id === periodFilter;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        a.registration_number.toLowerCase().includes(q) ||
        (a.applicant?.full_name ?? '').toLowerCase().includes(q) ||
        (a.guardian?.phone ?? '').toLowerCase().includes(q);
      return matchStatus && matchUnit && matchPeriod && matchSearch;
    });
  }, [admissions, search, statusFilter, unitFilter, periodFilter]);

  // Checkbox multi-select handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredAdmissions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAdmissions.map((a) => a.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Open modal detail
  const openModal = (record: AdmissionRecord) => {
    setSelected(record);
    setNewStatus(record.status);
    setNotes(record.verification_notes ?? '');
    setFeedback('');
    setErrorMessage('');
  };

  // Update status verifikasi
  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    setFeedback('');
    setErrorMessage('');

    try {
      const res = await fetch(`/api/admin/admissions/${selected.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, verificationNotes: notes }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal memperbarui status.');
      setFeedback('Status verifikasi berhasil diperbarui.');
      setSelected(null);
      onRefresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
    }
  };

  // Buka dokumen privat
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

  // Ekspor CSV (Mendukung data terfilter, data terpilih, atau seluruh data)
  const exportCsv = (recordsToExport = filteredAdmissions, filenameSuffix = 'semua') => {
    const headers = [
      'No Pendaftaran',
      'Unit',
      'Nama Calon Siswa',
      'JK',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Nama Ayah',
      'Nama Ibu',
      'No Telepon/WA',
      'Status Verifikasi',
      'Catatan Panitia',
      'Tanggal Daftar',
    ];
    const rows = recordsToExport.map((a) => [
      a.registration_number,
      a.unit?.name ?? '',
      a.applicant?.full_name ?? '',
      a.applicant?.gender ?? '',
      a.applicant?.birth_place ?? '',
      a.applicant?.birth_date ?? '',
      a.guardian?.father_name ?? '',
      a.guardian?.mother_name ?? '',
      a.guardian?.phone ?? '',
      getAdmissionStatusMeta(a.status)?.label ?? a.status,
      a.verification_notes ?? '',
      a.submitted_at,
    ]);
    const csv = [headers, ...rows]
      .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cadangan-ppdb-${filenameSuffix}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 1. HAPUS DATA SATUAN
  const handleDeleteSingle = async (id: string, regNo: string) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus data pendaftar "${regNo}" secara permanen? Data dan berkas yang dihapus tidak dapat dipulihkan.`
    );
    if (!confirmDelete) return;

    setDeletingId(id);
    setFeedback('');
    setErrorMessage('');
    try {
      const res = await fetch(`/api/admin/admissions/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menghapus data.');
      setFeedback(`Data pendaftar "${regNo}" berhasil dihapus permanen.`);
      if (selected?.id === id) setSelected(null);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      onRefresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal menghapus pendaftar.');
    } finally {
      setDeletingId(null);
    }
  };

  // 2. HAPUS DATA PILIHAN (BATCH MULTI-SELECT)
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus ${selectedIds.length} data pendaftar terpilih secara permanen? Pastikan Anda telah mengunduh cadangan terlebih dahulu.`
    );
    if (!confirmDelete) return;

    setBatchDeleting(true);
    setFeedback('');
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/admissions/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'selected', ids: selectedIds }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menghapus data terpilih.');
      setFeedback(json.message || `${selectedIds.length} data pendaftar berhasil dihapus.`);
      setSelectedIds([]);
      onRefresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal menghapus data pilihan.');
    } finally {
      setBatchDeleting(false);
    }
  };

  // 3. HAPUS BERDASARKAN UNIT
  const handleDeleteByUnit = async () => {
    if (!cleanupTargetUnit) return;
    const targetUnitObj = units.find((u) => u.id === cleanupTargetUnit);
    const unitName = targetUnitObj?.name ?? 'Unit Terpilih';
    const count = admissions.filter((a) => a.unit_id === cleanupTargetUnit).length;

    if (count === 0) {
      alert(`Tidak ada data pendaftar pada ${unitName}.`);
      return;
    }

    const confirmDelete = window.confirm(
      `PERINGATAN: Anda akan menghapus SELURUH (${count}) data pendaftar pada ${unitName}.\n\nApakah Anda sudah mengunduh cadangan data?\nLanjutkan penghapusan permanen?`
    );
    if (!confirmDelete) return;

    setBatchDeleting(true);
    setFeedback('');
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/admissions/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'by_unit', unit_id: cleanupTargetUnit }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menghapus data unit.');
      setFeedback(json.message);
      setSelectedIds([]);
      onRefresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal memproses penghapusan unit.');
    } finally {
      setBatchDeleting(false);
    }
  };

  // 4. HAPUS BERDASARKAN PERIODE
  const handleDeleteByPeriod = async () => {
    if (!cleanupTargetPeriod) return;
    const targetPeriodObj = admissionPeriods.find((p) => p.id === cleanupTargetPeriod);
    const periodName = targetPeriodObj?.name ?? 'Periode Terpilih';
    const count = admissions.filter((a) => a.period_id === cleanupTargetPeriod).length;

    if (count === 0) {
      alert(`Tidak ada data pendaftar pada periode "${periodName}".`);
      return;
    }

    const confirmDelete = window.confirm(
      `PERINGATAN: Anda akan menghapus SELURUH (${count}) data pendaftar pada periode "${periodName}".\n\nLanjutkan penghapusan permanen?`
    );
    if (!confirmDelete) return;

    setBatchDeleting(true);
    setFeedback('');
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/admissions/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'by_period', period_id: cleanupTargetPeriod }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menghapus data periode.');
      setFeedback(json.message);
      setSelectedIds([]);
      onRefresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal memproses penghapusan periode.');
    } finally {
      setBatchDeleting(false);
    }
  };

  // 5. HAPUS SEMUA DATA PPDB (KHUSUS KETUA YAYASAN)
  const handlePurgeAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (purgeConfirmationText !== 'HAPUS SEMUA DATA PPDB') {
      alert('Teks konfirmasi tidak sesuai. Harap ketik "HAPUS SEMUA DATA PPDB" dengan huruf kapital.');
      return;
    }

    setBatchDeleting(true);
    setFeedback('');
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/admissions/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'all', confirmationText: purgeConfirmationText }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal membersihkan database PPDB.');
      setFeedback(json.message || 'Seluruh data PPDB berhasil dibersihkan permanen.');
      setShowPurgeAllModal(false);
      setPurgeConfirmationText('');
      setSelectedIds([]);
      onRefresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal melakukan pembersihan total.');
    } finally {
      setBatchDeleting(false);
    }
  };

  // Toggle buka/tutup gelombang
  const handleTogglePeriod = async (period: AdmissionPeriod) => {
    const nextIsOpen = !period.is_open;
    setLocalPeriods((prev) =>
      prev.map((item) => (item.id === period.id ? { ...item, is_open: nextIsOpen } : item))
    );
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource: 'admission_periods',
          action: 'update',
          id: period.id,
          payload: { is_open: nextIsOpen, quota: period.quota },
        }),
      });
      if (!res.ok) throw new Error('Gagal memperbarui status gelombang.');
      setFeedback(`Status "${period.name}" berhasil diubah menjadi ${nextIsOpen ? 'Dibuka' : 'Ditutup'}.`);
      onRefresh();
    } catch (err) {
      alert('Gagal mengubah status gelombang.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs PPDB */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy/10 pb-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSubTab('list')}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
              subTab === 'list'
                ? 'bg-navy text-white shadow-sm'
                : 'bg-white text-navy ring-1 ring-navy/15 hover:bg-navy-soft'
            }`}
          >
            Data Pendaftar ({admissions.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('periods')}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
              subTab === 'periods'
                ? 'bg-navy text-white shadow-sm'
                : 'bg-white text-navy ring-1 ring-navy/15 hover:bg-navy-soft'
            }`}
          >
            Gelombang & Kuota PPDB
          </button>
          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setSubTab('cleanup')}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                subTab === 'cleanup'
                  ? 'bg-rose-700 text-white shadow-sm'
                  : 'bg-white text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50'
              }`}
            >
              Pembersihan & Hapus Massal
            </button>
          )}
        </div>

        {/* Tombol Cadangkan Data */}
        <button
          type="button"
          onClick={() => exportCsv(admissions, 'lengkap')}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-navy ring-1 ring-navy/15 hover:bg-navy-soft transition-colors"
        >
          <Download className="h-3.5 w-3.5 text-gold-dark" />
          <span>Cadangkan Data (CSV)</span>
        </button>
      </div>

      {feedback && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800">
          {feedback}
        </div>
      )}
      {errorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-800">
          {errorMessage}
        </div>
      )}

      {/* =================================================================== */}
      {/* 1. SUB-TAB: DAFTAR DATA PENDAFTAR */}
      {/* =================================================================== */}
      {subTab === 'list' && (
        <div className="space-y-4">
          {/* Toolbar Pencarian & Filter */}
          <div className="flex flex-col gap-3 rounded-2xl border border-navy/10 bg-white p-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nomor pendaftaran, nama siswa, atau no WhatsApp ortu..."
                className="w-full rounded-xl border border-navy/15 py-2.5 pl-9 pr-3 text-sm focus:border-navy focus:outline-none"
              />
            </div>

            {/* Filter Unit (Khusus Super Admin) */}
            {isSuperAdmin && units.length > 0 && (
              <select
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
                className="rounded-xl border border-navy/15 bg-white px-3 py-2 text-xs font-bold text-navy"
              >
                <option value="ALL">Semua Unit (RA, MI, SMP)</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            )}

            {/* Filter Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-navy/15 bg-white px-3 py-2 text-xs font-bold text-navy"
            >
              <option value="ALL">Semua Status</option>
              {Object.entries(ADMISSION_STATUS_META).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Toolbar untuk Item Terpilih (Batch Delete / Export) */}
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-navy/20 bg-navy-soft/60 p-4">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-navy px-3 py-1 text-xs font-extrabold text-white">
                  {selectedIds.length} Pendaftar Terpilih
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-xs font-semibold text-slate-500 hover:text-navy underline"
                >
                  Batal Pilih
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const toExport = admissions.filter((a) => selectedIds.includes(a.id));
                    exportCsv(toExport, 'terpilih');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-navy ring-1 ring-navy/15"
                >
                  <Download className="h-3.5 w-3.5 text-gold-dark" />
                  <span>Ekspor Pilihan</span>
                </button>
                <button
                  type="button"
                  disabled={batchDeleting}
                  onClick={handleDeleteSelected}
                  className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  {batchDeleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  <span>Hapus {selectedIds.length} Data Terpilih</span>
                </button>
              </div>
            </div>
          )}

          {/* Tabel / Kartu Pendaftar */}
          <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white">
            {filteredAdmissions.length === 0 ? (
              <div className="p-12 text-center text-sm text-slate-500">
                Tidak ada data pendaftar yang sesuai kriteria pencarian.
              </div>
            ) : (
              <>
                {/* Mobile Cards View */}
                <div className="divide-y divide-navy/10 md:hidden">
                  {filteredAdmissions.map((adm) => {
                    const statusMeta = getAdmissionStatusMeta(adm.status);
                    const isChecked = selectedIds.includes(adm.id);
                    return (
                      <div key={adm.id} className="p-4 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleSelectOne(adm.id)}
                              className="h-4 w-4 rounded border-navy/30 text-navy"
                            />
                            <span className="font-mono text-xs font-extrabold text-navy-deep">
                              {adm.registration_number}
                            </span>
                          </label>
                          <span
                            className={cn(
                              'rounded-full border px-2.5 py-0.5 text-[11px] font-bold',
                              statusMeta?.badgeClass || 'bg-amber-50 text-amber-800 border-amber-200'
                            )}
                          >
                            {statusMeta?.label || adm.status}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-navy-deep">{adm.applicant?.full_name}</p>
                        <p className="text-xs text-slate-500">
                          {adm.unit?.name} • WA: {adm.guardian?.phone}
                        </p>
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-navy/5">
                          <button
                            type="button"
                            onClick={() => openModal(adm)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-navy-soft px-3.5 py-1.5 text-xs font-bold text-navy"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Periksa Detail</span>
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === adm.id}
                            onClick={() => handleDeleteSingle(adm.id, adm.registration_number)}
                            className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100"
                          >
                            {deletingId === adm.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table View */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-softgray text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3 w-10">
                          <input
                            type="checkbox"
                            checked={
                              filteredAdmissions.length > 0 &&
                              selectedIds.length === filteredAdmissions.length
                            }
                            onChange={handleToggleSelectAll}
                            className="h-4 w-4 rounded border-navy/30 text-navy"
                          />
                        </th>
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
                        const statusMeta = getAdmissionStatusMeta(adm.status);
                        const isChecked = selectedIds.includes(adm.id);
                        return (
                          <tr key={adm.id} className="hover:bg-navy-soft/30 transition-colors">
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleSelectOne(adm.id)}
                                className="h-4 w-4 rounded border-navy/30 text-navy"
                              />
                            </td>
                            <td className="px-4 py-3 font-mono text-xs font-bold text-navy-deep">
                              {adm.registration_number}
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-bold text-navy-deep">{adm.applicant?.full_name}</p>
                              <p className="text-[11px] text-slate-500">
                                {formatDateTimeId(adm.submitted_at)}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-xs font-semibold text-navy">
                              {adm.unit?.name}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-600">
                              {adm.guardian?.phone || '-'}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={cn(
                                  'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold',
                                  statusMeta?.badgeClass || 'bg-amber-50 text-amber-800 border-amber-200'
                                )}
                              >
                                {statusMeta?.label || adm.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openModal(adm)}
                                  className="inline-flex items-center gap-1.5 rounded-full bg-navy px-3.5 py-1.5 text-xs font-bold text-white hover:bg-navy-deep"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  <span>Detail</span>
                                </button>
                                <button
                                  type="button"
                                  title="Hapus Data Pendaftar"
                                  disabled={deletingId === adm.id}
                                  onClick={() => handleDeleteSingle(adm.id, adm.registration_number)}
                                  className="inline-flex items-center rounded-full bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 disabled:opacity-50"
                                >
                                  {deletingId === adm.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </div>
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
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. SUB-TAB: GELOMBANG & KUOTA PPDB */}
      {/* =================================================================== */}
      {subTab === 'periods' && (
        <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6 space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-navy-deep">
              Status Gelombang & Kuota Penerimaan
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik tombol untuk membuka atau menutup pendaftaran secara langsung bagi masing-masing gelombang unit.
            </p>
          </div>

          <div className="divide-y divide-navy/10 rounded-2xl border border-navy/10">
            {localPeriods.map((p) => {
              const unitName = units.find((u) => u.id === p.unit_id)?.name ?? '-';
              return (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-bold text-navy-deep">
                      {unitName} — {p.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Kuota: <strong>{p.quota} siswa</strong> • Jadwal: {p.start_date} s.d. {p.end_date}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePeriod(p)}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                      p.is_open
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {p.is_open ? 'Dibuka (Klik untuk Tutup)' : 'Ditutup (Klik untuk Buka)'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. SUB-TAB: PEMBERSIHAN & PENGHAPUSAN MASSAL (KETUA YAYASAN) */}
      {/* =================================================================== */}
      {subTab === 'cleanup' && isSuperAdmin && (
        <div className="space-y-6">
          {/* Card Hapus Berdasarkan Unit */}
          <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-navy-deep">
              <Filter className="h-5 w-5 text-gold-dark" />
              <h3 className="text-base font-extrabold">Hapus Data Berdasarkan Unit Pendidikan</h3>
            </div>
            <p className="text-xs text-slate-500">
              Gunakan fungsi ini untuk menghapus seluruh pendaftar pada salah satu unit jika diperlukan.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={cleanupTargetUnit}
                onChange={(e) => setCleanupTargetUnit(e.target.value)}
                className="rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-xs font-bold text-navy min-w-[200px]"
              >
                {units.map((u) => {
                  const count = admissions.filter((a) => a.unit_id === u.id).length;
                  return (
                    <option key={u.id} value={u.id}>
                      {u.name} ({count} pendaftar)
                    </option>
                  );
                })}
              </select>

              <button
                type="button"
                onClick={() => {
                  const toExport = admissions.filter((a) => a.unit_id === cleanupTargetUnit);
                  exportCsv(toExport, 'cadangan-unit');
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-navy ring-1 ring-navy/15"
              >
                <Download className="h-3.5 w-3.5 text-gold-dark" />
                <span>Cadangkan Data Unit</span>
              </button>

              <button
                type="button"
                disabled={batchDeleting}
                onClick={handleDeleteByUnit}
                className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus Seluruh Data Unit Ini</span>
              </button>
            </div>
          </div>

          {/* Card Hapus Berdasarkan Periode */}
          <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-navy-deep">
              <Archive className="h-5 w-5 text-gold-dark" />
              <h3 className="text-base font-extrabold">Hapus Data Berdasarkan Periode / Gelombang</h3>
            </div>
            <p className="text-xs text-slate-500">
              Hapus data pendaftar dari gelombang yang telah selesai diselenggarakan untuk mengosongkan kapasitas database.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={cleanupTargetPeriod}
                onChange={(e) => setCleanupTargetPeriod(e.target.value)}
                className="rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-xs font-bold text-navy min-w-[200px]"
              >
                {admissionPeriods.map((p) => {
                  const count = admissions.filter((a) => a.period_id === p.id).length;
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} ({count} pendaftar)
                    </option>
                  );
                })}
              </select>

              <button
                type="button"
                onClick={() => {
                  const toExport = admissions.filter((a) => a.period_id === cleanupTargetPeriod);
                  exportCsv(toExport, 'cadangan-periode');
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-navy ring-1 ring-navy/15"
              >
                <Download className="h-3.5 w-3.5 text-gold-dark" />
                <span>Cadangkan Data Periode</span>
              </button>

              <button
                type="button"
                disabled={batchDeleting}
                onClick={handleDeleteByPeriod}
                className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus Seluruh Data Periode Ini</span>
              </button>
            </div>
          </div>

          {/* Card Hapus SEMUA Data PPDB (Pembersihan Total) */}
          <div className="rounded-2xl border-2 border-rose-300 bg-rose-50/50 p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-800">
              <AlertTriangle className="h-6 w-6 text-rose-600" />
              <h3 className="text-base font-extrabold">Hapus SEMUA Data PPDB (Pembersihan Total Database)</h3>
            </div>
            <p className="text-xs text-rose-900 leading-relaxed">
              Tindakan ini akan menghapus <strong>seluruh {admissions.length} data pendaftar</strong> beserta seluruh berkas dokumen dari semua unit (RA, MI, SMP) secara permanen. Fitur ini dilindungi konfirmasi berlapis agar tidak terjadi kesalahan tidak disengaja.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => exportCsv(admissions, 'cadangan-lengkap-sebelum-pembersihan')}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-extrabold text-navy ring-1 ring-navy/20 hover:bg-navy-soft shadow-sm"
              >
                <Download className="h-4 w-4 text-gold-dark" />
                <span>1. Wajib Unduh Cadangan Lengkap (CSV)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPurgeAllModal(true)}
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-xs font-extrabold text-white hover:bg-rose-700 shadow-md transition-all"
              >
                <Trash2 className="h-4 w-4" />
                <span>2. Buka Konfirmasi Pembersihan Total</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
                <span className="font-mono text-xs font-extrabold text-gold-dark">
                  {selected.registration_number}
                </span>
                <h3 className="text-lg font-extrabold text-navy-deep">
                  {selected.applicant?.full_name}
                </h3>
                <p className="text-xs text-slate-500">
                  {selected.unit?.name} • Terdaftar pada {formatDateTimeId(selected.submitted_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Tutup modal"
                className="rounded-full p-2 text-slate-400 hover:bg-navy-soft hover:text-navy"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Informasi Biodata Calon Siswa & Wali */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              <div className="rounded-2xl bg-softgray p-4 space-y-1.5">
                <p className="font-bold uppercase text-navy">Biodata Siswa</p>
                <p>Jenis Kelamin: {selected.applicant?.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                <p>
                  TTL: {selected.applicant?.birth_place}, {selected.applicant?.birth_date}
                </p>
                <p>Alamat: {selected.applicant?.address}</p>
              </div>
              <div className="rounded-2xl bg-softgray p-4 space-y-1.5">
                <p className="font-bold uppercase text-navy">Data Orang Tua / Wali</p>
                <p>Ayah: {selected.guardian?.father_name || '-'}</p>
                <p>Ibu: {selected.guardian?.mother_name || '-'}</p>
                <p>No. WhatsApp: {selected.guardian?.phone || '-'}</p>
              </div>
            </div>

            {/* Dokumen Lampiran */}
            <div className="mt-5">
              <h4 className="text-xs font-extrabold uppercase text-navy">Berkas Lampiran</h4>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {selected.documents?.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => handleOpenDocument(selected.id, doc.id)}
                    className="flex items-center justify-between rounded-xl border border-navy/10 bg-white p-3 text-left hover:bg-navy-soft transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-navy-deep">{doc.document_label}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{doc.file_name}</p>
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
                  Perbarui Status Verifikasi Pendaftar
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-navy">Status Verifikasi</label>
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
                    <label className="block text-xs font-bold text-navy">Catatan Verifikasi</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Berkas lengkap / silakan daftar ulang"
                      className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    disabled={deletingId === selected.id}
                    onClick={() => handleDeleteSingle(selected.id, selected.registration_number)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                  >
                    {deletingId === selected.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    <span>Hapus Pendaftar Ini</span>
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="ml-auto inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-sm font-extrabold text-navy-deep hover:bg-gold-light disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    <span>Simpan Perubahan Status</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Dialog Konfirmasi Pembersihan Total Database PPDB */}
      {showPurgeAllModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShowPurgeAllModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="h-8 w-8 shrink-0" />
              <div>
                <h3 className="text-lg font-extrabold text-navy-deep">
                  Konfirmasi Pembersihan Total PPDB
                </h3>
                <p className="text-xs text-rose-700 font-bold">Tindakan ini permanen dan tidak dapat diulang</p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-slate-600">
              Anda akan menghapus <strong>seluruh {admissions.length} data pendaftar</strong> dari seluruh unit pendidikan (RA, MI, SMP) beserta semua lampiran dokumennya.
            </p>

            <form onSubmit={handlePurgeAll} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy">
                  Ketik <span className="font-mono text-rose-600 font-extrabold">HAPUS SEMUA DATA PPDB</span> untuk konfirmasi:
                </label>
                <input
                  type="text"
                  required
                  value={purgeConfirmationText}
                  onChange={(e) => setPurgeConfirmationText(e.target.value)}
                  placeholder="HAPUS SEMUA DATA PPDB"
                  className="mt-2 w-full rounded-xl border border-rose-300 p-3 text-sm font-mono tracking-wider focus:border-rose-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPurgeAllModal(false)}
                  className="rounded-full bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={batchDeleting || purgeConfirmationText !== 'HAPUS SEMUA DATA PPDB'}
                  className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-6 py-2.5 text-xs font-extrabold text-white hover:bg-rose-700 disabled:opacity-40 shadow-md"
                >
                  {batchDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span>Konfirmasi Hapus Seluruh Data</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
