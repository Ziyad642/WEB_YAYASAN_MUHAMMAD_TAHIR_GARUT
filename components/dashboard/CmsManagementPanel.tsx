'use client';

import { Loader2, Plus, Save, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import type { AdminDashboardPayload } from '@/lib/data/admin-repository';
import { formatDateId } from '@/lib/utils';
import type { AuthSessionProfile, RequiredDocumentConfig } from '@/types/database';

interface CmsManagementPanelProps {
  section:
    | 'foundation'
    | 'units'
    | 'news'
    | 'galleries'
    | 'events'
    | 'teachers'
    | 'periods'
    | 'users'
    | 'audit';
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

  // Foundation settings state
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

  // Unit editor state
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
          required_documents: activeUnit.required_documents,
        }
      : null
  );

  // News creation state
  const [newsTitle, setNewsTitle] = useState('');
  const [newsExcerpt, setNewsExcerpt] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsThumb, setNewsThumb] = useState('/images/campus-building.jpg');
  const [newsUnitId, setNewsUnitId] = useState(
    profile.role === 'super_admin' ? '' : (data.units[0]?.id ?? '')
  );
  const [newsCategoryId, setNewsCategoryId] = useState(data.newsCategories[0]?.id ?? '');

  // Gallery creation state
  const [galTitle, setGalTitle] = useState('');
  const [galDesc, setGalDesc] = useState('');
  const [galCover, setGalCover] = useState('/images/campus-building.jpg');
  const [galUnitId, setGalUnitId] = useState(
    profile.role === 'super_admin' ? '' : (data.units[0]?.id ?? '')
  );

  // Event creation state
  const [evtTitle, setEvtTitle] = useState('');
  const [evtDesc, setEvtDesc] = useState('');
  const [evtLocation, setEvtLocation] = useState('');
  const [evtDate, setEvtDate] = useState('');
  const [evtUnitId, setEvtUnitId] = useState(
    profile.role === 'super_admin' ? '' : (data.units[0]?.id ?? '')
  );

  // Teacher creation state
  const [tchUnitId, setTchUnitId] = useState(data.units[0]?.id ?? '');
  const [tchName, setTchName] = useState('');
  const [tchPos, setTchPos] = useState('');
  const [tchSubject, setTchSubject] = useState('');

  // Period creation state
  const [periodUnitId, setPeriodUnitId] = useState(data.units[0]?.id ?? '');
  const [periodYearId, setPeriodYearId] = useState(data.academicYears[0]?.id ?? '');
  const [periodName, setPeriodName] = useState('Gelombang 2 Tahun Ajaran 2027/2028');
  const [periodStart, setPeriodStart] = useState('2027-04-01');
  const [periodEnd, setPeriodEnd] = useState('2027-07-15');
  const [periodQuota, setPeriodQuota] = useState(60);

  // User creation state
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRoleCode, setUserRoleCode] = useState<'super_admin' | 'admin_unit' | 'panitia_ppdb'>(
    'admin_unit'
  );
  const [userUnitIds, setUserUnitIds] = useState<string[]>([]);

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
      setMessage('Perubahan berhasil disimpan.');
      onRefresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
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
      setMessage('Gambar berhasil diunggah ke Supabase Storage.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload gagal.');
    } finally {
      setSaving(false);
    }
  };

  const StatusBanner = () => (
    <>
      {message && (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">
          {error}
        </div>
      )}
    </>
  );

  // =========================================================================
  // 1. PROFIL & PENGATURAN YAYASAN (SUPER ADMIN)
  // =========================================================================
  if (section === 'foundation') {
    return (
      <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-extrabold text-navy-deep">
          Pengaturan & Profil Yayasan Pusat
        </h2>
        <p className="mt-1 mb-5 text-xs text-slate-500">
          Seluruh informasi alamat, kontak, logo, foto hero, visi misi, dan banner PPDB dapat diubah dari sini.
        </p>
        <StatusBanner />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const mission = foundationForm.missionText
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean);
            void callCmsApi('foundation_settings', 'update', {
              ...foundationForm,
              mission,
              is_placeholder_data: false,
            });
          }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <div>
            <label className="text-xs font-bold text-navy">Nama Yayasan</label>
            <input
              type="text"
              value={foundationForm.foundation_name}
              onChange={(e) =>
                setFoundationForm((f) => ({ ...f, foundation_name: e.target.value }))
              }
              className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-navy">Tagline</label>
            <input
              type="text"
              value={foundationForm.tagline}
              onChange={(e) => setFoundationForm((f) => ({ ...f, tagline: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-navy">Telepon</label>
            <input
              type="text"
              value={foundationForm.phone}
              onChange={(e) => setFoundationForm((f) => ({ ...f, phone: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-navy">Email Resmi</label>
            <input
              type="email"
              value={foundationForm.email}
              onChange={(e) => setFoundationForm((f) => ({ ...f, email: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-navy">Alamat Lengkap</label>
            <input
              type="text"
              value={foundationForm.address}
              onChange={(e) => setFoundationForm((f) => ({ ...f, address: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-navy">Deskripsi Singkat</label>
            <textarea
              rows={2}
              value={foundationForm.short_description}
              onChange={(e) =>
                setFoundationForm((f) => ({ ...f, short_description: e.target.value }))
              }
              className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-navy">Visi Yayasan</label>
            <textarea
              rows={2}
              value={foundationForm.vision}
              onChange={(e) => setFoundationForm((f) => ({ ...f, vision: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-navy">Misi Yayasan (1 baris per poin)</label>
            <textarea
              rows={4}
              value={foundationForm.missionText}
              onChange={(e) =>
                setFoundationForm((f) => ({ ...f, missionText: e.target.value }))
              }
              className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-navy">Sejarah Yayasan</label>
            <textarea
              rows={4}
              value={foundationForm.history}
              onChange={(e) => setFoundationForm((f) => ({ ...f, history: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
            />
          </div>

          <div className="sm:col-span-2 flex flex-wrap items-center gap-4 rounded-2xl bg-softgray p-4">
            <div>
              <p className="text-xs font-bold text-navy">Ganti Foto Hero Landing Page</p>
              <p className="text-[11px] text-slate-500">Saat ini: {foundationForm.hero_image_url}</p>
            </div>
            <label className="ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-navy ring-1 ring-navy/15">
              <Upload className="h-3.5 w-3.5" />
              <span>Upload Foto Hero</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) =>
                  handleUploadImage(e.target.files?.[0] ?? null, 'hero', (url) =>
                    setFoundationForm((f) => ({ ...f, hero_image_url: url }))
                  )
                }
              />
            </label>
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-sm font-extrabold text-navy-deep hover:bg-gold-light"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Simpan Pengaturan Yayasan</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // =========================================================================
  // 2. PROFIL UNIT PENDIDIKAN, UPLOAD LOGO RESMI & SYARAT PPDB UNIT
  // =========================================================================
  if (section === 'units' && activeUnit && unitDraft) {
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
          required_documents: u.required_documents,
        });
      }
    };

    const addDocRequirement = () => {
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
      );
    };

    return (
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {data.units.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => selectUnit(u.id)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                u.id === activeUnit.id
                  ? 'bg-navy text-white'
                  : 'bg-white text-navy ring-1 ring-navy/15 hover:bg-navy-soft'
              }`}
            >
              {u.name}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
          <StatusBanner />
          <div className="mb-5 flex flex-wrap items-center gap-4 rounded-2xl bg-softgray p-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-white p-1 ring-1 ring-navy/10">
              <Image
                src={unitDraft.logo_url}
                alt={unitDraft.name}
                fill
                sizes="64px"
                className="object-contain p-1"
              />
            </div>
            <div>
              <p className="text-sm font-extrabold text-navy-deep">{unitDraft.name}</p>
              <p className="text-xs text-slate-500">
                {unitDraft.is_logo_placeholder
                  ? 'Menggunakan logo placeholder — silakan unggah logo resmi unit.'
                  : 'Logo resmi terpasang.'}
              </p>
            </div>
            <label className="ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-xs font-bold text-white hover:bg-navy-deep">
              <Upload className="h-3.5 w-3.5" />
              <span>Ganti Logo Unit</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) =>
                  handleUploadImage(e.target.files?.[0] ?? null, `logos-${activeUnit.slug}`, (url) =>
                    setUnitDraft((d) =>
                      d ? { ...d, logo_url: url, is_logo_placeholder: false } : d
                    )
                  )
                }
              />
            </label>
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
              <label className="text-xs font-bold text-navy">Nama Unit</label>
              <input
                type="text"
                value={unitDraft.name}
                onChange={(e) => setUnitDraft((d) => (d ? { ...d, name: e.target.value } : d))}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy">Kepala Unit</label>
              <input
                type="text"
                value={unitDraft.headmaster_name}
                onChange={(e) =>
                  setUnitDraft((d) => (d ? { ...d, headmaster_name: e.target.value } : d))
                }
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-navy">Profil Lengkap Unit</label>
              <textarea
                rows={3}
                value={unitDraft.full_profile}
                onChange={(e) =>
                  setUnitDraft((d) => (d ? { ...d, full_profile: e.target.value } : d))
                }
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-navy">Visi Unit</label>
              <textarea
                rows={2}
                value={unitDraft.vision}
                onChange={(e) => setUnitDraft((d) => (d ? { ...d, vision: e.target.value } : d))}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-navy">Misi Unit (1 baris per poin)</label>
              <textarea
                rows={3}
                value={unitDraft.missionText}
                onChange={(e) =>
                  setUnitDraft((d) => (d ? { ...d, missionText: e.target.value } : d))
                }
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
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
                  onClick={addDocRequirement}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-navy ring-1 ring-navy/15"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Syarat</span>
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {unitDraft.required_documents.map((doc: RequiredDocumentConfig, idx: number) => (
                  <div
                    key={doc.key}
                    className="flex flex-wrap items-center gap-2 rounded-xl bg-white p-2.5"
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
                      className="text-rose-600 hover:text-rose-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-sm font-extrabold text-navy-deep hover:bg-gold-light"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Simpan Profil Unit</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. BERITA (CMS)
  // =========================================================================
  if (section === 'news') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-extrabold text-navy-deep">Terbitkan Berita Baru</h2>
          <StatusBanner />
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await callCmsApi('news', 'create', {
                title: newsTitle,
                excerpt: newsExcerpt,
                content: newsContent,
                thumbnail_url: newsThumb,
                unit_id: newsUnitId || null,
                category_id: newsCategoryId || null,
                status: 'published',
              });
              if (ok) {
                setNewsTitle('');
                setNewsExcerpt('');
                setNewsContent('');
              }
            }}
            className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-navy">Judul Berita *</label>
              <input
                type="text"
                required
                value={newsTitle}
                onChange={(e) => setNewsTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy">Lingkup Unit</label>
              <select
                value={newsUnitId}
                onChange={(e) => setNewsUnitId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              >
                {profile.role === 'super_admin' && <option value="">Yayasan Pusat</option>}
                {data.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-navy">Kategori</label>
              <select
                value={newsCategoryId}
                onChange={(e) => setNewsCategoryId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              >
                {data.newsCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-navy">Ringkasan Singkat *</label>
              <input
                type="text"
                required
                value={newsExcerpt}
                onChange={(e) => setNewsExcerpt(e.target.value)}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-navy">Isi Berita Lengkap *</label>
              <textarea
                rows={4}
                required
                value={newsContent}
                onChange={(e) => setNewsContent(e.target.value)}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-navy-soft px-4 py-2 text-xs font-bold text-navy">
                <Upload className="h-3.5 w-3.5" />
                <span>Upload Thumbnail</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) =>
                    handleUploadImage(e.target.files?.[0] ?? null, 'news', (url) =>
                      setNewsThumb(url)
                    )
                  }
                />
              </label>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-2.5 text-sm font-bold text-white hover:bg-navy-deep"
              >
                <Plus className="h-4 w-4" />
                <span>Publikasikan Berita</span>
              </button>
            </div>
          </form>
        </div>

        <div className="divide-y divide-navy/10 rounded-2xl border border-navy/10 bg-white">
          {data.news.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-bold text-navy-deep">{item.title}</p>
                <p className="text-xs text-slate-500">
                  {item.unit ? item.unit.name : 'Yayasan Pusat'} • {formatDateId(item.published_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => callCmsApi('news', 'delete', undefined, item.id)}
                className="rounded-full p-2 text-rose-600 hover:bg-rose-50"
                aria-label="Hapus berita"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. GALERI
  // =========================================================================
  if (section === 'galleries') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-extrabold text-navy-deep">Tambah Album Galeri</h2>
          <StatusBanner />
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await callCmsApi('galleries', 'create', {
                title: galTitle,
                description: galDesc,
                cover_image_url: galCover,
                unit_id: galUnitId || null,
                items: [{ media_type: 'photo', media_url: galCover, caption: galTitle }],
              });
              if (ok) {
                setGalTitle('');
                setGalDesc('');
              }
            }}
            className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div>
              <label className="text-xs font-bold text-navy">Judul Album *</label>
              <input
                type="text"
                required
                value={galTitle}
                onChange={(e) => setGalTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy">Unit</label>
              <select
                value={galUnitId}
                onChange={(e) => setGalUnitId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              >
                {profile.role === 'super_admin' && <option value="">Yayasan Pusat</option>}
                {data.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-navy">Deskripsi</label>
              <input
                type="text"
                value={galDesc}
                onChange={(e) => setGalDesc(e.target.value)}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-navy-soft px-4 py-2 text-xs font-bold text-navy">
                <Upload className="h-3.5 w-3.5" />
                <span>Upload Foto Sampul</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) =>
                    handleUploadImage(e.target.files?.[0] ?? null, 'gallery', (url) =>
                      setGalCover(url)
                    )
                  }
                />
              </label>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-2.5 text-sm font-bold text-white"
              >
                <Plus className="h-4 w-4" />
                <span>Simpan Album</span>
              </button>
            </div>
          </form>
        </div>

        <div className="divide-y divide-navy/10 rounded-2xl border border-navy/10 bg-white">
          {data.galleries.map((g) => (
            <div key={g.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-bold text-navy-deep">{g.title}</p>
                <p className="text-xs text-slate-500">{g.unit ? g.unit.name : 'Yayasan Pusat'}</p>
              </div>
              <button
                type="button"
                onClick={() => callCmsApi('galleries', 'delete', undefined, g.id)}
                className="rounded-full p-2 text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 5. AGENDA
  // =========================================================================
  if (section === 'events') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-extrabold text-navy-deep">Tambah Agenda Kegiatan</h2>
          <StatusBanner />
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await callCmsApi('events', 'create', {
                title: evtTitle,
                description: evtDesc,
                location: evtLocation,
                start_date: new Date(evtDate).toISOString(),
                unit_id: evtUnitId || null,
                is_published: true,
              });
              if (ok) {
                setEvtTitle('');
                setEvtDesc('');
                setEvtLocation('');
              }
            }}
            className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div>
              <label className="text-xs font-bold text-navy">Nama Kegiatan *</label>
              <input
                type="text"
                required
                value={evtTitle}
                onChange={(e) => setEvtTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy">Tanggal & Waktu *</label>
              <input
                type="datetime-local"
                required
                value={evtDate}
                onChange={(e) => setEvtDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy">Lokasi *</label>
              <input
                type="text"
                required
                value={evtLocation}
                onChange={(e) => setEvtLocation(e.target.value)}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy">Unit</label>
              <select
                value={evtUnitId}
                onChange={(e) => setEvtUnitId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              >
                {profile.role === 'super_admin' && <option value="">Yayasan Pusat</option>}
                {data.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-navy">Keterangan *</label>
              <textarea
                rows={2}
                required
                value={evtDesc}
                onChange={(e) => setEvtDesc(e.target.value)}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-2.5 text-sm font-bold text-white"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Agenda</span>
              </button>
            </div>
          </form>
        </div>

        <div className="divide-y divide-navy/10 rounded-2xl border border-navy/10 bg-white">
          {data.events.map((ev) => (
            <div key={ev.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-bold text-navy-deep">{ev.title}</p>
                <p className="text-xs text-slate-500">
                  {formatDateId(ev.start_date)} • {ev.location}
                </p>
              </div>
              <button
                type="button"
                onClick={() => callCmsApi('events', 'delete', undefined, ev.id)}
                className="rounded-full p-2 text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 6. TENAGA PENDIDIK
  // =========================================================================
  if (section === 'teachers') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-extrabold text-navy-deep">Tambah Tenaga Pendidik</h2>
          <StatusBanner />
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await callCmsApi('teachers', 'create', {
                unit_id: tchUnitId,
                full_name: tchName,
                position: tchPos,
                subject_or_specialty: tchSubject,
              });
              if (ok) {
                setTchName('');
                setTchPos('');
                setTchSubject('');
              }
            }}
            className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div>
              <label className="text-xs font-bold text-navy">Unit Pendidikan</label>
              <select
                value={tchUnitId}
                onChange={(e) => setTchUnitId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              >
                {data.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-navy">Nama Lengkap *</label>
              <input
                type="text"
                required
                value={tchName}
                onChange={(e) => setTchName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy">Jabatan *</label>
              <input
                type="text"
                required
                value={tchPos}
                onChange={(e) => setTchPos(e.target.value)}
                placeholder="Contoh: Wali Kelas / Guru Tahfidz"
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy">Mata Pelajaran / Bidang</label>
              <input
                type="text"
                value={tchSubject}
                onChange={(e) => setTchSubject(e.target.value)}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-2.5 text-sm font-bold text-white"
              >
                <Plus className="h-4 w-4" />
                <span>Simpan Pendidik</span>
              </button>
            </div>
          </form>
        </div>

        <div className="divide-y divide-navy/10 rounded-2xl border border-navy/10 bg-white">
          {data.teachers.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-bold text-navy-deep">{t.full_name}</p>
                <p className="text-xs text-slate-500">
                  {t.position} {t.subject_or_specialty ? `• ${t.subject_or_specialty}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => callCmsApi('teachers', 'delete', undefined, t.id)}
                className="rounded-full p-2 text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 7. PERIODE & TAHUN AJARAN PPDB
  // =========================================================================
  if (section === 'periods') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-extrabold text-navy-deep">Buka Gelombang PPDB Baru</h2>
          <StatusBanner />
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await callCmsApi('admission_periods', 'create', {
                unit_id: periodUnitId,
                academic_year_id: periodYearId,
                name: periodName,
                start_date: periodStart,
                end_date: periodEnd,
                quota: periodQuota,
                is_open: true,
              });
            }}
            className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div>
              <label className="text-xs font-bold text-navy">Unit Pendidikan</label>
              <select
                value={periodUnitId}
                onChange={(e) => setPeriodUnitId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              >
                {data.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-navy">Tahun Ajaran</label>
              <select
                value={periodYearId}
                onChange={(e) => setPeriodYearId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              >
                {data.academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    {ay.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-navy">Nama Gelombang</label>
              <input
                type="text"
                required
                value={periodName}
                onChange={(e) => setPeriodName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy">Kuota Penerimaan</label>
              <input
                type="number"
                min={1}
                value={periodQuota}
                onChange={(e) => setPeriodQuota(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy">Tanggal Mulai</label>
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy">Tanggal Selesai</label>
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-2.5 text-sm font-bold text-white"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Gelombang</span>
              </button>
            </div>
          </form>
        </div>

        <div className="divide-y divide-navy/10 rounded-2xl border border-navy/10 bg-white">
          {data.admissionPeriods.map((p) => {
            const unitName = data.units.find((u) => u.id === p.unit_id)?.name ?? '-';
            return (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-bold text-navy-deep">
                    {unitName} — {p.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Kuota: {p.quota} • {p.start_date} s.d. {p.end_date}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    callCmsApi(
                      'admission_periods',
                      'update',
                      { is_open: !p.is_open, quota: p.quota },
                      p.id
                    )
                  }
                  className={`rounded-full px-4 py-1.5 text-xs font-bold ${
                    p.is_open
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {p.is_open ? 'Dibuka (Klik untuk Tutup)' : 'Ditutup (Klik untuk Buka)'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 8. PENGGUNA ADMIN (SUPER ADMIN)
  // =========================================================================
  if (section === 'users') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-extrabold text-navy-deep">Tambah Akun Pengelola Baru</h2>
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
              <label className="text-xs font-bold text-navy">Nama Lengkap *</label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy">Email Login *</label>
              <input
                type="email"
                required
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy">Kata Sandi Awal (Min 8) *</label>
              <input
                type="password"
                minLength={8}
                required
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy">Hak Akses (Role)</label>
              <select
                value={userRoleCode}
                onChange={(e) =>
                  setUserRoleCode(
                    e.target.value as 'super_admin' | 'admin_unit' | 'panitia_ppdb'
                  )
                }
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              >
                <option value="super_admin">Super Admin Yayasan</option>
                <option value="admin_unit">Admin Unit Pendidikan</option>
                <option value="panitia_ppdb">Panitia PPDB</option>
              </select>
            </div>
            {userRoleCode !== 'super_admin' && (
              <div className="sm:col-span-2">
                <p className="text-xs font-bold text-navy">Unit yang Diizinkan</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  {data.units.map((u) => (
                    <label key={u.id} className="inline-flex items-center gap-2 text-xs font-semibold">
                      <input
                        type="checkbox"
                        checked={userUnitIds.includes(u.id)}
                        onChange={(e) =>
                          setUserUnitIds((prev) =>
                            e.target.checked ? [...prev, u.id] : prev.filter((id) => id !== u.id)
                          )
                        }
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
                className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-2.5 text-sm font-bold text-white"
              >
                <Plus className="h-4 w-4" />
                <span>Buat Akun Admin</span>
              </button>
            </div>
          </form>
        </div>

        <div className="divide-y divide-navy/10 rounded-2xl border border-navy/10 bg-white">
          {data.users.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
              <div>
                <p className="text-sm font-bold text-navy-deep">{u.full_name}</p>
                <p className="text-xs text-slate-500">{u.email}</p>
              </div>
              <div className="text-right">
                <span className="rounded-full bg-navy-soft px-3 py-1 text-xs font-bold text-navy">
                  {u.role_name}
                </span>
                {u.unit_names.length > 0 && (
                  <p className="mt-1 text-[11px] text-slate-500">{u.unit_names.join(', ')}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 9. AUDIT LOGS (SUPER ADMIN)
  // =========================================================================
  return (
    <div className="divide-y divide-navy/10 rounded-2xl border border-navy/10 bg-white">
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
            <span className="text-slate-400">{formatDateId(log.created_at, { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        ))
      )}
    </div>
  );
}
