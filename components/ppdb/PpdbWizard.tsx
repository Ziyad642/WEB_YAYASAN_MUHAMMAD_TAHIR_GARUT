'use client';

import confetti from 'canvas-confetti';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Loader2,
  Printer,
  ShieldCheck,
  Upload,
  User,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ADMISSION_STATUS_META, cn, formatDateTimeId } from '@/lib/utils';
import type { ApplicantAccount } from '@/lib/auth/applicant-store';
import type {
  AcademicYear,
  AdmissionPeriod,
  EducationUnit,
} from '@/types/database';

interface PpdbWizardProps {
  units: EducationUnit[];
  academicYears: AcademicYear[];
  periods: AdmissionPeriod[];
  initialUnitSlug?: string;
  applicant?: ApplicantAccount | null;
}

interface SubmitSuccessData {
  registrationNumber: string;
  admissionId: string;
  submittedAt: string;
  unitName: string;
  academicYear: string;
  periodName: string;
  applicantName: string;
  status: string;
  googleSyncStatus: 'pending' | 'success' | 'failed';
}

const STEPS = [
  { id: 1, title: 'Pilih Unit', icon: ShieldCheck },
  { id: 2, title: 'Data Siswa', icon: User },
  { id: 3, title: 'Orang Tua', icon: Users },
  { id: 4, title: 'Dokumen', icon: Upload },
  { id: 5, title: 'Konfirmasi', icon: ClipboardCheck },
];

