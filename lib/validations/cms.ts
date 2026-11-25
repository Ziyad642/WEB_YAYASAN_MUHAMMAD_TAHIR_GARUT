import { z } from 'zod';

export const foundationSettingsUpdateSchema = z.object({
  foundation_name: z.string().trim().min(3, 'Nama yayasan minimal 3 karakter').max(150),
  tagline: z.string().trim().min(2, 'Tagline minimal 2 karakter').max(160),
  short_description: z.string().trim().min(3, 'Deskripsi singkat minimal 3 karakter').max(1000),
  history: z.string().trim().min(3, 'Sejarah minimal 3 karakter').max(8000),
  vision: z.string().trim().min(3, 'Visi minimal 3 karakter').max(2000),
  mission: z.array(z.string().trim().min(2)).min(1, 'Misi yayasan minimal 1 butir'),
  address: z.string().trim().min(3, 'Alamat minimal 3 karakter').max(300),
  phone: z.string().trim().min(5, 'Nomor telepon minimal 5 digit').max(50),
  whatsapp: z.string().trim().max(30).optional().default(''),
  email: z.string().trim().email('Format email tidak valid'),
  logo_url: z.string().trim().min(1, 'Logo URL wajib diisi'),
  hero_badge: z.string().trim().min(2).max(80),
  hero_title: z.string().trim().min(3).max(180),
  hero_subtitle: z.string().trim().min(3).max(600),
  hero_image_url: z.string().trim().min(1),
  about_image_url: z.string().trim().min(1),
  about_video_url: z.string().trim().max(400).optional().default(''),
  ppdb_banner_title: z.string().trim().min(3).max(180),
  ppdb_banner_subtitle: z.string().trim().min(3).max(400),
  footer_quote: z.string().trim().max(250).optional().default(''),
  social_youtube: z.string().trim().max(300).optional().default(''),
  social_instagram: z.string().trim().max(300).optional().default(''),
  social_facebook: z.string().trim().max(300).optional().default(''),
  social_tiktok: z.string().trim().max(300).optional().default(''),
  maps_embed_url: z.string().trim().max(800).optional().default(''),
  is_placeholder_data: z.boolean().optional().default(false),
});

export const educationUnitUpdateSchema = z.object({
  name: z.string().trim().min(3, 'Nama unit minimal 3 karakter').max(120),
  level_label: z.string().trim().min(2, 'Jenjang unit minimal 2 karakter').max(120),
  short_description: z.string().trim().min(3, 'Deskripsi singkat minimal 3 karakter').max(500),
  full_profile: z.string().trim().min(3, 'Profil lengkap minimal 3 karakter').max(8000),
  history: z.string().trim().min(3, 'Sejarah unit minimal 3 karakter').max(8000),
  vision: z.string().trim().min(3, 'Visi unit minimal 3 karakter').max(2000),
  mission: z.array(z.string().trim().min(2)).min(1, 'Misi unit minimal 1 butir'),
  achievements: z.array(z.string().trim().min(2)).optional().default([]),
  ppdb_info: z.string().trim().max(2000).optional().default(''),
  required_documents: z
    .array(
      z.object({
        key: z.string().trim().min(1).max(40),
        label: z.string().trim().min(2).max(120),
        required: z.boolean(),
        description: z.string().trim().max(300).optional(),
      })
    )
    .min(1, 'Persyaratan dokumen PPDB minimal 1 butir'),
  logo_url: z.string().trim().min(1, 'Logo unit wajib ditentukan'),
  is_logo_placeholder: z.boolean().optional().default(false),
  banner_image_url: z.string().trim().min(1, 'Banner unit wajib ditentukan'),
  accent_color: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/, 'Format warna aksen harus hex seperti #1E3A8A'),
  headmaster_name: z.string().trim().max(120).optional().default(''),
  contact_phone: z.string().trim().max(50).optional().default(''),
  contact_email: z.string().trim().max(120).optional().default(''),
  address: z.string().trim().max(300).optional().default(''),
});

export const newsSchema = z.object({
  title: z.string().trim().min(3, 'Judul berita minimal 3 karakter').max(200, 'Judul berita maksimal 200 karakter'),
  slug: z.string().trim().min(2).max(200).optional(),
  excerpt: z.string().trim().min(3, 'Ringkasan singkat minimal 3 karakter').max(500, 'Ringkasan maksimal 500 karakter'),
  content: z.string().trim().min(3, 'Isi lengkap berita minimal 3 karakter'),
  thumbnail_url: z.string().trim().min(1, 'Thumbnail berita wajib diisi'),
  category_id: z.string().min(1).nullable().optional(),
  unit_id: z.string().min(1).nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  is_featured: z.boolean().optional().default(false),
});

export const eventSchema = z.object({
  title: z.string().trim().min(3, 'Judul agenda minimal 3 karakter').max(200),
  description: z.string().trim().min(3, 'Deskripsi minimal 3 karakter').max(2000),
  location: z.string().trim().min(2, 'Lokasi minimal 2 karakter').max(200),
  start_date: z.string().min(8, 'Format tanggal tidak valid'),
  end_date: z.string().nullable().optional(),
  unit_id: z.string().min(1).nullable().optional(),
  is_published: z.boolean().optional().default(true),
});

export const gallerySchema = z.object({
  title: z.string().trim().min(3, 'Judul galeri minimal 3 karakter').max(200),
  description: z.string().trim().max(1000).optional().default(''),
  cover_image_url: z.string().trim().min(1, 'Foto sampul galeri wajib diisi'),
  unit_id: z.string().min(1).nullable().optional(),
  event_date: z.string().optional(),
  is_published: z.boolean().optional().default(true),
  items: z
    .array(
      z.object({
        media_type: z.enum(['photo', 'video']).default('photo'),
        media_url: z.string().trim().min(1),
        caption: z.string().trim().max(300).optional().default(''),
      })
    )
    .optional()
    .default([]),
});

export const teacherSchema = z.object({
  unit_id: z.string().min(1, 'Unit pendidikan wajib dipilih'),
  full_name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(120),
  position: z.string().trim().min(2, 'Jabatan minimal 2 karakter').max(120),
  subject_or_specialty: z.string().trim().max(120).optional().default(''),
  education_background: z.string().trim().max(120).optional().default(''),
  photo_url: z.string().trim().max(500).optional().default(''),
  bio: z.string().trim().max(1000).optional().default(''),
  is_active: z.boolean().optional().default(true),
});
