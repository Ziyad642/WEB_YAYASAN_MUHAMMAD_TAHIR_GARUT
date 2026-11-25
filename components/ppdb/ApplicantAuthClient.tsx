'use client';

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  KeyRound,
  Loader2,
  Lock,
  Phone,
  ShieldCheck,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function ApplicantAuthClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/ppdb/riwayat';

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Forgot password state
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/ppdb/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Nomor WhatsApp atau kata sandi tidak cocok.');

      window.location.href = redirectPath;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal masuk akun.');
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/ppdb/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          password: regPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mendaftar akun.');

      window.location.href = redirectPath;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat akun.');
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/ppdb/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: forgotIdentifier.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui kata sandi.');

      setSuccess(data.message || 'Kata sandi berhasil diperbarui.');
      setIdentifier(forgotIdentifier);
      setPassword(newPassword);
      setTimeout(() => {
        setActiveTab('login');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat reset sandi.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoPhone: string, demoPass: string) => {
    setIdentifier(demoPhone);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="overflow-hidden rounded-3xl border border-navy/10 bg-white shadow-xl">
        {/* Header Tabs */}
        <div className="grid grid-cols-3 border-b border-navy/10 bg-softgray text-center text-xs sm:text-sm font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setError('');
              setSuccess('');
            }}
            className={`py-3.5 transition-all ${
              activeTab === 'login'
                ? 'border-b-2 border-navy bg-white text-navy-deep shadow-sm'
                : 'text-slate-500 hover:text-navy'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setError('');
              setSuccess('');
            }}
            className={`py-3.5 transition-all ${
              activeTab === 'register'
                ? 'border-b-2 border-navy bg-white text-navy-deep shadow-sm'
                : 'text-slate-500 hover:text-navy'
            }`}
          >
            Buat Akun
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('forgot');
              setError('');
              setSuccess('');
            }}
            className={`py-3.5 transition-all ${
              activeTab === 'forgot'
                ? 'border-b-2 border-navy bg-white text-navy-deep shadow-sm'
                : 'text-slate-500 hover:text-navy'
            }`}
          >
            Lupa Sandi
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gold/20 text-gold-dark">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-navy-deep">
                {activeTab === 'login'
                  ? 'Portal Masuk Wali Santri'
                  : activeTab === 'register'
                    ? 'Registrasi Akun Wali Santri'
                    : 'Pemulihan Kata Sandi'}
              </h2>
              <p className="text-xs text-slate-500">
                {activeTab === 'login'
                  ? 'Masuk untuk memantau pendaftaran & mencetak bukti pendaftaran.'
                  : activeTab === 'register'
                    ? 'Buat akun agar riwayat pendaftaran Anda tersimpan rapi.'
                    : 'Perbarui kata sandi akun Wali Santri Anda dengan cepat.'}
              </p>
            </div>
          </div>

          {success && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-800">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
              {error.includes('Buat Akun') && activeTab === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setError('');
                  }}
                  className="shrink-0 rounded-full bg-rose-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-rose-700"
                >
                  Daftar Akun Baru
                </button>
              )}
            </div>
          )}

          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                  Nomor WhatsApp / HP atau Email
                </label>
                <div className="relative mt-1.5">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Contoh: 081234567891"
                    className="w-full rounded-xl border border-navy/15 py-3 pl-10 pr-4 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('forgot');
                      setError('');
                      setSuccess('');
                    }}
                    className="text-xs font-semibold text-gold-dark hover:underline"
                  >
                    Lupa sandi?
                  </button>
                </div>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-navy/15 py-3 pl-10 pr-4 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-2.5 text-sm font-bold text-white hover:bg-navy-deep disabled:opacity-60 transition-all shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Riwayat Pendaftaran</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                  Nama Lengkap Wali Santri
                </label>
                <div className="relative mt-1.5">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nama lengkap orang tua / wali"
                    className="w-full rounded-xl border border-navy/15 py-3 pl-10 pr-4 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                  Nomor WhatsApp / HP Aktif
                </label>
                <div className="relative mt-1.5">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full rounded-xl border border-navy/15 py-3 pl-10 pr-4 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                  Email (Opsional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="wali@gmail.com"
                  className="mt-1.5 w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                  Buat Kata Sandi
                </label>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full rounded-xl border border-navy/15 py-3 pl-10 pr-4 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-2.5 text-sm font-bold text-navy-deep hover:bg-gold-light disabled:opacity-60 transition-all shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Mendaftarkan Akun...</span>
                  </>
                ) : (
                  <>
                    <span>Daftar & Lanjutkan</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                  Nomor WhatsApp atau Email Terdaftar
                </label>
                <div className="relative mt-1.5">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="Contoh: 081234567891"
                    className="w-full rounded-xl border border-navy/15 py-3 pl-10 pr-4 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                  Kata Sandi Baru
                </label>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full rounded-xl border border-navy/15 py-3 pl-10 pr-4 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                  Konfirmasi Kata Sandi Baru
                </label>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="w-full rounded-xl border border-navy/15 py-3 pl-10 pr-4 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-2.5 text-sm font-bold text-white hover:bg-navy-deep disabled:opacity-60 transition-all shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Menyimpan Sandi Baru...</span>
                  </>
                ) : (
                  <>
                    <span>Simpan Kata Sandi Baru</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Akun Contoh Terdaftar */}
          <div className="mt-6 rounded-2xl border border-navy/10 bg-softgray p-4 text-xs">
            <p className="font-bold text-navy-deep">💡 Contoh Akun Wali Santri Terdaftar:</p>
            <p className="mt-1 text-slate-500">
              Orang tua pendaftar Aisyah Azzahra (RA):
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-navy/10 bg-white p-2.5 font-mono text-[11px]">
              <div>
                <span>WA: <strong>081234567891</strong></span> • <span>Sandi: <strong>WaliSantri2027!</strong></span>
              </div>
              <button
                type="button"
                onClick={() => handleQuickLogin('081234567891', 'WaliSantri2027!')}
                className="rounded-lg bg-navy/10 px-2 py-0.5 text-navy hover:bg-navy hover:text-white transition-colors"
              >
                Gunakan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
