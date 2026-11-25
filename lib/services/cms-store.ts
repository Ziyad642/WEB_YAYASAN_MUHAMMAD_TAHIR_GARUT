import fs from 'node:fs';
import path from 'node:path';
import {
  DEFAULT_EDUCATION_UNITS,
  DEFAULT_EVENTS,
  DEFAULT_FOUNDATION_SETTINGS,
  DEFAULT_GALLERIES,
  DEFAULT_NEWS,
  DEFAULT_TEACHERS,
} from '@/lib/data/default-content';
import type {
  EducationUnit,
  FoundationSettings,
  GalleryAlbum,
  NewsArticle,
  SchoolEvent,
  Teacher,
} from '@/types/database';

const DATA_DIR = path.join(process.cwd(), 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'foundation-settings.json');
const UNITS_FILE = path.join(DATA_DIR, 'units.json');
const NEWS_FILE = path.join(DATA_DIR, 'news.json');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const GALLERIES_FILE = path.join(DATA_DIR, 'galleries.json');
const TEACHERS_FILE = path.join(DATA_DIR, 'teachers.json');

function ensureDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// ============================================================================
// 1. FOUNDATION SETTINGS PERSISTENCE
// ============================================================================
export function getStoredFoundationSettings(): FoundationSettings {
  try {
    ensureDir();
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.writeFileSync(
        SETTINGS_FILE,
        JSON.stringify(DEFAULT_FOUNDATION_SETTINGS, null, 2),
        'utf8'
      );
      return DEFAULT_FOUNDATION_SETTINGS;
    }
    const content = fs.readFileSync(SETTINGS_FILE, 'utf8');
    const parsed = JSON.parse(content);
    return {
      ...DEFAULT_FOUNDATION_SETTINGS,
      ...parsed,
      mission: Array.isArray(parsed.mission)
        ? parsed.mission
        : DEFAULT_FOUNDATION_SETTINGS.mission,
    };
  } catch (err) {
    console.error('Error reading foundation settings:', err);
    return DEFAULT_FOUNDATION_SETTINGS;
  }
}

export function updateStoredFoundationSettings(
  patch: Partial<FoundationSettings>
): FoundationSettings {
  ensureDir();
  const current = getStoredFoundationSettings();
  const updated: FoundationSettings = {
    ...current,
    ...patch,
    updated_at: new Date().toISOString(),
  };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf8');
  return updated;
}

// ============================================================================
// 2. EDUCATION UNITS PERSISTENCE
// ============================================================================
export function getStoredEducationUnits(): EducationUnit[] {
  try {
    ensureDir();
    if (!fs.existsSync(UNITS_FILE)) {
      fs.writeFileSync(UNITS_FILE, JSON.stringify(DEFAULT_EDUCATION_UNITS, null, 2), 'utf8');
      return DEFAULT_EDUCATION_UNITS;
    }
    const content = fs.readFileSync(UNITS_FILE, 'utf8');
    return JSON.parse(content) as EducationUnit[];
  } catch {
    return DEFAULT_EDUCATION_UNITS;
  }
}

export function updateStoredEducationUnit(
  unitId: string,
  patch: Partial<EducationUnit>
): EducationUnit | null {
  ensureDir();
  const units = getStoredEducationUnits();
  const index = units.findIndex((u) => u.id === unitId);
  if (index === -1) return null;

  units[index] = {
    ...units[index],
    ...patch,
    updated_at: new Date().toISOString(),
  };
  fs.writeFileSync(UNITS_FILE, JSON.stringify(units, null, 2), 'utf8');
  return units[index];
}

// ============================================================================
// 3. NEWS PERSISTENCE
// ============================================================================
export function getStoredNews(): NewsArticle[] {
  try {
    ensureDir();
    if (!fs.existsSync(NEWS_FILE)) {
      fs.writeFileSync(NEWS_FILE, JSON.stringify(DEFAULT_NEWS, null, 2), 'utf8');
      return DEFAULT_NEWS;
    }
    const content = fs.readFileSync(NEWS_FILE, 'utf8');
    return JSON.parse(content) as NewsArticle[];
  } catch {
    return DEFAULT_NEWS;
  }
}

export function saveStoredNews(news: NewsArticle[]): void {
  ensureDir();
  fs.writeFileSync(NEWS_FILE, JSON.stringify(news, null, 2), 'utf8');
}

// ============================================================================
// 4. EVENTS PERSISTENCE
// ============================================================================
export function getStoredEvents(): SchoolEvent[] {
  try {
    ensureDir();
    if (!fs.existsSync(EVENTS_FILE)) {
      fs.writeFileSync(EVENTS_FILE, JSON.stringify(DEFAULT_EVENTS, null, 2), 'utf8');
      return DEFAULT_EVENTS;
    }
    const content = fs.readFileSync(EVENTS_FILE, 'utf8');
    return JSON.parse(content) as SchoolEvent[];
  } catch {
    return DEFAULT_EVENTS;
  }
}

export function saveStoredEvents(events: SchoolEvent[]): void {
  ensureDir();
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), 'utf8');
}

// ============================================================================
// 5. GALLERIES PERSISTENCE
// ============================================================================
export function getStoredGalleries(): GalleryAlbum[] {
  try {
    ensureDir();
    if (!fs.existsSync(GALLERIES_FILE)) {
      fs.writeFileSync(GALLERIES_FILE, JSON.stringify(DEFAULT_GALLERIES, null, 2), 'utf8');
      return DEFAULT_GALLERIES;
    }
    const content = fs.readFileSync(GALLERIES_FILE, 'utf8');
    return JSON.parse(content) as GalleryAlbum[];
  } catch {
    return DEFAULT_GALLERIES;
  }
}

export function saveStoredGalleries(galleries: GalleryAlbum[]): void {
  ensureDir();
  fs.writeFileSync(GALLERIES_FILE, JSON.stringify(galleries, null, 2), 'utf8');
}

// ============================================================================
// 6. TEACHERS PERSISTENCE
// ============================================================================
export function getStoredTeachers(): Teacher[] {
  try {
    ensureDir();
    if (!fs.existsSync(TEACHERS_FILE)) {
      fs.writeFileSync(TEACHERS_FILE, JSON.stringify(DEFAULT_TEACHERS, null, 2), 'utf8');
      return DEFAULT_TEACHERS;
    }
    const content = fs.readFileSync(TEACHERS_FILE, 'utf8');
    return JSON.parse(content) as Teacher[];
  } catch {
    return DEFAULT_TEACHERS;
  }
}

export function saveStoredTeachers(teachers: Teacher[]): void {
  ensureDir();
  fs.writeFileSync(TEACHERS_FILE, JSON.stringify(teachers, null, 2), 'utf8');
}
