# Panduan Konfigurasi Supabase, Google Sheets & Deployment Vercel

## 1. Setup Database Supabase

1. Buat project baru di [Supabase](https://supabase.com).
2. Buka **SQL Editor** dan jalankan ketiga file migrasi secara berurutan:
   - `supabase/migrations/001_initial_schema.sql` (23 tabel, relasi foreign key, indeks, trigger `updated_at`, dan fungsi atomik `generate_registration_number`)
   - `supabase/migrations/002_rls_and_storage.sql` (Row Level Security per role & unit, serta bucket `public-assets` dan bucket privat `ppdb-documents`)
   - `supabase/migrations/003_seed_data.sql` (role master, pengaturan yayasan awal, unit R.A./MI/SMP, tahun ajaran, dan gelombang PPDB)
3. Salin nilai berikut dari **Project Settings -> API** ke `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (khusus server, jangan pernah diberi awalan `NEXT_PUBLIC_`)

## 2. Membuat Akun Super Admin Pertama

1. Buka **Authentication -> Users -> Add User** di Dashboard Supabase dan buat akun admin yayasan (centang *Auto Confirm User*).
2. Salin `UUID` user yang baru dibuat, lalu jalankan SQL berikut di **SQL Editor**:

```sql
INSERT INTO public.profiles (id, full_name, email, role_id, is_active)
SELECT
  'PASTE_USER_UUID_DISINI'::uuid,
  'Super Admin Yayasan',
  'admin@yayasanmuhammadtahirgarut.sch.id',
  id,
  TRUE
FROM public.roles
WHERE code = 'super_admin';
```

3. Login melalui `/admin`. Setelah masuk, Anda dapat membuat akun **Admin Unit** dan **Panitia PPDB** langsung dari menu **Pengguna Admin** di Dashboard.

## 3. Setup Integrasi Google Sheets API

1. Buat Google Spreadsheet baru dan buat **5 tab** dengan nama persis berikut:
   - `Semua Pendaftar`
   - `Pendaftar R.A.`
   - `Pendaftar MI`
   - `Pendaftar SMP`
   - `Laporan PPDB`
2. Di Google Cloud Console:
   - Aktifkan **Google Sheets API**.
   - Buat **Service Account** dan unduh kunci JSON.
   - Bagikan (Share) file Google Spreadsheet ke alamat `client_email` Service Account tersebut dengan izin **Editor**.
3. Isi `.env.local` (dan Environment Variables Vercel):
   - `GOOGLE_SHEETS_SPREADSHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`

## 4. Deployment ke Vercel

1. Push repository ke GitHub.
2. Import project di [Vercel](https://vercel.com).
3. Tambahkan seluruh environment variables dari `.env.example` ke **Project Settings -> Environment Variables**.
4. Deploy dan hubungkan domain resmi yayasan (misal `yayasanmuhammadtahirgarut.sch.id`), lalu perbarui `NEXT_PUBLIC_SITE_URL` ke domain produksi.
