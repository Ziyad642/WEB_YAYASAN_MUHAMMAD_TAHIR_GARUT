import {
  DEFAULT_ACADEMIC_YEARS,
  DEFAULT_ADMISSION_PERIODS,
  DEFAULT_EDUCATION_UNITS,
  DEFAULT_EVENTS,
  DEFAULT_FOUNDATION_SETTINGS,
  DEFAULT_GALLERIES,
  DEFAULT_NEWS,
  DEFAULT_NEWS_CATEGORIES,
  DEFAULT_TEACHERS,
  DEFAULT_UNIT_FACILITIES,
  DEFAULT_UNIT_PROGRAMS,
} from '@/lib/data/default-content';
import {
  getStoredEducationUnits,
  getStoredEvents,
  getStoredFoundationSettings,
  getStoredGalleries,
  getStoredNews,
  getStoredTeachers,
} from '@/lib/services/cms-store';
import { createServerSupabaseClient, isSupabaseServerConfigured } from '@/lib/supabase/server';
import type {
  AcademicYear,
  AdmissionPeriod,
  EducationUnit,
  FoundationSettings,
  GalleryAlbum,
  NewsArticle,
  NewsCategory,
  SchoolEvent,
  Teacher,
  UnitFacility,
  UnitProgram,
  UnitSlug,
} from '@/types/database';

export async function getFoundationSettings(): Promise<FoundationSettings> {
  const stored = getStoredFoundationSettings();
  if (!isSupabaseServerConfigured()) return stored;
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('foundation_settings')
      .select('*')
      .limit(1)
      .maybeSingle();
    if (error || !data) return stored;
    return {
      ...stored,
      ...data,
      mission: Array.isArray(data.mission) ? data.mission : stored.mission,
    };
  } catch {
    return stored;
  }
}

export async function getEducationUnits(): Promise<EducationUnit[]> {
  const stored = getStoredEducationUnits();
  if (!isSupabaseServerConfigured()) return stored;
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('education_units')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (error || !data || data.length === 0) return stored;
    return data as EducationUnit[];
  } catch {
    return stored;
  }
}

export async function getUnitDetailBySlug(slug: UnitSlug): Promise<{
  unit: EducationUnit;
  programs: UnitProgram[];
  facilities: UnitFacility[];
  teachers: Teacher[];
  news: NewsArticle[];
  galleries: GalleryAlbum[];
  events: SchoolEvent[];
} | null> {
  const units = await getEducationUnits();
  const unit = units.find((u) => u.slug === slug);
  if (!unit) return null;

  const storedNews = getStoredNews();
  const storedGalleries = getStoredGalleries();
  const storedEvents = getStoredEvents();
  const storedTeachers = getStoredTeachers();

  if (!isSupabaseServerConfigured()) {
    return {
      unit,
      programs: DEFAULT_UNIT_PROGRAMS.filter((p) => p.unit_id === unit.id),
      facilities: DEFAULT_UNIT_FACILITIES.filter((f) => f.unit_id === unit.id),
      teachers: storedTeachers.filter((t) => t.unit_id === unit.id),
      news: storedNews.filter((n) => n.unit_id === unit.id || n.unit_id === null).slice(0, 3),
      galleries: storedGalleries.filter((g) => g.unit_id === unit.id || g.unit_id === null),
      events: storedEvents.filter((e) => e.unit_id === unit.id || e.unit_id === null),
    };
  }

  try {
    const supabase = createServerSupabaseClient();
    const [programsRes, facilitiesRes, teachersRes, newsRes, galleriesRes, eventsRes] =
      await Promise.all([
        supabase
          .from('unit_programs')
          .select('*')
          .eq('unit_id', unit.id)
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('unit_facilities')
          .select('*')
          .eq('unit_id', unit.id)
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('teachers')
          .select('*')
          .eq('unit_id', unit.id)
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('news')
          .select('*, category:news_categories(id, slug, name)')
          .eq('status', 'published')
          .or(`unit_id.eq.${unit.id},unit_id.is.null`)
          .order('published_at', { ascending: false })
          .limit(3),
        supabase
          .from('galleries')
          .select('*, items:gallery_items(*)')
          .eq('is_published', true)
          .or(`unit_id.eq.${unit.id},unit_id.is.null`)
          .order('event_date', { ascending: false })
          .limit(4),
        supabase
          .from('events')
          .select('*')
          .eq('is_published', true)
          .or(`unit_id.eq.${unit.id},unit_id.is.null`)
          .order('start_date', { ascending: true })
          .limit(4),
      ]);

    return {
      unit,
      programs: (programsRes.data as UnitProgram[]) ?? DEFAULT_UNIT_PROGRAMS.filter((p) => p.unit_id === unit.id),
      facilities: (facilitiesRes.data as UnitFacility[]) ?? DEFAULT_UNIT_FACILITIES.filter((f) => f.unit_id === unit.id),
      teachers: (teachersRes.data && teachersRes.data.length > 0) ? (teachersRes.data as Teacher[]) : storedTeachers.filter((t) => t.unit_id === unit.id),
      news: (newsRes.data && newsRes.data.length > 0) ? (newsRes.data as NewsArticle[]) : storedNews.filter((n) => n.unit_id === unit.id || n.unit_id === null).slice(0, 3),
      galleries: (galleriesRes.data && galleriesRes.data.length > 0) ? (galleriesRes.data as GalleryAlbum[]) : storedGalleries.filter((g) => g.unit_id === unit.id || g.unit_id === null),
      events: (eventsRes.data && eventsRes.data.length > 0) ? (eventsRes.data as SchoolEvent[]) : storedEvents.filter((e) => e.unit_id === unit.id || e.unit_id === null),
    };
  } catch {
    return {
      unit,
      programs: DEFAULT_UNIT_PROGRAMS.filter((p) => p.unit_id === unit.id),
      facilities: DEFAULT_UNIT_FACILITIES.filter((f) => f.unit_id === unit.id),
      teachers: storedTeachers.filter((t) => t.unit_id === unit.id),
      news: storedNews.slice(0, 3),
      galleries: storedGalleries,
      events: storedEvents,
    };
  }
}

