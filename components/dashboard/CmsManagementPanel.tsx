'use client';

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Edit2,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  Loader2,
  Megaphone,
  Plus,
  Save,
  Trash2,
  Upload,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { AdminDashboardPayload } from '@/lib/data/admin-repository';
import { formatDateId } from '@/lib/utils';
import type { AuthSessionProfile, RequiredDocumentConfig } from '@/types/database';

export interface CmsManagementPanelProps {
  section: 'foundation' | 'units' | 'information' | 'users' | 'audit';
  profile: AuthSessionProfile;
  data: AdminDashboardPayload;
  onRefresh: () => void;
}

export function CmsManagementPanel({
  section,
  profile,
  data,
  onRefresh,
}: CmsManagementPanelProps) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // =========================================================================
  // 1. FOUNDATION SETTINGS STATE (PROFIL YAYASAN)
  // =========================================================================
  const [foundationForm, setFoundationForm] = useState(() => ({
    foundation_name: data.foundation?.foundation_name ?? 'Yayasan Muhammad Tahir Garut',
    tagline: data.foundation?.tagline ?? '',
    short_description: data.foundation?.short_description ?? '',
    history: data.foundation?.history ?? '',
    vision: data.foundation?.vision ?? '',
    missionText: (data.foundation?.mission ?? []).join('\n'),
    address: data.foundation?.address ?? '',
    phone: data.foundation?.phone ?? '',
    whatsapp: data.foundation?.whatsapp ?? '',
    email: data.foundation?.email ?? '',
    logo_url: data.foundation?.logo_url ?? '/logos/logo-yayasan.png',
    hero_badge: data.foundation?.hero_badge ?? 'Pendidikan Islam Terpadu',
    hero_title: data.foundation?.hero_title ?? '',
    hero_subtitle: data.foundation?.hero_subtitle ?? '',
    hero_image_url: data.foundation?.hero_image_url ?? '/images/hero-students.jpg',
    about_image_url: data.foundation?.about_image_url ?? '/images/campus-building.jpg',
    about_video_url: data.foundation?.about_video_url ?? '',
    ppdb_banner_title: data.foundation?.ppdb_banner_title ?? '',
    ppdb_banner_subtitle: data.foundation?.ppdb_banner_subtitle ?? '',
    footer_quote: data.foundation?.footer_quote ?? '',
    social_youtube: data.foundation?.social_youtube ?? '',
    social_instagram: data.foundation?.social_instagram ?? '',
    social_facebook: data.foundation?.social_facebook ?? '',
    social_tiktok: data.foundation?.social_tiktok ?? '',
  }));

  // =========================================================================
  // 2. UNIT EDITOR STATE (PROFIL SEKOLAH)
  // =========================================================================
  const [selectedUnitId, setSelectedUnitId] = useState(data.units[0]?.id ?? '');
  const activeUnit = data.units.find((u) => u.id === selectedUnitId) ?? data.units[0];
  const [unitDraft, setUnitDraft] = useState(() =>
    activeUnit
      ? {
          name: activeUnit.name,
          level_label: activeUnit.level_label,
          short_description: activeUnit.short_description,
          full_profile: activeUnit.full_profile,
          history: activeUnit.history,
          vision: activeUnit.vision,
          missionText: activeUnit.mission.join('\n'),
          achievementsText: activeUnit.achievements.join('\n'),
          ppdb_info: activeUnit.ppdb_info,
          logo_url: activeUnit.logo_url,
          is_logo_placeholder: activeUnit.is_logo_placeholder,
          banner_image_url: activeUnit.banner_image_url,
          accent_color: activeUnit.accent_color,
          headmaster_name: activeUnit.headmaster_name ?? '',
          contact_phone: activeUnit.contact_phone ?? '',
          contact_email: activeUnit.contact_email ?? '',
          address: (activeUnit as any).address ?? '',
          required_documents: activeUnit.required_documents,
        }
      : null
  );

  useEffect(() => {
    if (activeUnit) {
      setUnitDraft({
        name: activeUnit.name,
        level_label: activeUnit.level_label,
        short_description: activeUnit.short_description,
        full_profile: activeUnit.full_profile,
        history: activeUnit.history,
        vision: activeUnit.vision,
        missionText: activeUnit.mission.join('\n'),
        achievementsText: activeUnit.achievements.join('\n'),
        ppdb_info: activeUnit.ppdb_info,
        logo_url: activeUnit.logo_url,
        is_logo_placeholder: activeUnit.is_logo_placeholder,
        banner_image_url: activeUnit.banner_image_url,
        accent_color: activeUnit.accent_color,
        headmaster_name: activeUnit.headmaster_name ?? '',
        contact_phone: activeUnit.contact_phone ?? '',
        contact_email: activeUnit.contact_email ?? '',
        address: (activeUnit as any).address ?? '',
        required_documents: activeUnit.required_documents,
      });
    }
  }, [activeUnit?.id]);

  // =========================================================================
  // 3. UNIFIED INFORMASI & KEGIATAN STATE
  // =========================================================================
  const defaultUnitId =
    profile.role === 'super_admin' ? '' : (data.units[0]?.id ?? '');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<'news' | 'events' | 'galleries'>('news');

  const [infoCategory, setInfoCategory] = useState<'berita' | 'pengumuman' | 'agenda' | 'galeri'>('berita');
  const [infoTitle, setInfoTitle] = useState('');
  const [infoUnitId, setInfoUnitId] = useState(defaultUnitId);
  const [infoDate, setInfoDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [infoLocation, setInfoLocation] = useState('Kampus Yayasan Muhammad Tahir Garut');
  const [infoThumbnail, setInfoThumbnail] = useState('/images/campus-building.jpg');
  const [infoExcerpt, setInfoExcerpt] = useState('');
  const [infoContent, setInfoContent] = useState('');

  // List filter state
  const [contentCategoryFilter, setContentCategoryFilter] = useState<string>('all');
  const [contentUnitFilter, setContentUnitFilter] = useState<string>('all');
  const [contentSearch, setContentSearch] = useState<string>('');

  // =========================================================================
  // 4. PENGGUNA STATE (SUPER ADMIN)
  // =========================================================================
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRoleCode, setUserRoleCode] = useState<'super_admin' | 'admin_unit' | 'panitia_ppdb'>('admin_unit');
  const [userUnitIds, setUserUnitIds] = useState<string[]>([]);
  const [localUsers, setLocalUsers] = useState(data.users);

  useEffect(() => {
    setLocalUsers(data.users);
  }, [data.users]);

  // =========================================================================
  // HELPER API CALLS
  // =========================================================================
  const callCmsApi = async (
    resource: string,
    action: 'create' | 'update' | 'delete',
    payload?: Record<string, unknown>,
    id?: string
  ) => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource, action, id, payload }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal memproses permintaan.');
      setMessage('Perubahan berhasil disimpan ke database.');
      onRefresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImage = async (
    file: File | null,
    folder: string,
    onSuccessUrl: (url: string) => void
  ) => {
    if (!file) return;
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', folder);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal mengunggah gambar.');
      onSuccessUrl(json.publicUrl);
      setMessage('Gambar berhasil diunggah.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload gagal.');
    } finally {
      setSaving(false);
    }
  };

  const resetInfoForm = () => {
    setEditingId(null);
    setEditingType('news');
    setInfoTitle('');
    setInfoCategory('berita');
    setInfoUnitId(defaultUnitId);
    setInfoDate(new Date().toISOString().slice(0, 16));
    setInfoLocation('Kampus Yayasan Muhammad Tahir Garut');
    setInfoThumbnail('/images/campus-building.jpg');
    setInfoExcerpt('');
    setInfoContent('');
  };

  const StatusBanner = () => (
    <>
      {message && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </>
  );

  // =========================================================================
  // SECTION: FOUNDATION (PROFIL YAYASAN PUSAT)
  // =========================================================================
  if (section === 'foundation') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy/10 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-navy-deep">Pengaturan & Profil Yayasan Pusat</h2>
              <p className="text-xs text-slate-500">
                Kelola identitas, kontak, visi misi, foto hero, dan informasi publik yayasan.
              </p>
            </div>
          </div>

          <StatusBanner />

          {/* Logo & Hero Banner Preview / Upload */}
          <div className="my-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-4 rounded-2xl border border-navy/10 bg-softgray p-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-white p-1 ring-1 ring-navy/10">
                <Image
                  src={foundationForm.logo_url}
                  alt="Logo Yayasan"
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-navy">Logo Resmi Yayasan</p>
                <p className="truncate text-[11px] text-slate-500">{foundationForm.logo_url}</p>
                <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-navy px-3 py-1 text-[11px] font-bold text-white hover:bg-navy-deep">
                  <Upload className="h-3 w-3" />
                  <span>Ganti Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) =>
                      handleUploadImage(e.target.files?.[0] ?? null, 'foundation', (url) =>
                        setFoundationForm((f) => ({ ...f, logo_url: url }))
                      )
                    }
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-navy/10 bg-softgray p-4">
              <div className="relative h-16 w-24 overflow-hidden rounded-2xl bg-white ring-1 ring-navy/10">
                <Image
                  src={foundationForm.hero_image_url}
                  alt="Hero Banner"
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-navy">Banner Utama (Hero)</p>
                <p className="truncate text-[11px] text-slate-500">{foundationForm.hero_image_url}</p>
                <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-navy px-3 py-1 text-[11px] font-bold text-white hover:bg-navy-deep">
                  <Upload className="h-3 w-3" />
                  <span>Ganti Banner</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) =>
                      handleUploadImage(e.target.files?.[0] ?? null, 'foundation', (url) =>
                        setFoundationForm((f) => ({ ...f, hero_image_url: url }))
                      )
                    }
                  />
                </label>
              </div>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void callCmsApi('foundation_settings', 'update', {
                ...foundationForm,
                mission: foundationForm.missionText
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean),
              });
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div>
              <label className="text-xs font-bold text-navy">Nama Yayasan *</label>
              <input
                type="text"
                required
                value={foundationForm.foundation_name}
                onChange={(e) => setFoundationForm((f) => ({ ...f, foundation_name: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy">Tagline / Semboyan *</label>
              <input
                type="text"
                required
                value={foundationForm.tagline}
                onChange={(e) => setFoundationForm((f) => ({ ...f, tagline: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy">Telepon Kantor *</label>
              <input
                type="text"
                required
                value={foundationForm.phone}
                onChange={(e) => setFoundationForm((f) => ({ ...f, phone: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy">WhatsApp Resmi</label>
              <input
                type="text"
                value={foundationForm.whatsapp}
                onChange={(e) => setFoundationForm((f) => ({ ...f, whatsapp: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-navy">Email Resmi *</label>
              <input
                type="email"
                required
                value={foundationForm.email}
                onChange={(e) => setFoundationForm((f) => ({ ...f, email: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-navy">Alamat Lengkap Kantor Yayasan *</label>
              <input
                type="text"
                required
                value={foundationForm.address}
                onChange={(e) => setFoundationForm((f) => ({ ...f, address: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-navy">Deskripsi Singkat Yayasan *</label>
              <textarea
                rows={2}
                required
                value={foundationForm.short_description}
                onChange={(e) => setFoundationForm((f) => ({ ...f, short_description: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-navy">Sejarah Singkat Yayasan *</label>
              <textarea
                rows={3}
                required
                value={foundationForm.history}
                onChange={(e) => setFoundationForm((f) => ({ ...f, history: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-navy">Visi Yayasan *</label>
              <textarea
                rows={2}
                required
                value={foundationForm.vision}
                onChange={(e) => setFoundationForm((f) => ({ ...f, vision: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-navy">Misi Yayasan (Tulis 1 baris per butir misi) *</label>
              <textarea
                rows={4}
                required
                value={foundationForm.missionText}
                onChange={(e) => setFoundationForm((f) => ({ ...f, missionText: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 mt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-navy px-8 py-3 text-sm font-extrabold text-white shadow-md hover:bg-navy-deep disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Simpan Profil Yayasan</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SECTION: UNITS (PROFIL SEKOLAH)
  // =========================================================================
  if (section === 'units') {
    if (!activeUnit || !unitDraft) {
      return (
        <div className="rounded-2xl border border-navy/10 bg-white p-8 text-center text-sm text-slate-500">
          Data unit pendidikan tidak ditemukan atau akun Anda belum ditautkan ke unit.
        </div>
      );
    }

    const selectUnit = (id: string) => {
      setSelectedUnitId(id);
      const u = data.units.find((item) => item.id === id);
      if (u) {
        setUnitDraft({
          name: u.name,
          level_label: u.level_label,
          short_description: u.short_description,
          full_profile: u.full_profile,
          history: u.history,
          vision: u.vision,
          missionText: u.mission.join('\n'),
          achievementsText: u.achievements.join('\n'),
          ppdb_info: u.ppdb_info,
          logo_url: u.logo_url,
          is_logo_placeholder: u.is_logo_placeholder,
          banner_image_url: u.banner_image_url,
          accent_color: u.accent_color,
          headmaster_name: u.headmaster_name ?? '',
          contact_phone: u.contact_phone ?? '',
          contact_email: u.contact_email ?? '',
          address: (u as any).address ?? '',
          required_documents: u.required_documents,
        });
      }
    };

    return (
      <div className="space-y-6">
        {data.units.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {data.units.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => selectUnit(u.id)}
                className={`rounded-full px-5 py-2 text-xs font-bold transition-all shadow-sm ${
                  u.id === activeUnit.id
                    ? 'bg-navy text-white shadow-md'
                    : 'bg-white text-navy ring-1 ring-navy/15 hover:bg-navy-soft'
                }`}
              >
                {u.name}
              </button>
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6 shadow-sm">
          <div className="border-b border-navy/10 pb-4 mb-4">
            <h2 className="text-lg font-extrabold text-navy-deep">Profil Unit: {unitDraft.name}</h2>
            <p className="text-xs text-slate-500">
              Perubahan profil sekolah akan langsung terpasang pada halaman resmi unit di website publik.
            </p>
          </div>

          <StatusBanner />

          {/* Logo & Banner Preview / Upload */}
          <div className="my-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-4 rounded-2xl border border-navy/10 bg-softgray p-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-white p-1 ring-1 ring-navy/10">
                <Image
                  src={unitDraft.logo_url}
                  alt={unitDraft.name}
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-navy">Logo Resmi Unit</p>
                <p className="truncate text-[11px] text-slate-500">
                  {unitDraft.is_logo_placeholder ? 'Logo placeholder' : 'Logo resmi terpasang'}
                </p>
                <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-navy px-3 py-1 text-[11px] font-bold text-white hover:bg-navy-deep">
                  <Upload className="h-3 w-3" />
                  <span>Ganti Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) =>
                      handleUploadImage(e.target.files?.[0] ?? null, `logos-${activeUnit.slug}`, (url) =>
                        setUnitDraft((d) => (d ? { ...d, logo_url: url, is_logo_placeholder: false } : d))
                      )
                    }
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-navy/10 bg-softgray p-4">
              <div className="relative h-16 w-24 overflow-hidden rounded-2xl bg-white ring-1 ring-navy/10">
                <Image
                  src={unitDraft.banner_image_url}
                  alt="Banner Unit"
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-navy">Foto Utama Sekolah (Banner)</p>
                <p className="truncate text-[11px] text-slate-500">{unitDraft.banner_image_url}</p>
                <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-navy px-3 py-1 text-[11px] font-bold text-white hover:bg-navy-deep">
                  <Upload className="h-3 w-3" />
                  <span>Ganti Foto Utama</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) =>
                      handleUploadImage(e.target.files?.[0] ?? null, `banner-${activeUnit.slug}`, (url) =>
                        setUnitDraft((d) => (d ? { ...d, banner_image_url: url } : d))
                      )
                    }
                  />
                </label>
              </div>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void callCmsApi(
                'education_units',
                'update',
                {
                  ...unitDraft,
                  mission: unitDraft.missionText
                    .split('\n')
                    .map((s) => s.trim())
                    .filter(Boolean),
                  achievements: unitDraft.achievementsText
                    .split('\n')
                    .map((s) => s.trim())
                    .filter(Boolean),
                },
                activeUnit.id
              );
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div>
              <label className="text-xs font-bold text-navy">Nama Sekolah *</label>
              <input
                type="text"
                required
                value={unitDraft.name}
                onChange={(e) => setUnitDraft((d) => (d ? { ...d, name: e.target.value } : d))}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy">Nama Kepala Sekolah *</label>
              <input
                type="text"
                required
                value={unitDraft.headmaster_name}
                onChange={(e) => setUnitDraft((d) => (d ? { ...d, headmaster_name: e.target.value } : d))}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy">Telepon / WhatsApp Sekolah</label>
              <input
                type="text"
                value={unitDraft.contact_phone}
                onChange={(e) => setUnitDraft((d) => (d ? { ...d, contact_phone: e.target.value } : d))}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy">Email Sekolah</label>
              <input
                type="email"
                value={unitDraft.contact_email}
                onChange={(e) => setUnitDraft((d) => (d ? { ...d, contact_email: e.target.value } : d))}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-navy">Alamat Lengkap Unit Sekolah</label>
              <input
                type="text"
                value={unitDraft.address}
                onChange={(e) => setUnitDraft((d) => (d ? { ...d, address: e.target.value } : d))}
                placeholder="Contoh: Jl. Godog, Cikubang, Karangpawitan, Garut"
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-navy">Deskripsi Singkat Sekolah *</label>
              <textarea
                rows={2}
                required
                value={unitDraft.short_description}
                onChange={(e) => setUnitDraft((d) => (d ? { ...d, short_description: e.target.value } : d))}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-navy">Profil Lengkap & Sejarah Singkat *</label>
              <textarea
                rows={3}
                required
                value={unitDraft.full_profile}
                onChange={(e) => setUnitDraft((d) => (d ? { ...d, full_profile: e.target.value } : d))}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-navy">Visi Sekolah *</label>
              <textarea
                rows={2}
                required
                value={unitDraft.vision}
                onChange={(e) => setUnitDraft((d) => (d ? { ...d, vision: e.target.value } : d))}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-navy">Misi Sekolah (1 baris per butir) *</label>
              <textarea
                rows={4}
                required
                value={unitDraft.missionText}
                onChange={(e) => setUnitDraft((d) => (d ? { ...d, missionText: e.target.value } : d))}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
            </div>

            {/* Konfigurasi Persyaratan Dokumen PPDB Unit */}
            <div className="sm:col-span-2 rounded-2xl border border-navy/10 bg-softgray p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-extrabold uppercase text-navy">
                  Persyaratan Dokumen PPDB Unit Ini
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setUnitDraft((d) =>
                      d
                        ? {
                            ...d,
                            required_documents: [
                              ...d.required_documents,
                              {
                                key: `dok_${Date.now()}`,
                                label: 'Dokumen Tambahan',
                                required: false,
                                description: '',
                              },
                            ],
                          }
                        : d
                    )
                  }
                  className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-navy ring-1 ring-navy/15 hover:bg-navy-soft"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Syarat</span>
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {unitDraft.required_documents.map((doc: RequiredDocumentConfig, idx: number) => (
                  <div
                    key={doc.key}
                    className="flex flex-wrap items-center gap-2 rounded-xl bg-white p-2.5 shadow-sm"
                  >
                    <input
                      type="text"
                      value={doc.label}
                      onChange={(e) => {
                        const updated = [...unitDraft.required_documents];
                        updated[idx] = { ...doc, label: e.target.value };
                        setUnitDraft((d) => (d ? { ...d, required_documents: updated } : d));
                      }}
                      className="flex-1 rounded-lg border border-navy/15 px-2.5 py-1.5 text-xs"
                    />
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-navy">
                      <input
                        type="checkbox"
                        checked={doc.required}
                        onChange={(e) => {
                          const updated = [...unitDraft.required_documents];
                          updated[idx] = { ...doc, required: e.target.checked };
                          setUnitDraft((d) => (d ? { ...d, required_documents: updated } : d));
                        }}
                      />
                      Wajib
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = unitDraft.required_documents.filter((_, i) => i !== idx);
                        setUnitDraft((d) => (d ? { ...d, required_documents: updated } : d));
                      }}
                      className="text-rose-600 hover:text-rose-800 p-1"
                      aria-label="Hapus syarat"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2 mt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-navy px-8 py-3 text-sm font-extrabold text-white shadow-md hover:bg-navy-deep disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Simpan Perubahan Profil Sekolah</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SECTION: INFORMATION (UNIFIED INFORMASI & KEGIATAN)
  // =========================================================================
  if (section === 'information') {
    // Compile unified content items
    const rawItems: Array<{
      id: string;
      source: 'news' | 'events' | 'galleries';
      category: 'berita' | 'pengumuman' | 'agenda' | 'galeri';
      categoryLabel: string;
      title: string;
      excerpt: string;
      content: string;
      thumbnail: string;
      unitId: string | null;
      unitName: string;
      dateIso: string;
      location?: string;
      isPublished: boolean;
    }> = [];

    // 1. News items
    data.news.forEach((n) => {
      const isPengumuman = n.category?.slug === 'pengumuman' || n.category_id === 'cat-2';
      const catKey = isPengumuman ? 'pengumuman' : 'berita';
      rawItems.push({
        id: n.id,
        source: 'news',
        category: catKey,
        categoryLabel: isPengumuman ? 'Pengumuman' : 'Berita Sekolah',
        title: n.title,
        excerpt: n.excerpt,
        content: n.content,
        thumbnail: n.thumbnail_url || '/images/campus-building.jpg',
        unitId: n.unit_id ?? null,
        unitName: n.unit ? n.unit.name : 'Yayasan Pusat',
        dateIso: n.published_at || n.created_at,
        isPublished: n.status === 'published',
      });
    });

    // 2. Events items
    data.events.forEach((e) => {
      const unitObj = data.units.find((u) => u.id === e.unit_id);
      rawItems.push({
        id: e.id,
        source: 'events',
        category: 'agenda',
        categoryLabel: 'Agenda Kegiatan',
        title: e.title,
        excerpt: e.description,
        content: e.description,
        thumbnail: '/images/campus-building.jpg',
        unitId: e.unit_id ?? null,
        unitName: unitObj ? unitObj.name : 'Yayasan Pusat',
        dateIso: e.start_date,
        location: e.location,
        isPublished: e.is_published,
      });
    });

    // 3. Galleries items
    data.galleries.forEach((g) => {
      const unitObj = data.units.find((u) => u.id === g.unit_id);
      rawItems.push({
        id: g.id,
        source: 'galleries',
        category: 'galeri',
        categoryLabel: 'Galeri Foto',
        title: g.title,
        excerpt: g.description ?? '',
        content: g.description ?? '',
        thumbnail: g.cover_image_url || '/images/campus-building.jpg',
        unitId: g.unit_id ?? null,
        unitName: unitObj ? unitObj.name : 'Yayasan Pusat',
        dateIso: g.event_date || g.created_at,
        isPublished: g.is_published,
      });
    });

    // Filter items based on user role and filters
    const filteredItems = rawItems.filter((item) => {
      // Role scope filter
      if (profile.role !== 'super_admin' && activeUnit) {
        if (item.unitId !== activeUnit.id) return false;
      }

      // Unit filter for super admin
      if (profile.role === 'super_admin' && contentUnitFilter !== 'all') {
        if (contentUnitFilter === 'yayasan' && item.unitId !== null) return false;
        if (contentUnitFilter !== 'yayasan' && item.unitId !== contentUnitFilter) return false;
      }

      // Category filter
      if (contentCategoryFilter !== 'all' && item.category !== contentCategoryFilter) {
        return false;
      }

      // Search keyword filter
      if (contentSearch.trim()) {
        const q = contentSearch.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesExcerpt = item.excerpt.toLowerCase().includes(q);
        if (!matchesTitle && !matchesExcerpt) return false;
      }

      return true;
    });

    // Handler to start editing
    const handleStartEdit = (item: (typeof rawItems)[0]) => {
      setEditingId(item.id);
      setEditingType(item.source);
      setInfoTitle(item.title);
      setInfoCategory(item.category);
      setInfoUnitId(item.unitId ?? '');
      setInfoExcerpt(item.excerpt);
      setInfoContent(item.content);
      setInfoThumbnail(item.thumbnail);
      setInfoLocation(item.location || 'Kampus Yayasan Muhammad Tahir Garut');
      if (item.dateIso) {
        try {
          setInfoDate(new Date(item.dateIso).toISOString().slice(0, 16));
        } catch {
          setInfoDate(new Date().toISOString().slice(0, 16));
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handler for saving content
    const handleSaveContent = async (targetStatus: 'published' | 'draft') => {
      if (!infoTitle.trim()) {
        setError('Judul konten wajib diisi.');
        return;
      }

      const isPublishedBool = targetStatus === 'published';
      const action = editingId ? 'update' : 'create';

      if (infoCategory === 'berita' || infoCategory === 'pengumuman') {
        const catId = infoCategory === 'pengumuman' ? 'cat-2' : (data.newsCategories[0]?.id ?? 'cat-1');
        const ok = await callCmsApi(
          'news',
          action,
          {
            title: infoTitle.trim(),
            excerpt: infoExcerpt.trim() || infoTitle.trim(),
            content: infoContent.trim() || infoExcerpt.trim() || infoTitle.trim(),
            thumbnail_url: infoThumbnail,
            unit_id: infoUnitId || null,
            category_id: catId,
            status: targetStatus,
          },
          editingId ?? undefined
        );
        if (ok) resetInfoForm();
      } else if (infoCategory === 'agenda') {
        const ok = await callCmsApi(
          'events',
          action,
          {
            title: infoTitle.trim(),
            description: infoContent.trim() || infoExcerpt.trim() || infoTitle.trim(),
            location: infoLocation.trim() || 'Kampus Yayasan Muhammad Tahir Garut',
            start_date: new Date(infoDate).toISOString(),
            unit_id: infoUnitId || null,
            is_published: isPublishedBool,
          },
          editingId ?? undefined
        );
        if (ok) resetInfoForm();
      } else if (infoCategory === 'galeri') {
        const ok = await callCmsApi(
          'galleries',
          action,
          {
            title: infoTitle.trim(),
            description: infoExcerpt.trim() || infoContent.trim() || '',
            cover_image_url: infoThumbnail,
            unit_id: infoUnitId || null,
            event_date: infoDate.slice(0, 10),
            is_published: isPublishedBool,
            items: [{ media_type: 'photo', media_url: infoThumbnail, caption: infoTitle.trim() }],
          },
          editingId ?? undefined
        );
        if (ok) resetInfoForm();
      }
    };

    // Handler to toggle published / draft status in place
    const handleToggleStatus = async (item: (typeof rawItems)[0]) => {
      const nextPublished = !item.isPublished;
      if (item.source === 'news') {
        await callCmsApi(
          'news',
          'update',
          {
            title: item.title,
            excerpt: item.excerpt,
            content: item.content,
            thumbnail_url: item.thumbnail,
            status: nextPublished ? 'published' : 'draft',
          },
          item.id
        );
      } else if (item.source === 'events') {
        await callCmsApi(
          'events',
          'update',
          {
            title: item.title,
            description: item.content,
            location: item.location || 'Kampus Yayasan Muhammad Tahir Garut',
            start_date: item.dateIso,
            is_published: nextPublished,
          },
          item.id
        );
      } else if (item.source === 'galleries') {
        await callCmsApi(
          'galleries',
          'update',
          {
            title: item.title,
            cover_image_url: item.thumbnail,
            is_published: nextPublished,
          },
          item.id
        );
      }
    };

    // Handler to delete item
    const handleDeleteItem = async (item: (typeof rawItems)[0]) => {
      const confirmMsg = `Hapus "${item.title}" (${item.categoryLabel})?`;
      if (!window.confirm(confirmMsg)) return;
      await callCmsApi(item.source, 'delete', undefined, item.id);
    };

    return (
      <div className="space-y-6">
        {/* FORM TAMBAH / UBAH KONTEN */}
        <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy/10 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-navy-deep">
                {editingId ? 'Edit Konten Publikasi' : 'Buat Informasi / Kegiatan Baru'}
              </h2>
              <p className="text-xs text-slate-500">
                Kelola berita sekolah, pengumuman, agenda kegiatan, dan galeri dokumentasi foto dalam satu form terpadu.
              </p>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetInfoForm}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                <X className="h-3.5 w-3.5" />
                <span>Batal Edit</span>
              </button>
            )}
          </div>

          <StatusBanner />

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-navy">Kategori Konten *</label>
              <select
                value={infoCategory}
                onChange={(e) => setInfoCategory(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none bg-white font-semibold"
              >
                <option value="berita">📰 Berita Sekolah</option>
                <option value="pengumuman">📢 Pengumuman Resmi</option>
                <option value="agenda">📅 Agenda Kegiatan</option>
                <option value="galeri">🖼️ Galeri Foto / Dokumentasi</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-navy">Lingkup Unit Pendidikan</label>
              <select
                value={infoUnitId}
                disabled={profile.role !== 'super_admin'}
                onChange={(e) => setInfoUnitId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none bg-white font-semibold disabled:bg-slate-100 disabled:text-slate-600"
              >
                {profile.role === 'super_admin' && <option value="">🏛️ Yayasan Pusat</option>}
                {data.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    🏫 {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-navy">Judul Konten *</label>
              <input
                type="text"
                required
                value={infoTitle}
                onChange={(e) => setInfoTitle(e.target.value)}
                placeholder="Contoh: Pembukaan PPDB Tahun Ajaran 2027/2028"
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
            </div>

            {infoCategory === 'agenda' && (
              <>
                <div>
                  <label className="text-xs font-bold text-navy">Waktu & Tanggal Kegiatan *</label>
                  <input
                    type="datetime-local"
                    required
                    value={infoDate}
                    onChange={(e) => setInfoDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-navy">Lokasi Kegiatan *</label>
                  <input
                    type="text"
                    required
                    value={infoLocation}
                    onChange={(e) => setInfoLocation(e.target.value)}
                    placeholder="Contoh: Gedung Aula Utama Yayasan"
                    className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none"
                  />
                </div>
              </>
            )}

            {infoCategory === 'galeri' && (
              <div>
                <label className="text-xs font-bold text-navy">Tanggal Dokumentasi Kegiatan *</label>
                <input
                  type="date"
                  required
                  value={infoDate.slice(0, 10)}
                  onChange={(e) => setInfoDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-navy">Ringkasan Singkat *</label>
              <input
                type="text"
                required
                value={infoExcerpt}
                onChange={(e) => setInfoExcerpt(e.target.value)}
                placeholder="Ringkasan 1-2 kalimat untuk kartu informasi di beranda"
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-navy">
                {infoCategory === 'galeri' ? 'Keterangan Foto' : 'Isi Lengkap Informasi *'}
              </label>
              <textarea
                rows={4}
                required={infoCategory !== 'galeri'}
                value={infoContent}
                onChange={(e) => setInfoContent(e.target.value)}
                placeholder="Tuliskan isi informasi, ketentuan, rincian jadwal, atau deskripsi secara lengkap..."
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 border-t border-navy/10 pt-4">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-16 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-navy/10">
                  <Image
                    src={infoThumbnail}
                    alt="Thumbnail"
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-softgray px-4 py-2 text-xs font-bold text-navy ring-1 ring-navy/15 hover:bg-slate-200">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload Foto / Sampul</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) =>
                      handleUploadImage(e.target.files?.[0] ?? null, 'information', (url) =>
                        setInfoThumbnail(url)
                      )
                    }
                  />
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveContent('draft')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                >
                  <EyeOff className="h-3.5 w-3.5" />
                  <span>Simpan sebagai Draft</span>
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveContent('published')}
                  className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-navy-deep disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                  <span>Publikasikan Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* DAFTAR KONTEN INFORMASI & KEGIATAN */}
        <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy/10 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-navy-deep">
                Daftar Seluruh Informasi & Kegiatan ({filteredItems.length})
              </h3>
              <p className="text-xs text-slate-500">
                Semua konten publikasi dapat diubah, diterbitkan, disimpan sebagai draf, atau dihapus sewaktu-waktu.
              </p>
            </div>
            <div className="w-full sm:w-auto">
              <input
                type="text"
                placeholder="Cari judul..."
                value={contentSearch}
                onChange={(e) => setContentSearch(e.target.value)}
                className="w-full sm:w-48 rounded-xl border border-navy/15 px-3 py-1.5 text-xs focus:border-navy focus:outline-none"
              />
            </div>
          </div>

          {/* Filter Bar */}
          <div className="my-4 flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1 rounded-xl bg-softgray p-1">
              {[
                { key: 'all', label: 'Semua Kategori' },
                { key: 'berita', label: '📰 Berita' },
                { key: 'pengumuman', label: '📢 Pengumuman' },
                { key: 'agenda', label: '📅 Agenda' },
                { key: 'galeri', label: '🖼️ Galeri' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setContentCategoryFilter(tab.key)}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    contentCategoryFilter === tab.key
                      ? 'bg-navy text-white shadow-xs'
                      : 'text-slate-600 hover:text-navy'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {profile.role === 'super_admin' && (
              <select
                value={contentUnitFilter}
                onChange={(e) => setContentUnitFilter(e.target.value)}
                className="rounded-xl border border-navy/15 px-3 py-1 text-xs font-bold text-navy bg-white"
              >
                <option value="all">Semua Unit & Yayasan</option>
                <option value="yayasan">Hanya Yayasan Pusat</option>
                {data.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-navy/15 p-8 text-center text-xs text-slate-500">
              Tidak ada konten publikasi yang sesuai dengan kriteria filter saat ini.
            </div>
          ) : (
            <div className="divide-y divide-navy/10">
              {filteredItems.map((item) => {
                const badgeColor =
                  item.category === 'berita'
                    ? 'bg-blue-50 text-blue-700 ring-blue-200'
                    : item.category === 'pengumuman'
                      ? 'bg-amber-50 text-amber-700 ring-amber-200'
                      : item.category === 'agenda'
                        ? 'bg-purple-50 text-purple-700 ring-purple-200'
                        : 'bg-emerald-50 text-emerald-700 ring-emerald-200';

                return (
                  <div
                    key={`${item.source}-${item.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-navy/10">
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ring-1 ${badgeColor}`}
                          >
                            {item.categoryLabel}
                          </span>
                          <span className="rounded-full bg-softgray px-2 py-0.5 text-[10px] font-bold text-slate-600">
                            {item.unitName}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ring-1 ${
                              item.isPublished
                                ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                : 'bg-slate-100 text-slate-600 ring-slate-200'
                            }`}
                          >
                            {item.isPublished ? '● Terbit' : '○ Draf'}
                          </span>
                        </div>
                        <p className="mt-1 font-bold text-navy-deep text-sm truncate">{item.title}</p>
                        <p className="text-xs text-slate-500 line-clamp-1">{item.excerpt}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {formatDateId(item.dateIso)} {item.location ? `• ${item.location}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(item)}
                        className="inline-flex items-center gap-1 rounded-full bg-navy-soft px-3 py-1.5 text-xs font-bold text-navy hover:bg-navy hover:text-white transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Ubah</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                          item.isPublished
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ring-1 ring-emerald-200'
                        }`}
                      >
                        {item.isPublished ? (
                          <>
                            <EyeOff className="h-3 w-3" />
                            <span>Jadikan Draf</span>
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3" />
                            <span>Terbitkan</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item)}
                        className="rounded-full p-2 text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus Konten"
                        aria-label="Hapus konten"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // SECTION: USERS (PENGGUNA / KELOLA AKUN KEPALA SEKOLAH - SUPER ADMIN)
  // =========================================================================
  if (section === 'users') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6 shadow-sm">
          <div className="border-b border-navy/10 pb-4 mb-4">
            <h2 className="text-lg font-extrabold text-navy-deep">Tambah Akun Kepala Sekolah Baru</h2>
            <p className="text-xs text-slate-500">
              Ketentuan: Akun Kepala Sekolah hanya boleh dibuat oleh Ketua Yayasan. Tentukan unit yang berhak dikelola.
            </p>
          </div>

          <StatusBanner />

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await callCmsApi('users', 'create', {
                full_name: userName,
                email: userEmail,
                password: userPassword,
                role_code: userRoleCode,
                unit_ids: userUnitIds,
              });
              if (ok) {
                setUserName('');
                setUserEmail('');
                setUserPassword('');
                setUserUnitIds([]);
              }
            }}
            className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div>
              <label className="text-xs font-bold text-navy">Nama Lengkap Kepala Sekolah *</label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Contoh: Drs. H. Ahmad Sanusi, M.Pd"
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy">Email Login Resmi *</label>
              <input
                type="email"
                required
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="kepala.ra@yayasanmuhammadtahirgarut.sch.id"
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy">Kata Sandi Awal (Min. 8 karakter) *</label>
              <input
                type="password"
                minLength={8}
                required
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy">Hak Akses (Role)</label>
              <select
                value={userRoleCode}
                onChange={(e) =>
                  setUserRoleCode(e.target.value as 'super_admin' | 'admin_unit' | 'panitia_ppdb')
                }
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-navy focus:outline-none font-semibold bg-white"
              >
                <option value="admin_unit">Kepala Sekolah / Admin Unit</option>
                <option value="panitia_ppdb">Panitia PPDB Terpadu</option>
                <option value="super_admin">Ketua Yayasan / Super Admin</option>
              </select>
            </div>

            {userRoleCode !== 'super_admin' && (
              <div className="sm:col-span-2 rounded-2xl bg-softgray p-4 border border-navy/10">
                <p className="text-xs font-bold text-navy">Pilih Unit Pendidikan yang Ditetapkan:</p>
                <div className="mt-2 flex flex-wrap gap-4">
                  {data.units.map((u) => (
                    <label key={u.id} className="inline-flex items-center gap-2 text-xs font-bold text-navy-deep cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userUnitIds.includes(u.id)}
                        onChange={(e) =>
                          setUserUnitIds((prev) =>
                            e.target.checked ? [...prev, u.id] : prev.filter((id) => id !== u.id)
                          )
                        }
                        className="rounded"
                      />
                      <span>{u.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-navy px-8 py-3 text-xs font-extrabold text-white shadow-md hover:bg-navy-deep disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span>Buat Akun Pengelola</span>
              </button>
            </div>
          </form>
        </div>

        {/* LIST DAFTAR PENGGUNA */}
        <div className="divide-y divide-navy/10 rounded-2xl border border-navy/10 bg-white shadow-sm">
          <div className="p-4 bg-softgray rounded-t-2xl border-b border-navy/10">
            <h3 className="text-sm font-extrabold text-navy-deep">
              Daftar Akun Pengelola Terdaftar ({localUsers.length})
            </h3>
          </div>
          {localUsers.map((u) => {
            const isProtected = u.email.toLowerCase() === 'admin@yayasanmuhammadtahirgarut.sch.id';
            return (
              <div
                key={u.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4 sm:flex-nowrap"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-navy-deep">{u.full_name}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        u.is_active
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                          : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                      }`}
                    >
                      {u.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{u.email}</p>
                  {u.unit_names.length > 0 && (
                    <p className="mt-0.5 text-[11px] font-semibold text-gold-dark">
                      Unit: {u.unit_names.join(', ')}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 sm:ml-auto">
                  <span className="rounded-full bg-navy-soft px-3 py-1 text-xs font-bold text-navy">
                    {u.role_name}
                  </span>

                  {!isProtected && (
                    <>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={async () => {
                          const nextActive = !u.is_active;
                          setLocalUsers((prev) =>
                            prev.map((item) =>
                              item.id === u.id ? { ...item, is_active: nextActive } : item
                            )
                          );
                          await callCmsApi('users', 'update', { is_active: nextActive }, u.id);
                        }}
                        title={u.is_active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                          u.is_active
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {u.is_active ? (
                          <>
                            <UserX className="h-3 w-3" />
                            <span>Nonaktifkan</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-3 w-3" />
                            <span>Aktifkan</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={saving}
                        onClick={async () => {
                          const confirmed = window.confirm(
                            `Apakah Anda yakin ingin menghapus akun pengelola "${u.full_name}"?`
                          );
                          if (!confirmed) return;
                          setLocalUsers((prev) => prev.filter((item) => item.id !== u.id));
                          await callCmsApi('users', 'delete', undefined, u.id);
                        }}
                        title="Hapus Akun"
                        className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-100"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Hapus</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // SECTION: AUDIT LOGS
  // =========================================================================
  if (section === 'audit' && profile.role === 'super_admin') {
    return (
      <div className="divide-y divide-navy/10 rounded-2xl border border-navy/10 bg-white shadow-sm">
        <div className="p-4 bg-softgray rounded-t-2xl border-b border-navy/10">
          <h3 className="text-sm font-extrabold text-navy-deep">Catatan Aktivitas Admin</h3>
        </div>
        {data.auditLogs.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Belum ada catatan aktivitas admin.
          </div>
        ) : (
          data.auditLogs.map((log) => (
            <div key={log.id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-xs">
              <div>
                <p className="font-bold text-navy-deep">{log.action}</p>
                <p className="text-slate-500">
                  {log.actor_email} • {log.entity_type}
                </p>
              </div>
              <span className="text-slate-400">
                {formatDateId(log.created_at, { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>
    );
  }

  return null;
}
