export type UserRoleCode = 'super_admin' | 'admin_unit' | 'panitia_ppdb';

export type UnitSlug = 'ra' | 'mi' | 'smp';
export type UnitCode = 'RA' | 'MI' | 'SMP';

export type AdmissionStatus =
  | 'menunggu_verifikasi'
  | 'sedang_diverifikasi'
  | 'perlu_perbaikan_dokumen'
  | 'diterima'
  | 'tidak_diterima';

export type SyncStatus = 'pending' | 'success' | 'failed';

export interface RequiredDocumentConfig {
  key: string;
  label: string;
  required: boolean;
  description?: string;
}

export interface FoundationSettings {
  id: string;
  foundation_name: string;
  tagline: string;
  short_description: string;
  history: string;
  vision: string;
  mission: string[];
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  website_url?: string | null;
  logo_url: string;
  hero_badge: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;
  about_image_url: string;
  about_video_url?: string | null;
  ppdb_banner_title: string;
  ppdb_banner_subtitle: string;
  footer_quote: string;
  social_youtube?: string | null;
  social_instagram?: string | null;
  social_facebook?: string | null;
  social_tiktok?: string | null;
  maps_embed_url?: string | null;
  is_placeholder_data: boolean;
  created_at: string;
  updated_at: string;
}

export interface EducationUnit {
  id: string;
  slug: UnitSlug;
  unit_code: UnitCode;
  name: string;
  level_label: string;
  short_description: string;
  full_profile: string;
  history: string;
  vision: string;
  mission: string[];
  achievements: string[];
  ppdb_info: string;
  required_documents: RequiredDocumentConfig[];
  logo_url: string;
  is_logo_placeholder: boolean;
  banner_image_url: string;
  accent_color: string;
  headmaster_name?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  address?: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UnitProgram {
  id: string;
  unit_id: string;
  title: string;
  description: string;
  icon_name: string;
  display_order: number;
  is_active: boolean;
}

export interface UnitFacility {
  id: string;
  unit_id: string;
  name: string;
  description: string;
  image_url?: string | null;
  display_order: number;
  is_active: boolean;
}

export interface Teacher {
  id: string;
  unit_id: string;
  full_name: string;
  position: string;
  subject_or_specialty?: string | null;
  education_background?: string | null;
  photo_url?: string | null;
  bio?: string | null;
  display_order: number;
  is_active: boolean;
}

export interface NewsCategory {
  id: string;
  slug: string;
  name: string;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  thumbnail_url: string;
  category_id?: string | null;
  unit_id?: string | null;
  author_id?: string | null;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  category?: NewsCategory | null;
  unit?: Pick<EducationUnit, 'id' | 'slug' | 'name' | 'unit_code'> | null;
}

export interface GalleryItem {
  id: string;
  gallery_id: string;
  media_type: 'photo' | 'video';
  media_url: string;
  caption?: string | null;
  display_order: number;
}

export interface GalleryAlbum {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  cover_image_url: string;
  unit_id?: string | null;
  is_published: boolean;
  event_date?: string | null;
  created_at: string;
  unit?: Pick<EducationUnit, 'id' | 'slug' | 'name' | 'unit_code'> | null;
  items?: GalleryItem[];
}

export interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date?: string | null;
  unit_id?: string | null;
  is_published: boolean;
  unit?: Pick<EducationUnit, 'id' | 'slug' | 'name' | 'unit_code'> | null;
}

export interface AcademicYear {
  id: string;
  name: string;
  start_year: number;
  end_year: number;
  is_active: boolean;
}

export interface AdmissionPeriod {
  id: string;
  academic_year_id: string;
  unit_id: string;
  name: string;
  start_date: string;
  end_date: string;
  quota: number;
  is_open: boolean;
  notes?: string | null;
  academic_year?: AcademicYear;
}

export interface AdmissionDocumentRecord {
  id: string;
  admission_id: string;
  document_key: string;
  document_label: string;
  file_path: string;
  file_name: string;
  mime_type: string;
  file_size_bytes: number;
  is_verified: boolean;
  notes?: string | null;
}

export interface AdmissionStatusLog {
  id: string;
  admission_id: string;
  previous_status?: AdmissionStatus | null;
  new_status: AdmissionStatus;
  notes?: string | null;
  changed_by?: string | null;
  created_at: string;
}

export interface AdmissionRecord {
  id: string;
  registration_number: string;
  user_id?: string | null;
  unit_id: string;
  academic_year_id: string;
  period_id: string;
  status: AdmissionStatus;
  verification_notes?: string | null;
  statement_agreed: boolean;
  verified_by?: string | null;
  verified_at?: string | null;
  submitted_at: string;
  unit?: Pick<EducationUnit, 'id' | 'slug' | 'unit_code' | 'name' | 'logo_url'>;
  academic_year?: Pick<AcademicYear, 'id' | 'name'>;
  period?: Pick<AdmissionPeriod, 'id' | 'name'>;
  applicant?: {
    id: string;
    full_name: string;
    gender: 'L' | 'P';
    birth_place: string;
    birth_date: string;
    address: string;
    previous_school?: string | null;
  };
  guardian?: {
    id: string;
    father_name: string;
    mother_name: string;
    guardian_name?: string | null;
    phone: string;
    email?: string | null;
    parent_address: string;
  };
  documents?: AdmissionDocumentRecord[];
  status_logs?: AdmissionStatusLog[];
  google_sync?: {
    id: string;
    sync_status: SyncStatus;
    target_sheet_tab: string;
    attempt_count: number;
    last_error?: string | null;
    synced_at?: string | null;
  } | null;
}

export interface AuthSessionProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: UserRoleCode;
  role_name: string;
  is_active: boolean;
  unit_access: Array<{
    unit_id: string;
    unit_code: UnitCode;
    unit_slug: UnitSlug;
    unit_name: string;
    can_manage_content: boolean;
    can_verify_ppdb: boolean;
  }>;
}
