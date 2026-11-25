'use client';

import {
  Activity,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  GraduationCap,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  School,
  Settings,
  UserCheck,
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
import { cn } from '@/lib/utils';
import type { AuthSessionProfile } from '@/types/database';

type TabKey =
  | 'overview'
  | 'admissions'
  | 'google-sync'
  | 'foundation'
  | 'units'
  | 'news'
  | 'galleries'
  | 'events'
  | 'teachers'
  | 'periods'
  | 'users'
  | 'audit';

interface AdminDashboardShellProps {
  profile: AuthSessionProfile;
  data: AdminDashboardPayload;
  initialTab?: TabKey;
}

export function AdminDashboardShell({ profile, data, initialTab = 'overview' }: AdminDashboardShellProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const isSuperAdmin = profile.role === 'super_admin';
  const canManageCms = profile.role === 'super_admin' || profile.role === 'admin_unit';

  const navItems = useMemo(() => {
    const items: Array<{ key: TabKey; label: string; icon: typeof LayoutDashboard }> = [
      { key: 'overview', label: 'Ringkasan', icon: LayoutDashboard },
      { key: 'admissions', label: 'Data Pendaftar PPDB', icon: GraduationCap },
      { key: 'google-sync', label: 'Sinkron Google Sheets', icon: FileSpreadsheet },
    ];

    if (canManageCms) {
      if (isSuperAdmin) {
        items.push({ key: 'foundation', label: 'Profil Yayasan', icon: Building2 });
      }
      items.push(
        {
          key: 'units',
          label: isSuperAdmin ? 'Profil Unit Sekolah' : 'Profil Sekolah & Logo',
          icon: School,
        },
        { key: 'news', label: 'Berita & Pengumuman', icon: Newspaper },
        { key: 'galleries', label: 'Galeri Foto', icon: ImageIcon },
        { key: 'events', label: 'Agenda Kegiatan', icon: Calendar },
        { key: 'teachers', label: 'Tenaga Pendidik', icon: UserCheck },
        { key: 'periods', label: 'Gelombang PPDB', icon: Settings }
      );
    }

    if (isSuperAdmin) {
      items.push(
        { key: 'users', label: 'Pengguna Admin', icon: Users },
        { key: 'audit', label: 'Audit Aktivitas', icon: Activity }
      );
    }

    return items;
  }, [canManageCms, isSuperAdmin]);

  const stats = useMemo(() => {
    const total = data.admissions.length;
    const pending = data.admissions.filter((a) => a.status === 'menunggu_verifikasi').length;
    const accepted = data.admissions.filter((a) => a.status === 'diterima').length;
    const failedSync = data.syncLogs.filter((l) => l.sync_status === 'failed').length;
    return { total, pending, accepted, failedSync };
  }, [data.admissions, data.syncLogs]);

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
              alt="Logo"
              fill
              sizes="36px"
              className="object-contain"
            />
          </div>
          {(!sidebarCollapsed || mobile) && (
            <div className="min-w-0">
              <p className="truncate text-xs font-extrabold text-white">Yayasan MT Garut</p>
              <p className="truncate text-[10px] font-semibold text-gold">{profile.role_name}</p>
            </div>
          )}
        </div>

        {!mobile ? (
          <button
            type="button"
            onClick={() => setSidebarCollapsed((c) => !c)}
            aria-label="Ciutkan sidebar"
            className="hidden lg:inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setActiveTab(item.key);
                setMobileDrawerOpen(false);
              }}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-all',
                active
                  ? 'bg-gold text-navy-deep font-extrabold shadow-sm'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {(!sidebarCollapsed || mobile) && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3 space-y-2">
        <Link
          href="/"
          className="flex w-full items-center justify-center rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
        >
          {!sidebarCollapsed || mobile ? 'Lihat Website Publik' : 'Web'}
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500/20 px-3 py-2 text-xs font-bold text-rose-200 hover:bg-rose-500/30"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {(!sidebarCollapsed || mobile) && <span>Keluar</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-softgray">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:block shrink-0 transition-all duration-200',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
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

      {/* Main Content */}
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
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase text-slate-400">Total Pendaftar PPDB</p>
                  <p className="mt-2 text-3xl font-extrabold text-navy-deep">{stats.total}</p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <p className="text-xs font-bold uppercase text-amber-700">Menunggu Verifikasi</p>
                  <p className="mt-2 text-3xl font-extrabold text-amber-900">{stats.pending}</p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <p className="text-xs font-bold uppercase text-emerald-700">Siswa Diterima</p>
                  <p className="mt-2 text-3xl font-extrabold text-emerald-900">{stats.accepted}</p>
                </div>
                <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Sync Google Sheets Gagal
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-rose-600">{stats.failedSync}</p>
                </div>
              </div>

              {/* Statistik per unit yang boleh diakses */}
              <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
                <h2 className="text-base font-extrabold text-navy-deep">
                  Ringkasan Unit Pendidikan Terkelola
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  {data.units.map((u) => {
                    const count = data.admissions.filter((a) => a.unit_id === u.id).length;
                    return (
                      <div key={u.id} className="rounded-2xl bg-softgray p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-white p-1">
                            <Image
                              src={u.logo_url}
                              alt={u.name}
                              fill
                              sizes="40px"
                              className="object-contain"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-extrabold text-navy-deep">{u.name}</p>
                            <p className="text-xs text-slate-500">{count} pendaftar tercatat</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'admissions' || activeTab === 'google-sync') && (
            <PpdbManagementPanel
              mode={activeTab}
              admissions={data.admissions}
              syncLogs={data.syncLogs}
              canVerify={true}
              onRefresh={handleRefresh}
            />
          )}

          {activeTab !== 'overview' &&
            activeTab !== 'admissions' &&
            activeTab !== 'google-sync' && (
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
