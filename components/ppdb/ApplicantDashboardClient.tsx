'use client';

import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  GraduationCap,
  LogOut,
  Plus,
  Printer,
  School,
  User,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ApplicantAccount } from '@/lib/auth/applicant-store';
import { formatDateTimeId, getAdmissionStatusMeta } from '@/lib/utils';
import type { AdmissionRecord } from '@/types/database';

interface ApplicantDashboardClientProps {
  applicant: ApplicantAccount;
  admissions: AdmissionRecord[];
}

export function ApplicantDashboardClient({
  applicant,
  admissions,
}: ApplicantDashboardClientProps) {
  const router = useRouter();
  const [selectedReceipt, setSelectedReceipt] = useState<AdmissionRecord | null>(null);

  const handleLogout = async () => {
    try {
      await fetch('/api/ppdb/auth/logout', { method: 'POST' });
    } catch {}
    window.location.href = '/ppdb/masuk';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Profil Wali Santri Bar */}
      <div className="flex flex-col gap-4 rounded-3xl border border-navy/10 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy text-white shadow-sm">
            <User className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gold-dark">
              Akun Wali Santri
            </p>
            <h2 className="text-lg font-extrabold text-navy-deep sm:text-xl">
              {applicant.full_name}
            </h2>
            <p className="text-xs text-slate-500">
              WhatsApp: <strong>{applicant.phone}</strong> {applicant.email ? `• ${applicant.email}` : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/ppdb"
            className="inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-xs font-bold text-navy-deep shadow-sm hover:bg-gold-light transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Daftar Siswa Baru</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-full border border-navy/15 bg-white px-4 py-2 text-xs font-bold text-navy hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Riwayat Pendaftaran */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-navy-deep">
              Riwayat Pendaftaran Santri / Siswa ({admissions.length})
            </h3>
            <p className="text-xs text-slate-500">
              Berikut daftar calon siswa yang terhubung dengan nomor WhatsApp akun Anda.
            </p>
          </div>
        </div>

        {admissions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-navy/20 bg-white p-12 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-slate-300" />
            <h4 className="mt-3 text-base font-bold text-navy-deep">
              Belum Ada Pendaftaran Terdaftar
            </h4>
            <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
              Anda belum mendaftarkan calon siswa. Silakan klik tombol di bawah untuk memulai pengisian formulir PPDB online.
            </p>
            <Link
              href="/ppdb"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-navy-deep transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Mulai Pendaftaran PPDB Sekarang</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {admissions.map((adm) => {
              const statusMeta = getAdmissionStatusMeta(adm.status);
              return (
                <div
                  key={adm.id}
                  className="overflow-hidden rounded-3xl border border-navy/10 bg-white p-6 shadow-card transition-all hover:shadow-cardHover"
                >
                  <div className="flex flex-col gap-3 border-b border-navy/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-extrabold text-navy-deep">
                          {adm.registration_number}
                        </span>
                        <span className="rounded-md bg-navy-soft px-2 py-0.5 text-[11px] font-bold text-navy">
                          {adm.unit?.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {adm.academic_year?.name} • {adm.period?.name}
                        </span>
                      </div>
                      <h4 className="mt-1 text-lg font-extrabold text-navy-deep">
                        {adm.applicant?.full_name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                          statusMeta?.badgeClass || 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {statusMeta?.label || adm.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedReceipt(adm)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-navy-soft px-3.5 py-1 text-xs font-bold text-navy hover:bg-navy hover:text-white transition-colors"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        <span>Bukti Daftar</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 text-xs sm:grid-cols-3">
                    <div>
                      <p className="text-slate-400">Tempat, Tanggal Lahir</p>
                      <p className="font-semibold text-navy">
                        {adm.applicant?.birth_place}, {adm.applicant?.birth_date} (
                        {adm.applicant?.gender === 'L' ? 'Laki-laki' : 'Perempuan'})
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Asal Sekolah</p>
                      <p className="font-semibold text-navy">
                        {adm.applicant?.previous_school || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Waktu Pengiriman</p>
                      <p className="font-semibold text-navy">
                        {formatDateTimeId(adm.submitted_at)}
                      </p>
                    </div>
                  </div>

                  {/* Catatan Panitia */}
                  {adm.verification_notes && (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900">
                      <p className="font-bold">📝 Catatan Panitia Verifikator:</p>
                      <p className="mt-1">{adm.verification_notes}</p>
                    </div>
                  )}

                  {/* Linimasa Status */}
                  {adm.status_logs && adm.status_logs.length > 0 && (
                    <div className="mt-4 border-t border-navy/5 pt-3">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Riwayat Verifikasi:
                      </p>
                      <div className="mt-2 space-y-1.5">
                        {adm.status_logs.map((log) => {
                          const meta = getAdmissionStatusMeta(log.new_status);
                          return (
                            <div
                              key={log.id}
                              className="flex items-center justify-between text-xs text-slate-600 bg-softgray/50 px-3 py-1.5 rounded-xl"
                            >
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-navy/40" />
                                <span className="font-semibold text-navy">{meta?.label}</span>
                                {log.notes && <span className="text-slate-500">— {log.notes}</span>}
                              </div>
                              <span className="font-mono text-[11px] text-slate-400 shrink-0">
                                {formatDateTimeId(log.created_at)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Bukti Pendaftaran (Printable Receipt) */}
      {selectedReceipt && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedReceipt(null)}
        >
          <div
            className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b-2 border-navy/20 pb-4 text-center">
              <h3 className="text-lg font-black tracking-tight text-navy-deep uppercase">
                Bukti Pendaftaran PPDB Online
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                Yayasan Muhammad Tahir Garut • Tahun Ajaran {selectedReceipt.academic_year?.name}
              </p>
            </div>

            <div className="my-5 rounded-2xl bg-softgray p-4 text-center font-mono">
              <p className="text-xs text-slate-500">Nomor Registrasi Resmi</p>
              <p className="mt-0.5 text-2xl font-black text-navy-deep">
                {selectedReceipt.registration_number}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-slate-400">Nama Calon Siswa</dt>
                <dd className="font-bold text-navy-deep">
                  {selectedReceipt.applicant?.full_name}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Unit Sekolah Dituju</dt>
                <dd className="font-bold text-navy-deep">
                  {selectedReceipt.unit?.name}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Tempat, Tanggal Lahir</dt>
                <dd className="font-semibold text-navy">
                  {selectedReceipt.applicant?.birth_place}, {selectedReceipt.applicant?.birth_date}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Nama Orang Tua / Wali</dt>
                <dd className="font-semibold text-navy">
                  {selectedReceipt.guardian?.father_name || applicant.full_name}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">No. WhatsApp Wali</dt>
                <dd className="font-semibold text-navy">
                  {selectedReceipt.guardian?.phone || applicant.phone}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Status Saat Ini</dt>
                <dd className="font-bold text-gold-dark uppercase">
                  {getAdmissionStatusMeta(selectedReceipt.status)?.label}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5 border-t border-navy/10 pt-4">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-xs font-bold text-white hover:bg-navy-deep transition-colors"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Cetak Lembar Bukti</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
