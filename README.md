# Website Resmi Yayasan Muhammad Tahir Garut

Ekosistem digital resmi **Yayasan Muhammad Tahir Garut** yang menggabungkan website publik yayasan, halaman khusus unit pendidikan (**R.A.**, **MI**, dan **SMP**), sistem **PPDB Online Terpusat**, **Database Supabase PostgreSQL + RLS + Private Storage**, **Sinkronisasi Otomatis Google Sheets**, serta **Dashboard Admin Multi-Role**.

## Fitur Utama

1. **Website Publik & Halaman Unit Pendidikan**
   - `/` — Beranda yayasan (mengikuti komposisi referensi desain Navy `#102F55`, Deep Navy `#082747`, dan Gold `#E9BC58`).
   - `/tentang` — Profil, sejarah, visi, dan misi yayasan.
   - `/unit-pendidikan`, `/unit-pendidikan/ra`, `/unit-pendidikan/mi`, `/unit-pendidikan/smp`.
   - `/berita` & `/berita/[slug]` — Publikasi berita dan pengumuman dengan pencarian & filter unit/kategori.
   - `/galeri` — Album foto dan video dengan lightbox.
   - `/agenda` — Kalender kegiatan yayasan dan unit.
   - `/kontak` — Informasi kontak resmi yayasan & masing-masing unit.
2. **PPDB Online Terpusat (`/ppdb` & `/cek-pendaftaran`)**
   - Formulir bertahap 5 langkah (Pilih Unit & Gelombang -> Data Siswa -> Data Orang Tua -> Upload Dokumen -> Konfirmasi).
   - Nomor pendaftaran unik otomatis di server (`MT-RA-2027-0001`, `MT-MI-2027-0001`, `MT-SMP-2027-0001`).
   - Penyimpanan dokumen persyaratan pada bucket privat `ppdb-documents` (diakses via Signed URL sementara oleh staf berwenang).
   - Bukti pendaftaran siap cetak & pengecekan status berbasis Nomor Pendaftaran + Tanggal Lahir dengan rate limiting.
3. **Sinkronisasi Google Sheets**
   - Menyimpan data utama di Supabase PostgreSQL, lalu menyinkronkan ke Google Sheets pada tab:
     - `Semua Pendaftar`
     - `Pendaftar R.A.`
     - `Pendaftar MI`
     - `Pendaftar SMP`
     - `Laporan PPDB`
   - Dilengkapi log sinkronisasi (`google_sync_logs`), anti-duplikat berdasarkan nomor pendaftaran, dan fitur retry/sinkronisasi ulang di Dashboard Admin.
4. **Dashboard Admin Multi-Role (`/admin` & `/admin/dashboard`)**
   - **Super Admin Yayasan**: Akses penuh seluruh unit, profil yayasan, CMS, PPDB, pengguna, dan audit logs.
   - **Admin Unit (R.A. / MI / SMP)**: Hanya mengelola konten, guru, persyaratan PPDB, dan verifikasi pendaftar pada unit yang ditugaskan.
   - **Panitia PPDB**: Memeriksa dokumen, memverifikasi, dan mengekspor laporan pendaftar sesuai unit.

## Aset Logo & Placeholder yang Perlu Dilengkapi

- `public/logos/logo-yayasan.png` — Logo resmi Yayasan (terpasang).
- `public/logos/logo-ra.png` — Logo resmi R.A. (terpasang).
- `public/logos/logo-smp.png` — Logo resmi SMP (terpasang).
- `public/logos/logo-mi-placeholder.svg` — **Placeholder Logo MI**. Saat logo resmi MI sudah tersedia, unggah langsung melalui **Dashboard Admin -> Unit & Logo -> MI Muhammad Tahir -> Ganti Logo Unit**.
- `public/images/hero-students.jpg` & `public/images/campus-building.jpg` — Foto placeholder lingkungan sekolah yang dapat diganti kapan saja melalui Dashboard Admin.
- Data alamat, nomor telepon, sejarah, visi/misi awal menggunakan placeholder yang dapat disunting langsung dari menu **Profil Yayasan** di Dashboard Super Admin.

## Cara Menjalankan di Lokal

1. Salin `.env.example` menjadi `.env.local` dan isi variabel Supabase & Google Sheets.
2. Jalankan migrasi SQL di Supabase SQL Editor secara berurutan:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_and_storage.sql`
   - `supabase/migrations/003_seed_data.sql`
3. Jalankan server pengembangan:
   ```bash
   npm install
   npm run dev
   ```
4. Lihat panduan lengkap konfigurasi admin pertama, Google Sheets, dan deployment Vercel pada [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
