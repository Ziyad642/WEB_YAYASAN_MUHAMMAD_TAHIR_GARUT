import fs from 'fs';
import os from 'os';
import path from 'path';

let cachedStorageDir: string | null = null;

/**
 * Mendapatkan direktori penyimpanan yang aman dan writable.
 * Di lingkungan serverless Vercel / AWS Lambda, root direktori adalah read-only (/var/task).
 * Oleh karena itu, direktori dialihkan ke os.tmpdir() (/tmp/yayasan_data).
 * Di lokal (development), menggunakan direktori project /data jika writable.
 */
export function getStorageDirectory(): string {
  if (cachedStorageDir) return cachedStorageDir;

  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NODE_ENV === 'production' ||
    process.cwd().startsWith('/var/task')
  );

  const tmpDataDir = path.join(os.tmpdir(), 'yayasan_data');

  if (isServerless) {
    if (!fs.existsSync(tmpDataDir)) {
      try {
        fs.mkdirSync(tmpDataDir, { recursive: true });
      } catch (err) {
        console.warn('[Storage] Gagal membuat direktori tmp, fallback:', err);
      }
    }
    cachedStorageDir = tmpDataDir;
    return cachedStorageDir;
  }

  const localProjectDataDir = path.join(process.cwd(), 'data');

  // Cek apakah direktori lokal writable
  try {
    if (!fs.existsSync(localProjectDataDir)) {
      fs.mkdirSync(localProjectDataDir, { recursive: true });
    }
    const testFile = path.join(localProjectDataDir, '.test_write');
    fs.writeFileSync(testFile, 'ok', 'utf8');
    fs.unlinkSync(testFile);
    cachedStorageDir = localProjectDataDir;
    return cachedStorageDir;
  } catch {
    // Jika lokal ternyata read-only, fallback ke tmp
    if (!fs.existsSync(tmpDataDir)) {
      try {
        fs.mkdirSync(tmpDataDir, { recursive: true });
      } catch (err) {
        console.warn('[Storage] Gagal membuat direktori tmp, fallback:', err);
      }
    }
    cachedStorageDir = tmpDataDir;
    return cachedStorageDir;
  }
}

/**
 * Mendapatkan path file penyimpanan.
 * Jika file belum ada di direktori tujuan (misal /tmp), maka otomatis disalin dari project seed /data.
 */
export function resolveDataFilePath(fileName: string): string {
  const targetDir = getStorageDirectory();
  const targetFilePath = path.join(targetDir, fileName);
  const seedFilePath = path.join(process.cwd(), 'data', fileName);

  if (targetDir !== path.join(process.cwd(), 'data')) {
    if (!fs.existsSync(targetFilePath)) {
      try {
        if (fs.existsSync(seedFilePath)) {
          const seedContent = fs.readFileSync(seedFilePath, 'utf8');
          fs.writeFileSync(targetFilePath, seedContent, 'utf8');
        }
      } catch (err) {
        console.warn(`[Storage] Gagal menyalin seed data ${fileName} ke tmp:`, err);
      }
    }
  }

  return targetFilePath;
}

/**
 * Membaca file data JSON secara aman dengan fallback.
 */
export function readDataJson<T>(fileName: string, fallback: T): T {
  try {
    // 1. Cek direktori tmp terlebih dahulu jika data sudah diperbarui
    const tmpFilePath = path.join(os.tmpdir(), 'yayasan_data', fileName);
    if (fs.existsSync(tmpFilePath)) {
      const content = fs.readFileSync(tmpFilePath, 'utf8');
      return JSON.parse(content) as T;
    }

    // 2. Cek resolved target file
    const filePath = resolveDataFilePath(fileName);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content) as T;
    }

    // 3. Fallback ke seed di project /data
    const seedFilePath = path.join(process.cwd(), 'data', fileName);
    if (fs.existsSync(seedFilePath)) {
      const seedContent = fs.readFileSync(seedFilePath, 'utf8');
      return JSON.parse(seedContent) as T;
    }

    return fallback;
  } catch (err) {
    console.warn(`[Storage] Gagal membaca data JSON ${fileName}:`, err);
    return fallback;
  }
}

/**
 * Menulis data JSON secara aman tanpa EROFS error.
 */
export function writeDataJson<T>(fileName: string, data: T): boolean {
  try {
    const filePath = resolveDataFilePath(fileName);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    try {
      // Emergency fallback directly to /tmp
      const fallbackPath = path.join(os.tmpdir(), 'yayasan_data', fileName);
      const dir = path.dirname(fallbackPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(fallbackPath, JSON.stringify(data, null, 2), 'utf8');
      cachedStorageDir = path.join(os.tmpdir(), 'yayasan_data');
      return true;
    } catch (innerErr) {
      console.error(`[Storage] Gagal menulis data JSON ${fileName}:`, innerErr);
      return false;
    }
  }
}