export function PpdbWizard({
  units,
  academicYears,
  periods,
  initialUnitSlug,
  applicant,
}: PpdbWizardProps) {
  const defaultUnit =
    units.find((u) => u.slug === initialUnitSlug) ?? units[0];

  const [step, setStep] = useState<number>(1);
  const [unitId, setUnitId] = useState<string>(defaultUnit?.id ?? '');
  const availablePeriods = useMemo(
    () => periods.filter((p) => p.unit_id === unitId && p.is_open),
    [periods, unitId]
  );

  const [periodId, setPeriodId] = useState<string>(() => {
    const first = periods.find((p) => p.unit_id === (defaultUnit?.id ?? '') && p.is_open);
    return first?.id ?? '';
  });

  // Tahap 2: Data Calon Siswa
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [previousSchool, setPreviousSchool] = useState('');
  const [nisn, setNisn] = useState('');

  // Tahap 3: Data Orang Tua/Wali (Pre-filled dengan akun Wali Santri jika ada)
  const [fatherName, setFatherName] = useState(applicant?.full_name ?? '');
  const [motherName, setMotherName] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [phone, setPhone] = useState(applicant?.phone ?? '');
  const [email, setEmail] = useState(applicant?.email ?? '');
  const [parentAddress, setParentAddress] = useState('');

  // Tahap 4: Dokumen Persyaratan
  const [files, setFiles] = useState<Record<string, File>>({});

  // Tahap 5: Pernyataan & Submit
  const [statementAgreed, setStatementAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<SubmitSuccessData | null>(null);

  const selectedUnit = units.find((u) => u.id === unitId) ?? units[0];
  const selectedPeriod =
    availablePeriods.find((p) => p.id === periodId) ?? availablePeriods[0];
  const selectedYear =
    academicYears.find((ay) => ay.id === selectedPeriod?.academic_year_id) ??
    academicYears[0];

  const handleSelectUnit = (newUnitId: string) => {
    setUnitId(newUnitId);
    const matchingPeriod = periods.find((p) => p.unit_id === newUnitId && p.is_open);
    setPeriodId(matchingPeriod?.id ?? '');
    setErrorMsg('');
  };

  const handleFileChange = (docKey: string, file: File | null) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
      setErrorMsg('Format file harus JPG, PNG, atau PDF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran file maksimal 5MB.');
      return;
    }
    setErrorMsg('');
    setFiles((prev) => ({ ...prev, [docKey]: file }));
  };

  const validateCurrentStep = (): boolean => {
    setErrorMsg('');
    if (step === 1) {
      if (!unitId) {
        setErrorMsg('Pilih salah satu unit pendidikan.');
        return false;
      }
      if (!selectedPeriod) {
        setErrorMsg('Belum ada gelombang PPDB yang dibuka untuk unit ini.');
        return false;
      }
    }
    if (step === 2) {
      if (fullName.trim().length < 3) {
        setErrorMsg('Nama lengkap calon siswa minimal 3 karakter.');
        return false;
      }
      if (!birthPlace.trim() || !birthDate) {
        setErrorMsg('Tempat dan tanggal lahir calon siswa wajib diisi.');
        return false;
      }
      if (address.trim().length < 8) {
        setErrorMsg('Alamat lengkap calon siswa minimal 8 karakter.');
        return false;
      }
    }
    if (step === 3) {
      if (fatherName.trim().length < 2 || motherName.trim().length < 2) {
        setErrorMsg('Nama ayah dan nama ibu wajib diisi.');
        return false;
      }
      if (phone.trim().length < 9) {
        setErrorMsg('Nomor telepon/WhatsApp orang tua wajib diisi dengan benar.');
        return false;
      }
      if (parentAddress.trim().length < 8) {
        setErrorMsg('Alamat orang tua/wali minimal 8 karakter.');
        return false;
      }
    }
    if (step === 4 && selectedUnit) {
      for (const doc of selectedUnit.required_documents) {
        if (doc.required && !files[doc.key]) {
          setErrorMsg(`Dokumen wajib "${doc.label}" belum diunggah.`);
          return false;
        }
      }
    }
    return true;
  };

  const goNext = () => {
    if (validateCurrentStep()) {
      setStep((s) => Math.min(5, s + 1));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;
    if (!statementAgreed) {
      setErrorMsg('Anda wajib mencentang pernyataan kebenaran data.');
      return;
    }
    if (!selectedPeriod || !selectedYear || !selectedUnit) {
      setErrorMsg('Pilihan unit atau periode pendaftaran belum lengkap.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        unitId: selectedUnit.id,
        academicYearId: selectedYear.id,
        periodId: selectedPeriod.id,
        applicant: {
          fullName: fullName.trim(),
          gender,
          birthPlace: birthPlace.trim(),
          birthDate,
          address: address.trim(),
          previousSchool: previousSchool.trim(),
          nisn: nisn.trim(),
        },
        guardian: {
          fatherName: fatherName.trim(),
          motherName: motherName.trim(),
          guardianName: guardianName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          parentAddress: parentAddress.trim(),
        },
        statementAgreed: true as const,
      };

      const formData = new FormData();
      formData.append('payload', JSON.stringify(payload));
      for (const reqDoc of selectedUnit.required_documents) {
        const file = files[reqDoc.key];
        if (file) {
          formData.append(`doc_${reqDoc.key}`, file);
          formData.append(`label_${reqDoc.key}`, reqDoc.label);
        }
      }

      const response = await fetch('/api/ppdb/submit', {
        method: 'POST',
        body: formData,
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Gagal mengirim pendaftaran.');
      }

      setReceipt(json.data as SubmitSuccessData);
      confetti({
        particleCount: 70,
        spread: 65,
        origin: { y: 0.6 },
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.');
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================================
  // TAMPILAN BUKTI PENDAFTARAN (SETELAH BERHASIL SUBMIT)
  // =========================================================================
  if (receipt) {
    const statusMeta = ADMISSION_STATUS_META.menunggu_verifikasi;
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-navy/10 bg-white p-6 shadow-card sm:p-10 print:border-0 print:shadow-none">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-gold-dark">
            Bukti Pendaftaran Resmi PPDB Online
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-navy-deep sm:text-3xl">
            Pendaftaran Berhasil Dikirim!
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Simpan nomor pendaftaran berikut untuk memantau status verifikasi secara berkala.
          </p>
        </div>

        <div className="mt-6 rounded-2xl bg-navy-deep p-6 text-center text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-light">
            Nomor Pendaftaran Anda
          </p>
          <p className="mt-2 font-mono text-2xl font-extrabold tracking-wider text-gold sm:text-4xl">
            {receipt.registrationNumber}
          </p>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 rounded-2xl bg-softgray p-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">Nama Calon Siswa</dt>
            <dd className="font-bold text-navy-deep">{receipt.applicantName}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Unit Pendidikan</dt>
            <dd className="font-bold text-navy-deep">{receipt.unitName}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Tahun Ajaran / Gelombang</dt>
            <dd className="font-semibold text-navy-deep">
              {receipt.academicYear} — {receipt.periodName}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Tanggal Pengiriman</dt>
            <dd className="font-semibold text-navy-deep">{formatDateTimeId(receipt.submittedAt)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Status Pendaftaran</dt>
            <dd className="mt-1">
              <span
                className={cn(
                  'inline-flex rounded-full border px-3 py-0.5 text-xs font-bold',
                  statusMeta.badgeClass
                )}
              >
                {statusMeta.label}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Rekap Google Sheets</dt>
            <dd className="mt-1 text-xs font-semibold text-slate-700">
              {receipt.googleSyncStatus === 'success'
                ? 'Tersinkron otomatis ke rekap yayasan'
                : 'Tersimpan di database utama (antrean sinkronisasi admin)'}
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full border border-navy/20 bg-white px-6 py-2.5 text-sm font-bold text-navy hover:bg-navy-soft"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak Bukti Pendaftaran</span>
          </button>
          <Link
            href="/ppdb/riwayat"
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-navy px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-navy-deep"
          >
            <Users className="h-4 w-4" />
            <span>Lihat di Riwayat Akun</span>
          </Link>
          <Link
            href={`/cek-pendaftaran?nomor=${encodeURIComponent(receipt.registrationNumber)}`}
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-gold px-6 py-2.5 text-sm font-extrabold text-navy-deep shadow-gold hover:bg-gold-light"
          >
            <span>Cek Status Pendaftaran</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Banner Akun Wali Santri */}
      <div className="mb-6 flex flex-col gap-2 rounded-2xl border border-gold/40 bg-gradient-to-r from-amber-50 to-amber-100/40 p-4 text-xs sm:flex-row sm:items-center sm:justify-between">
        {applicant ? (
          <>
            <div>
              <p className="font-bold text-navy-deep">
                ✅ Masuk sebagai Wali Santri: <span className="text-gold-dark font-extrabold">{applicant.full_name}</span> ({applicant.phone})
              </p>
              <p className="mt-0.5 text-slate-600">
                Pendaftaran ini otomatis terhubung permanen ke akun Anda. Anda dapat memantau status verifikasi kapan saja.
              </p>
            </div>
            <Link
              href="/ppdb/riwayat"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-navy px-4 py-1.5 font-bold text-white shadow-sm hover:bg-navy-deep transition-all"
            >
              <span>Riwayat Pendaftaran</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </>
        ) : (
          <>
            <div>
              <p className="font-bold text-navy-deep">
                💡 Ingin Riwayat Pendaftaran Tersimpan Otomatis di Akun Anda?
              </p>
              <p className="mt-0.5 text-slate-600">
                Masuk atau daftar akun Wali Santri agar seluruh berkas dan status calon siswa dapat dipantau & dicetak kapan saja.
              </p>
            </div>
            <Link
              href="/ppdb/masuk?redirect=/ppdb"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-navy px-4 py-1.5 font-bold text-white shadow-sm hover:bg-navy-deep transition-all"
            >
              <span>Masuk / Buat Akun</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </>
        )}
      </div>

      {/* Progress Stepper */}
      <nav aria-label="Tahapan formulir PPDB" className="mb-8">
        <ol className="grid grid-cols-5 gap-2 sm:gap-4">
          {STEPS.map((item) => {
            const Icon = item.icon;
            const active = step === item.id;
            const completed = step > item.id;
            return (
              <li
                key={item.id}
                className={cn(
                  'flex flex-col items-center rounded-2xl border p-2.5 text-center transition-all sm:p-3',
                  active
                    ? 'border-navy bg-navy text-white shadow-sm'
                    : completed
                      ? 'border-gold bg-gold-soft text-navy-deep'
                      : 'border-navy/10 bg-white text-slate-400'
                )}
              >
                <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5', active && 'text-gold')} />
                <span className="mt-1.5 text-[10px] font-bold sm:text-xs">{item.title}</span>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-navy/10 bg-white p-5 shadow-card sm:p-8"
      >
        {errorMsg && (
          <div className="mb-6 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAHAP 1: PILIH UNIT & PERIODE */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-navy-deep">
                Tahap 1: Pilih Unit Pendidikan & Periode
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Pilih jenjang sekolah tujuan di bawah naungan Yayasan Muhammad Tahir Garut.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {units.map((unit) => {
                const isSelected = unit.id === unitId;
                return (
                  <button
                    key={unit.id}
                    type="button"
                    onClick={() => handleSelectUnit(unit.id)}
                    className={cn(
                      'flex flex-col items-start rounded-2xl border-2 p-4 text-left transition-all',
                      isSelected
                        ? 'border-navy bg-navy-soft/80 shadow-sm'
                        : 'border-navy/10 bg-white hover:border-navy/30'
                    )}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-white p-1 ring-1 ring-navy/10">
                        <Image
                          src={unit.logo_url}
                          alt={unit.name}
                          fill
                          sizes="48px"
                          className="object-contain p-0.5"
                        />
                      </div>
                      <span
                        className={cn(
                          'h-5 w-5 rounded-full border-2 flex items-center justify-center',
                          isSelected ? 'border-navy bg-navy' : 'border-slate-300'
                        )}
                      >
                        {isSelected && <span className="h-2 w-2 rounded-full bg-gold" />}
                      </span>
                    </div>
                    <h3 className="mt-3 text-base font-extrabold text-navy-deep">{unit.name}</h3>
                    <p className="mt-0.5 text-xs font-medium text-slate-500">{unit.level_label}</p>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl bg-softgray p-4 sm:p-5">
              <label className="block text-sm font-bold text-navy-deep">
                Tahun Ajaran & Gelombang Pendaftaran
              </label>
              {availablePeriods.length === 0 ? (
                <p className="mt-2 text-sm text-rose-600">
                  Saat ini belum ada gelombang pendaftaran yang dibuka untuk unit ini.
                </p>
              ) : (
                <select
                  value={selectedPeriod?.id ?? ''}
                  onChange={(e) => setPeriodId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm font-semibold text-navy focus:border-navy focus:outline-none"
                >
                  {availablePeriods.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.academic_year?.name ?? selectedYear?.name ?? ''} — {p.name}
                    </option>
                  ))}
                </select>
              )}
              {selectedPeriod?.notes && (
                <p className="mt-2 text-xs text-slate-600">{selectedPeriod.notes}</p>
              )}
            </div>
          </div>
        )}

        {/* TAHAP 2: DATA CALON SISWA */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-extrabold text-navy-deep">
                Tahap 2: Data Calon Siswa ({selectedUnit?.name})
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Isi biodata calon peserta didik sesuai Akta Kelahiran dan Kartu Keluarga.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-navy">
                  Nama Lengkap Calon Siswa *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Ahmad Fauzan"
                  className="mt-1.5 w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">
                  Jenis Kelamin *
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-2.5">
                  {[
                    { val: 'L' as const, label: 'Laki-laki' },
                    { val: 'P' as const, label: 'Perempuan' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setGender(opt.val)}
                      className={cn(
                        'rounded-xl border px-4 py-3 text-sm font-bold transition-all',
                        gender === opt.val
                          ? 'border-navy bg-navy text-white'
                          : 'border-navy/15 bg-white text-navy hover:bg-navy-soft'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">
                  NISN (Opsional)
                </label>
                <input
                  type="text"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  placeholder="Jika sudah memiliki NISN"
                  className="mt-1.5 w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">
                  Tempat Lahir *
                </label>
                <input
                  type="text"
                  required
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  placeholder="Contoh: Garut"
                  className="mt-1.5 w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">
                  Tanggal Lahir *
                </label>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-navy focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-navy">
                  Asal Sekolah Sebelumnya {selectedUnit?.unit_code === 'SMP' ? '(SD/MI)' : '(Opsional)'}
                </label>
                <input
                  type="text"
                  value={previousSchool}
                  onChange={(e) => setPreviousSchool(e.target.value)}
                  placeholder="Contoh: RA/TK/SD/MI asal"
                  className="mt-1.5 w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-navy focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-navy">
                  Alamat Lengkap Calon Siswa *
                </label>
                <textarea
                  rows={3}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Kampung/Jalan, RT/RW, Desa/Kelurahan, Kecamatan, Kabupaten"
                  className="mt-1.5 w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-navy focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAHAP 3: DATA ORANG TUA / WALI */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-extrabold text-navy-deep">
                Tahap 3: Data Orang Tua / Wali
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Pastikan nomor WhatsApp/telepon aktif agar panitia dapat menghubungi Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase text-navy">Nama Ayah *</label>
                <input
                  type="text"
                  required
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-navy focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-navy">Nama Ibu *</label>
                <input
                  type="text"
                  required
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-navy focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-navy">
                  Nama Wali (Jika Ada)
                </label>
                <input
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-navy focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-navy">
                  Nomor Telepon / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="mt-1.5 w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-navy focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-navy">
                  Email Orang Tua (Opsional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@contoh.com"
                  className="mt-1.5 w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-navy focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="block text-xs font-bold uppercase text-navy">
                    Alamat Orang Tua / Wali *
                  </label>
                  <button
                    type="button"
                    onClick={() => setParentAddress(address)}
                    className="text-xs font-bold text-navy underline hover:text-gold-dark"
                  >
                    Samakan dengan alamat siswa
                  </button>
                </div>
                <textarea
                  rows={3}
                  required
                  value={parentAddress}
                  onChange={(e) => setParentAddress(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-navy focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAHAP 4: UNGGAH DOKUMEN */}
        {step === 4 && selectedUnit && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-extrabold text-navy-deep">
                Tahap 4: Unggah Dokumen Persyaratan ({selectedUnit.unit_code})
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Format yang didukung: JPG, PNG, atau PDF (maksimal 5MB per file). Dokumen disimpan secara privat dan terenkripsi.
              </p>
            </div>

            <div className="space-y-4">
              {selectedUnit.required_documents.map((doc) => {
                const chosen = files[doc.key];
                return (
                  <div
                    key={doc.key}
                    className="flex flex-col gap-3 rounded-2xl border border-navy/15 bg-softgray p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-navy" />
                        <p className="text-sm font-extrabold text-navy-deep">
                          {doc.label}{' '}
                          <span className={doc.required ? 'text-rose-600' : 'text-slate-400'}>
                            {doc.required ? '*' : '(Opsional)'}
                          </span>
                        </p>
                      </div>
                      {doc.description && (
                        <p className="mt-0.5 text-xs text-slate-500">{doc.description}</p>
                      )}
                      {chosen && (
                        <p className="mt-1.5 text-xs font-bold text-emerald-700">
                          Terpilih: {chosen.name} ({Math.round(chosen.size / 1024)} KB)
                        </p>
                      )}
                    </div>

                    <label className="inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-navy shadow-sm ring-1 ring-navy/15 hover:bg-navy hover:text-white transition-colors shrink-0">
                      <Upload className="h-3.5 w-3.5" />
                      <span>{chosen ? 'Ganti File' : 'Pilih File'}</span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="sr-only"
                        onChange={(e) => handleFileChange(doc.key, e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAHAP 5: TINJAU ULANG & KIRIM */}
        {step === 5 && selectedUnit && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-navy-deep">
                Tahap 5: Periksa Kembali Data & Kirim
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Pastikan seluruh data sudah benar sebelum mengirim pendaftaran.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 rounded-2xl bg-softgray p-5 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Unit Tujuan</p>
                <p className="font-extrabold text-navy-deep">{selectedUnit.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Tahun Ajaran / Gelombang</p>
                <p className="font-bold text-navy-deep">
                  {selectedYear?.name} — {selectedPeriod?.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Nama Calon Siswa</p>
                <p className="font-bold text-navy-deep">
                  {fullName} ({gender === 'L' ? 'Laki-laki' : 'Perempuan'})
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Tempat, Tanggal Lahir</p>
                <p className="font-bold text-navy-deep">
                  {birthPlace}, {birthDate}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Orang Tua (Ayah / Ibu)</p>
                <p className="font-bold text-navy-deep">
                  {fatherName} / {motherName}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Nomor Telepon / WA</p>
                <p className="font-bold text-navy-deep">{phone}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-slate-500">Dokumen Terlampir</p>
                <p className="font-semibold text-emerald-700">
                  {Object.keys(files).length} file siap diunggah ke penyimpanan privat
                </p>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-gold/40 bg-gold-soft p-4">
              <input
                type="checkbox"
                checked={statementAgreed}
                onChange={(e) => setStatementAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 accent-navy"
              />
              <span className="text-xs leading-relaxed text-navy-deep sm:text-sm">
                Saya menyatakan bahwa seluruh data dan dokumen yang diisikan pada formulir PPDB
                Yayasan Muhammad Tahir Garut ini adalah benar dan dapat dipertanggungjawabkan.
              </span>
            </label>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-navy/10 pt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setStep((s) => s - 1);
              }}
              className="inline-flex min-h-[46px] items-center gap-2 rounded-full border border-navy/20 px-5 py-2.5 text-sm font-bold text-navy hover:bg-navy-soft"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali</span>
            </button>
          ) : (
            <span />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex min-h-[46px] items-center gap-2 rounded-full bg-navy px-6 py-2.5 text-sm font-bold text-white hover:bg-navy-deep"
            >
              <span>Lanjutkan</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-[46px] items-center gap-2 rounded-full bg-gold px-7 py-2.5 text-sm font-extrabold text-navy-deep shadow-gold hover:bg-gold-light disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Mengirim Pendaftaran...</span>
                </>
              ) : (
                <>
                  <span>Kirim Pendaftaran</span>
                  <CheckCircle2 className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
