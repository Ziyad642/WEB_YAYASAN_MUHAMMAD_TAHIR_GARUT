'use client';

import {
  Building2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  School,
  Users,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { CmsManagementPanel } from '@/components/dashboard/CmsManagementPanel';
import { PpdbManagementPanel } from '@/components/dashboard/PpdbManagementPanel';
import type { AdminDashboardPayload } from '@/lib/data/admin-repository';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { cn, formatDateId } from '@/lib/utils';
import type { AuthSessionProfile } from '@/types/database';

export type TabKey =
  | 'overview'
  | 'foundation'
  | 'units'
  | 'information'
  | 'admissions'
  | 'users';

interface AdminDashboardShellProps {
  profile: AuthSessionProfile;
  data: AdminDashboardPayload;
  initialTab?: TabKey;
}

export function AdminDashboardShell({
  profile,
  data,
  initialTab = 'overview',
}: AdminDashboardShellProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const isSuperAdmin = profile.role === 'super_admin';

  // Sesuai Master Prompt:
  // - Dashboard Kepala Sekolah HANYA 4 MENU: Ringkasan, Profil Sekolah, Informasi & Kegiatan, PPDB.
  // - Dashboard Ketua Yayasan HANYA 5 MENU: Ringkasan, Profil Yayasan, Informasi & Kegiatan, PPDB, Pengguna.
  const navItems = useMemo(() => {
    if (isSuperAdmin) {
      return [
        { key: 'overview' as const, label: 'Ringkasan', icon: LayoutDashboard },
        { key: 'foundation' as const, label: 'Profil Yayasan', icon: Building2 },
        { key: 'information' as const, label: 'Informasi & Kegiatan', icon: Newspaper },
        { key: 'admissions' as const, label: 'PPDB', icon: GraduationCap },
        { key: 'users' as const, label: 'Pengguna', icon: Users },
      ];
    }

    // Kepala Sekolah
    return [
      { key: 'overview' as const, label: 'Ringkasan', icon: LayoutDashboard },
      { key: 'units' as const, label: 'Profil Sekolah', icon: School },
      { key: 'information' as const, label: 'Informasi & Kegiatan', icon: Newspaper },
      { key: 'admissions' as const, label: 'PPDB', icon: GraduationCap },
    ];
  }, [isSuperAdmin]);

  // Statistik aktual dari database
  const stats = useMemo(() => {
    const total = data.admissions.length;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newApplicants = data.admissions.filter((a) => {
      const time = new Date(a.submitted_at).getTime();
      return !isNaN(time) && time >= sevenDaysAgo;
    }).length;
    const pending = data.admissions.filter((a) => a.status === 'menunggu_verifikasi').length;
    const accepted = data.admissions.filter((a) => a.status === 'diterima').length;
    return { total, newApplicants, pending, accepted };
  }, [data.admissions]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    try {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
    } catch {}
    window.location.href = '/admin';
  };

  const handleRefresh = () => {
    router.refresh();
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex h-full flex-col bg-navy-deep text-white">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 p-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-white p-0.5">
            <Image
              src="/logos/logo-yayasan.png"
              alt="Logo Yayasan"
              fill
              sizes="36px"
              className="object-contain"
            />
          </div>
          {(!sidebarCollapsed || mobile) && (
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-white">YMT Garut</p>
              <p className="truncate text-[10px] text-gold-light">
                {isSuperAdmin ? 'Ketua Yayasan' : 'Kepala Sekolah'}
              </p>
            </div>
          )}
        </div>
        {mobile ? (
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(false)}
            aria-label="Tutup menu"
            className="rounded-lg p-1 text-slate-300 hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? 'Perlebar sidebar' : 'Ciutkan sidebar'}
            className="hidden lg:flex rounded-lg p-1 text-slate-300 hover:bg-white/10"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Navigasi Utama Sederhana */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setActiveTab(item.key);
                if (mobile) setMobileDrawerOpen(false);
              }}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all',
                active
                  ? 'bg-gold text-navy-deep shadow-md'
                  : 'text-slate-200 hover:bg-white/10 hover:text-white',
                sidebarCollapsed && !mobile && 'justify-center px-2'
              )}
              title={item.label}
            >
              <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-navy-deep' : 'text-gold')} />
              {(!sidebarCollapsed || mobile) && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Profil Akun Pengelola & Logout */}
      <div className="border-t border-white/10 p-3 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex w-full items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10"
        >
          <span className="truncate">Lihat Website Publik</span>
          <span className="ml-auto text-[10px] text-gold">↗</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-xl bg-rose-500/20 px-3 py-2 text-xs font-bold text-rose-200 hover:bg-rose-500/30 transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0 text-rose-300" />
          {(!sidebarCollapsed || mobile) && <span>Keluar Sistem</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-softgray">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col shrink-0 transition-all duration-300 border-r border-navy/10',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden bg-black/60"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div className="w-72 max-w-[85vw] h-full" onClick={(e) => e.stopPropagation()}>
            <SidebarContent mobile />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-navy/10 bg-white px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Buka menu dashboard"
              className="inline-flex lg:hidden h-10 w-10 items-center justify-center rounded-xl bg-navy-soft text-navy"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-base font-extrabold text-navy-deep sm:text-lg">
                Dashboard Pengelola Yayasan
              </h1>
              <p className="truncate text-xs text-slate-500">
                Masuk sebagai <strong>{profile.full_name}</strong> ({profile.role_name})
                {profile.unit_access.length > 0 &&
                  ` • Unit: ${profile.unit_access.map((u) => u.unit_code).join(', ')}`}
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-4 sm:p-6 space-y-6">
          {/* 1. RINGKASAN */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 4 Kartu Statistik Utama Aktual */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase text-slate-400">Total Pendaftar</p>
                  <p className="mt-2 text-3xl font-extrabold text-navy-deep">{stats.total}</p>
                  <p className="mt-1 text-[11px] text-slate-500">Data pendaftaran tersimpan</p>
                </div>
                <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
                  <p className="text-xs font-bold uppercase text-blue-700">Pendaftar Baru</p>
                  <p className="mt-2 text-3xl font-extrabold text-blue-900">{stats.newApplicants}</p>
                  <p className="mt-1 text-[11px] text-blue-700/80">Pendaftar 7 hari terakhir</p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <p className="text-xs font-bold uppercase text-amber-700">Menunggu Verifikasi</p>
                  <p className="mt-2 text-3xl font-extrabold text-amber-900">{stats.pending}</p>
                  <p className="mt-1 text-[11px] text-amber-800/80">Memerlukan pengecekan berkas</p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <p className="text-xs font-bold uppercase text-emerald-700">Pendaftar Diterima</p>
                  <p className="mt-2 text-3xl font-extrabold text-emerald-900">{stats.accepted}</p>
                  <p className="mt-1 text-[11px] text-emerald-800/80">Telah diverifikasi resmi</p>
                </div>
              </div>

              {/* Ringkasan Unit Pendidikan */}
              <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
                <h2 className="text-base font-extrabold text-navy-deep">
                  {isSuperAdmin
                    ? 'Ringkasan Pendaftar Seluruh Unit Pendidikan'
                    : 'Pendaftar Unit Pendidikan Anda'}
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  {data.units.map((u) => {
                    const count = data.admissions.filter((a) => a.unit_id === u.id).length;
                    return (
                      <div key={u.id} className="rounded-2xl bg-softgray p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white p-1 ring-1 ring-navy/10">
                            <Image
                              src={u.logo_url}
                              alt={u.name}
                              fill
                              sizes="48px"
                              className="object-contain"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-extrabold text-navy-deep">{u.name}</p>
                            <p className="text-xs font-bold text-gold-dark mt-0.5">
                              {count} pendaftar tercatat
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Informasi & Kegiatan Terbaru */}
              <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-extrabold text-navy-deep">
                    Informasi & Kegiatan Terbaru
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('information')}
                    className="text-xs font-bold text-navy hover:text-gold-dark"
                  >
                    Kelola Semua →
                  </button>
                </div>
                {data.news.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    Belum ada informasi yang dipublikasikan.
                  </p>
                ) : (
                  <div className="divide-y divide-navy/10">
                    {data.news.slice(0, 5).map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-navy-deep truncate">{item.title}</p>
                          <p className="text-[11px] text-slate-500">
                            {item.unit ? item.unit.name : 'Yayasan Pusat'} •{' '}
                            {formatDateId(item.published_at)}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            item.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.status === 'published' ? 'Terbit' : 'Draft'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. PPDB ONLINE & PENGHAPUSAN DATA */}
          {activeTab === 'admissions' && (
            <PpdbManagementPanel
              admissions={data.admissions}
              syncLogs={data.syncLogs}
              canVerify={true}
              onRefresh={handleRefresh}
              isSuperAdmin={isSuperAdmin}
              units={data.units}
              admissionPeriods={data.admissionPeriods}
            />
          )}

          {/* 3. PROFIL YAYASAN, PROFIL SEKOLAH, INFORMASI & KEGIATAN, PENGGUNA */}
          {activeTab !== 'overview' && activeTab !== 'admissions' && (
            <CmsManagementPanel
              section={activeTab}
              profile={profile}
              data={data}
              onRefresh={handleRefresh}
            />
          )}
        </main>
      </div>
    </div>
  );
}
