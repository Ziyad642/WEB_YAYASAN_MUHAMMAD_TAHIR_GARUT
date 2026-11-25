'use client';

import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Lock,
  User,
  ShieldCheck,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function AdminLoginForm({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-white p-1 ring-1 ring-navy/10 shadow-sm">
              <Image
                src="/logos/logo-yayasan.png"
                alt="Logo Yayasan"
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
            Masuk menggunakan akun resmi <strong>Ketua Yayasan</strong> atau <strong>Kepala Sekolah</strong>.
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
                  placeholder="Masukkan username atau email resmi"
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
        </div>
      </div>
    </div>
  );
}
