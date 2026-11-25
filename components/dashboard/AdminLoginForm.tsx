'use client';

import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Info,
  KeyRound,
  Loader2,
  Lock,
  User,
  ShieldCheck,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { OFFICIAL_ADMIN_ACCOUNTS } from '@/lib/auth/admin-account-constants';

export function AdminLoginForm({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAccountsInfo, setShowAccountsInfo] = useState(true);
  const [error, setError] = useState(
    initialError === 'unauthorized'
      ? 'Akun Anda belum memiliki akses admin aktif di sistem.'
      : ''
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Username/Email atau kata sandi tidak sesuai.');
      }

      window.location.href = '/admin/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal masuk ke dashboard admin.');
      setLoading(false);
    }
  };

  const handleSelectAccount = (username: string, pass: string) => {
    setIdentifier(username);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-navy-deep via-navy to-navy-light px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-white/80 hover:text-gold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Website Utama</span>
        </Link>

        <div className="rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
          <div className="flex items-center gap-3.5">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-white p-1 ring-1 ring-navy/10">
              <Image
                src="/logos/logo-yayasan.png"
                alt="Yayasan Muhammad Tahir Garut"
                fill
                sizes="56px"
                className="object-contain p-0.5"
              />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-navy-soft px-2.5 py-0.5 text-[11px] font-bold text-navy">
                <ShieldCheck className="h-3 w-3 text-gold-dark" />
                Portal Pengelola Yayasan
              </span>
              <h1 className="mt-1 text-lg font-extrabold text-navy-deep">
                Yayasan Muhammad Tahir Garut
              </h1>
            </div>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Masuk menggunakan akun resmi <strong>Ketua Yayasan</strong>, <strong>Kepala Sekolah</strong>, atau <strong>Penerima PPDB</strong>.
          </p>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                Username atau Email
              </label>
              <div className="relative mt-1.5">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Contoh: ketuayayasan atau email resmi"
                  className="w-full rounded-xl border border-navy/15 py-3 pl-10 pr-4 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                Kata Sandi
              </label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-navy/15 py-3 pl-10 pr-4 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-bold text-white hover:bg-navy-deep disabled:opacity-60 transition-all shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <span>Masuk ke Dashboard</span>
              )}
            </button>
          </form>

          {/* Akun Resmi Pengelola Info Section */}
          <div className="mt-6 rounded-2xl border border-navy/10 bg-softgray/70 p-4">
            <button
              type="button"
              onClick={() => setShowAccountsInfo((s) => !s)}
              className="flex w-full items-center justify-between text-left text-xs font-bold text-navy"
            >
              <div className="flex items-center gap-1.5">
                <KeyRound className="h-4 w-4 text-gold-dark" />
                <span>Daftar Akun Resmi Pengelola</span>
              </div>
              {showAccountsInfo ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>

            {showAccountsInfo && (
              <div className="mt-3 space-y-2 text-xs">
                <p className="text-[11px] text-slate-500">
                  Pilih salah satu peran di bawah ini untuk mengisi formulir login secara otomatis:
                </p>

                <div className="divide-y divide-navy/5 rounded-xl border border-navy/10 bg-white">
                  {OFFICIAL_ADMIN_ACCOUNTS.map((acc) => (
                    <div
                      key={acc.id}
                      className="flex items-center justify-between p-2.5 hover:bg-navy-soft/30 transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="truncate text-xs font-bold text-navy-deep">
                          {acc.title}
                        </p>
                        <p className="truncate text-[11px] text-slate-500 font-mono">
                          user: <strong>{acc.username}</strong> • sandi: <span className="text-slate-600 font-mono">{acc.password}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectAccount(acc.username, acc.password)}
                        className="shrink-0 rounded-lg bg-navy/10 px-2.5 py-1 text-[11px] font-bold text-navy hover:bg-gold hover:text-navy-deep transition-all"
                      >
                        Pilih
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
