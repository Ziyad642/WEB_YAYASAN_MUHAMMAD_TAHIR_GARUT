'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#102F55] to-[#082747] flex flex-col items-center justify-center px-4 text-white">
      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/logos/logo-yayasan.png"
          alt="Yayasan Muhammad Tahir Garut"
          width={80}
          height={80}
          className="object-contain drop-shadow-lg"
        />
      </div>

      {/* 404 */}
      <div className="text-center max-w-lg">
        <p className="text-[#E9BC58] font-semibold text-lg mb-2 tracking-widest uppercase">
          404
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-white/70 text-base md:text-lg mb-10">
          Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
          Silakan kembali ke beranda yayasan.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#E9BC58] hover:bg-[#d4a84a] text-[#102F55] font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <Home size={18} />
            Kembali ke Beranda
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 border border-white/30 hover:bg-white/10 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <ArrowLeft size={18} />
            Halaman Sebelumnya
          </button>
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-16 text-white/40 text-sm text-center">
        © {new Date().getFullYear()} Yayasan Muhammad Tahir Garut. All rights
        reserved.
      </p>
    </div>
  );
}
