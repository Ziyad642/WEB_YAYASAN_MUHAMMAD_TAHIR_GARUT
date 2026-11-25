import {
  DEFAULT_ADMISSION_PERIODS,
  DEFAULT_EDUCATION_UNITS,
  DEFAULT_EVENTS,
  DEFAULT_FOUNDATION_SETTINGS,
  DEFAULT_GALLERIES,
  DEFAULT_NEWS,
  DEFAULT_TEACHERS,
} from '@/lib/data/default-content';
import { readDataJson, writeDataJson } from '@/lib/storage/data-storage';
import type {
  AdmissionPeriod,
  EducationUnit,
  FoundationSettings,
  GalleryAlbum,
  NewsArticle,
  SchoolEvent,
  Teacher,
} from '@/types/database';

const SETTINGS_FILE = 'foundation-settings.json';
const UNITS_FILE = 'units.json';
const NEWS_FILE = 'news.json';
const EVENTS_FILE = 'events.json';
const GALLERIES_FILE = 'galleries.json';
const TEACHERS_FILE = 'teachers.json';
const PERIODS_FILE = 'admission-periods.json';

// ============================================================================
// 1. FOUNDATION SETTINGS PERSISTENCE
// ============================================================================
export function getStoredFoundationSettings(): FoundationSettings {
  const data = readDataJson<FoundationSettings>(SETTINGS_FILE, DEFAULT_FOUNDATION_SETTINGS);
  return {
    ...DEFAULT_FOUNDATION_SETTINGS,
    ...data,
    mission: Array.isArray(data.mission) ? data.mission : DEFAULT_FOUNDATION_SETTINGS.mission,
  };
}

export function updateStoredFoundationSettings(
  patch: Partial<FoundationSettings>
): FoundationSettings {
  const current = getStoredFoundationSettings();
  const updated: FoundationSettings = {
    ...current,
    ...patch,
    updated_at: new Date().toISOString(),
  };
  writeDataJson(SETTINGS_FILE, updated);
  return updated;
}

// ============================================================================
// 2. EDUCATION UNITS PERSISTENCE
// ============================================================================
export function getStoredEducationUnits(): EducationUnit[] {
  return readDataJson<EducationUnit[]>(UNITS_FILE, DEFAULT_EDUCATION_UNITS);
}

export function updateStoredEducationUnit(
  unitId: string,
  patch: Partial<EducationUnit>
): EducationUnit | null {
  const units = getStoredEducationUnits();
  // Cocokkan berdasarkan ID, slug, atau unit_code untuk fleksibilitas maksimal
  const index = units.findIndex(
    (u) => u.id === unitId || u.slug === unitId || u.unit_code.toLowerCase() === unitId.toLowerCase()
  );
  if (index === -1) return null;

  units[index] = {
    ...units[index],
    ...patch,
    updated_at: new Date().toISOString(),
  };
  writeDataJson(UNITS_FILE, units);
  return units[index];
}

// ============================================================================
// 3. NEWS PERSISTENCE
// ============================================================================
export function getStoredNews(): NewsArticle[] {
  return readDataJson<NewsArticle[]>(NEWS_FILE, DEFAULT_NEWS);
}

export function saveStoredNews(news: NewsArticle[]): void {
  writeDataJson(NEWS_FILE, news);
}

// ============================================================================
// 4. EVENTS PERSISTENCE
// ============================================================================
export function getStoredEvents(): SchoolEvent[] {
  return readDataJson<SchoolEvent[]>(EVENTS_FILE, DEFAULT_EVENTS);
}

export function saveStoredEvents(events: SchoolEvent[]): void {
  writeDataJson(EVENTS_FILE, events);
}

// ============================================================================
// 5. GALLERIES PERSISTENCE
// ============================================================================
export function getStoredGalleries(): GalleryAlbum[] {
  return readDataJson<GalleryAlbum[]>(GALLERIES_FILE, DEFAULT_GALLERIES);
}

export function saveStoredGalleries(galleries: GalleryAlbum[]): void {
  writeDataJson(GALLERIES_FILE, galleries);
}

// ============================================================================
// 6. TEACHERS PERSISTENCE
// ============================================================================
export function getStoredTeachers(): Teacher[] {
  return readDataJson<Teacher[]>(TEACHERS_FILE, DEFAULT_TEACHERS);
}

export function saveStoredTeachers(teachers: Teacher[]): void {
  writeDataJson(TEACHERS_FILE, teachers);
}

// ============================================================================
// 7. ADMISSION PERIODS (GELOMBANG PPDB) PERSISTENCE
// ============================================================================
export function getStoredAdmissionPeriods(): AdmissionPeriod[] {
  return readDataJson<AdmissionPeriod[]>(PERIODS_FILE, DEFAULT_ADMISSION_PERIODS);
}

export function updateStoredAdmissionPeriod(
  periodId: string,
  patch: Partial<AdmissionPeriod>
): AdmissionPeriod | null {
  const periods = getStoredAdmissionPeriods();
  const index = periods.findIndex((p) => p.id === periodId);
  if (index === -1) return null;

  periods[index] = {
    ...periods[index],
    ...patch,
  };
  writeDataJson(PERIODS_FILE, periods);
  return periods[index];
}

export function saveStoredAdmissionPeriods(periods: AdmissionPeriod[]): void {
  writeDataJson(PERIODS_FILE, periods);
}