export async function getPublishedNews(options?: {
  limit?: number;
  unitSlug?: string;
  categorySlug?: string;
  query?: string;
}): Promise<{ articles: NewsArticle[]; categories: NewsCategory[] }> {
  const storedNews = getStoredNews();
  if (!isSupabaseServerConfigured()) {
    let items = [...storedNews];
    if (options?.categorySlug) {
      items = items.filter((n) => n.category?.slug === options.categorySlug);
    }
    if (options?.query) {
      const q = options.query.toLowerCase();
      items = items.filter(
        (n) => n.title.toLowerCase().includes(q) || n.excerpt.toLowerCase().includes(q)
      );
    }
    if (options?.limit) items = items.slice(0, options.limit);
    return { articles: items, categories: DEFAULT_NEWS_CATEGORIES };
  }

  try {
    const supabase = createServerSupabaseClient();
    let req = supabase
      .from('news')
      .select(
        '*, category:news_categories(id, slug, name), unit:education_units(id, slug, name, unit_code)'
      )
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (options?.limit) {
      req = req.limit(options.limit);
    }

    const [newsRes, catRes] = await Promise.all([
      req,
      supabase.from('news_categories').select('*').order('name', { ascending: true }),
    ]);

    let articles = (newsRes.data as NewsArticle[]) ?? storedNews;
    if (options?.unitSlug) {
      articles = articles.filter((a) => a.unit?.slug === options.unitSlug);
    }
    if (options?.categorySlug) {
      articles = articles.filter((a) => a.category?.slug === options.categorySlug);
    }
    if (options?.query) {
      const q = options.query.toLowerCase();
      articles = articles.filter(
        (a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q)
      );
    }

    return {
      articles,
      categories: (catRes.data as NewsCategory[]) ?? DEFAULT_NEWS_CATEGORIES,
    };
  } catch {
    return { articles: storedNews, categories: DEFAULT_NEWS_CATEGORIES };
  }
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  const storedNews = getStoredNews();
  if (!isSupabaseServerConfigured()) {
    return storedNews.find((n) => n.slug === slug) ?? null;
  }
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('news')
      .select(
        '*, category:news_categories(id, slug, name), unit:education_units(id, slug, name, unit_code)'
      )
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    if (error || !data) return storedNews.find((n) => n.slug === slug) ?? null;
    return data as NewsArticle;
  } catch {
    return storedNews.find((n) => n.slug === slug) ?? null;
  }
}

export async function getPublishedGalleries(): Promise<GalleryAlbum[]> {
  const storedGalleries = getStoredGalleries();
  if (!isSupabaseServerConfigured()) return storedGalleries;
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('galleries')
      .select('*, unit:education_units(id, slug, name, unit_code), items:gallery_items(*)')
      .eq('is_published', true)
      .order('event_date', { ascending: false });
    if (error || !data || data.length === 0) return storedGalleries;
    return data as GalleryAlbum[];
  } catch {
    return storedGalleries;
  }
}

export async function getPublishedEvents(): Promise<SchoolEvent[]> {
  const storedEvents = getStoredEvents();
  if (!isSupabaseServerConfigured()) return storedEvents;
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('events')
      .select('*, unit:education_units(id, slug, name, unit_code)')
      .eq('is_published', true)
      .order('start_date', { ascending: true });
    if (error || !data || data.length === 0) return storedEvents;
    return data as SchoolEvent[];
  } catch {
    return storedEvents;
  }
}

export async function getPpdbOptions(): Promise<{
  units: EducationUnit[];
  academicYears: AcademicYear[];
  periods: AdmissionPeriod[];
}> {
  const units = await getEducationUnits();
  if (!isSupabaseServerConfigured()) {
    return {
      units,
      academicYears: DEFAULT_ACADEMIC_YEARS,
      periods: DEFAULT_ADMISSION_PERIODS,
    };
  }
  try {
    const supabase = createServerSupabaseClient();
    const [yearsRes, periodsRes] = await Promise.all([
      supabase.from('academic_years').select('*').order('start_year', { ascending: false }),
      supabase
        .from('admission_periods')
        .select('*, academic_year:academic_years(*)')
        .eq('is_open', true)
        .order('start_date', { ascending: true }),
    ]);

    return {
      units,
      academicYears:
        yearsRes.data && yearsRes.data.length > 0
          ? (yearsRes.data as AcademicYear[])
          : DEFAULT_ACADEMIC_YEARS,
      periods:
        periodsRes.data && periodsRes.data.length > 0
          ? (periodsRes.data as AdmissionPeriod[])
          : DEFAULT_ADMISSION_PERIODS,
    };
  } catch {
    return {
      units,
      academicYears: DEFAULT_ACADEMIC_YEARS,
      periods: DEFAULT_ADMISSION_PERIODS,
    };
  }
}
