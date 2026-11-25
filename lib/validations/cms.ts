import { z } from 'zod';

export const foundationSettingsUpdateSchema = z.object({
  foundation_name: z.string().trim().min(3).max(150),
  tagline: z.string().trim().min(3).max(160),
  short_description: z.string().trim().min(10).max(1000),
  history: z.string().trim().min(10).max(8000),
  vision: z.string().trim().min(10).max(2000),
  mission: z.array(z.string().trim().min(3)).min(1),
  address: z.string().trim().min(5).max(300),
  phone: z.string().trim().min(5).max(50),
  whatsapp: z.string().trim().max(30).optional().default(''),
  email: z.string().trim().email(),
  logo_url: z.string().trim().min(1),
  hero_badge: z.string().trim().min(2).max(80),
  hero_title: z.string().trim().min(5).max(180),
  hero_subtitle: z.string().trim().min(10).max(600),
  hero_image_url: z.string().trim().min(1),
  about_image_url: z.string().trim().min(1),
  about_video_url: z.string().trim().max(400).optional().default(''),
  ppdb_banner_title: z.string().trim().min(5).max(180),
  ppdb_banner_subtitle: z.string().trim().min(5).max(400),
  footer_quote: z.string().trim().max(250).optional().default(''),
  social_youtube: z.string().trim().max(300).optional().default(''),
  social_instagram: z.string().trim().max(300).optional().default(''),
  social_facebook: z.string().trim().max(300).optional().default(''),
  social_tiktok: z.string().trim().max(300).optional().default(''),
  maps_embed_url: z.string().trim().max(800).optional().default(''),
  is_placeholder_data: z.boolean().optional().default(false),
});

export const educationUnitUpdateSchema = z.object({
  name: z.string().trim().min(3).max(120),
  level_label: z.string().trim().min(3).max(120),
  short_description: z.string().trim().min(10).max(500),
  full_profile: z.string().trim().min(10).max(8000),
  history: z.string().trim().min(5).max(8000),
  vision: z.string().trim().min(5).max(2000),
  mission: z.array(z.string().trim().min(3)).min(1),
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
    .min(1),
  logo_url: z.string().trim().min(1),
  is_logo_placeholder: z.boolean().optional().default(false),
  banner_image_url: z.string().trim().min(1),
  accent_color: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/),
  headmaster_name: z.string().trim().max(120).optional().default(''),
  contact_phone: z.string().trim().max(50).optional().default(''),
  contact_email: z.string().trim().max(120).optional().default(''),
  address: z.string().trim().max(300).optional().default(''),
});

export const newsSchema = z.object({
  title: z.string().trim().min(5).max(200),
  slug: z.string().trim().min(3).max(200).optional(),
  excerpt: z.string().trim().min(10).max(500),
  content: z.string().trim().min(20),
  thumbnail_url: z.string().trim().min(1),
  category_id: z.string().min(1).nullable().optional(),
  unit_id: z.string().min(1).nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  is_featured: z.boolean().optional().default(false),
});

export const eventSchema = z.object({
  title: z.string().trim().min(4).max(200),
  description: z.string().trim().min(5).max(2000),
  location: z.string().trim().min(2).max(200),
  start_date: z.string().min(8),
  end_date: z.string().nullable().optional(),
  unit_id: z.string().min(1).nullable().optional(),
  is_published: z.boolean().optional().default(true),
});

export const gallerySchema = z.object({
  title: z.string().trim().min(4).max(200),
  description: z.string().trim().max(1000).optional().default(''),
  cover_image_url: z.string().trim().min(1),
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
  unit_id: z.string().min(1),
  full_name: z.string().trim().min(3).max(120),
  position: z.string().trim().min(2).max(120),
  subject_or_specialty: z.string().trim().max(120).optional().default(''),
  education_background: z.string().trim().max(120).optional().default(''),
  photo_url: z.string().trim().max(500).optional().default(''),
  bio: z.string().trim().max(1000).optional().default(''),
  is_active: z.boolean().optional().default(true),
});
