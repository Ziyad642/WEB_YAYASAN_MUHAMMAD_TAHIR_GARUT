import crypto from 'node:crypto';
import type { AdmissionRecord, UnitCode } from '@/types/database';

const SHEETS_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

export const UNIT_TAB_MAP: Record<UnitCode, string> = {
  RA: 'Pendaftar R.A.',
  MI: 'Pendaftar MI',
  SMP: 'Pendaftar SMP',
};

export const MASTER_TAB_NAME = 'Semua Pendaftar';
export const REPORT_TAB_NAME = 'Laporan PPDB';

const ROW_HEADERS = [
  'Nomor Pendaftaran',
  'Tanggal Daftar',
  'Unit Pendidikan',
  'Tahun Ajaran',
  'Gelombang',
  'Nama Lengkap Calon Siswa',
  'Jenis Kelamin',
  'Tempat Lahir',
  'Tanggal Lahir',
  'Alamat Siswa',
  'Asal Sekolah',
  'Nama Ayah',
  'Nama Ibu',
  'Nama Wali',
  'No. Telepon/WA',
  'Alamat Orang Tua',
  'Status Verifikasi',
  'Catatan Panitia',
  'Timestamp Sinkronisasi',
];

export function isGoogleSheetsConfigured(): boolean {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  return Boolean(
    spreadsheetId &&
      email &&
      privateKey &&
      !privateKey.includes('...')
  );
}

export function isAppsScriptConfigured(): boolean {
  return Boolean(process.env.GOOGLE_APPS_SCRIPT_WEBHOOK_URL);
}

function base64UrlEncode(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function getGoogleAccessToken(): Promise<string> {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, '\n');

  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claimSet = base64UrlEncode(
    JSON.stringify({
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: SHEETS_TOKEN_URL,
      exp: now + 3600,
      iat: now,
    })
  );

  const unsignedJwt = `${header}.${claimSet}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedJwt);
  const signature = base64UrlEncode(signer.sign(rawKey));
  const assertion = `${unsignedJwt}.${signature}`;

  const tokenRes = await fetch(SHEETS_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(`Gagal memperoleh Google OAuth token: ${errText}`);
  }

  const tokenJson = (await tokenRes.json()) as { access_token: string };
  return tokenJson.access_token;
}

async function ensureSheetHeaders(spreadsheetId: string, tabName: string, token: string) {
  const range = encodeURIComponent(`'${tabName}'!A1:S1`);
  const checkRes = await fetch(`${SHEETS_API_BASE}/${spreadsheetId}/values/${range}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!checkRes.ok) {
    throw new Error(`Tab "${tabName}" tidak ditemukan atau tidak dapat diakses di Google Sheets.`);
  }

  const data = (await checkRes.json()) as { values?: string[][] };
  if (!data.values || data.values.length === 0 || data.values[0].length === 0) {
    await fetch(
      `${SHEETS_API_BASE}/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [ROW_HEADERS] }),
      }
    );
  }
}

async function upsertRowByRegistrationNumber(
  spreadsheetId: string,
  tabName: string,
  registrationNumber: string,
  rowValues: string[],
  token: string
) {
  await ensureSheetHeaders(spreadsheetId, tabName, token);

  const colARange = encodeURIComponent(`'${tabName}'!A:A`);
  const colRes = await fetch(`${SHEETS_API_BASE}/${spreadsheetId}/values/${colARange}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const colData = (await colRes.json()) as { values?: string[][] };
  const rows = colData.values ?? [];
  const existingRowIndex = rows.findIndex((r) => r[0] === registrationNumber);

  if (existingRowIndex >= 1) {
    // Update baris yang sudah ada untuk mencegah data duplikat
    const rowNumber = existingRowIndex + 1;
    const updateRange = encodeURIComponent(`'${tabName}'!A${rowNumber}:S${rowNumber}`);
    const updateRes = await fetch(
      `${SHEETS_API_BASE}/${spreadsheetId}/values/${updateRange}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [rowValues] }),
      }
    );
    if (!updateRes.ok) {
      throw new Error(`Gagal memperbarui baris pada tab ${tabName}: ${await updateRes.text()}`);
    }
    return;
  }

  const appendRange = encodeURIComponent(`'${tabName}'!A:S`);
  const appendRes = await fetch(
    `${SHEETS_API_BASE}/${spreadsheetId}/values/${appendRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [rowValues] }),
    }
  );
  if (!appendRes.ok) {
    throw new Error(`Gagal menambahkan baris ke tab ${tabName}: ${await appendRes.text()}`);
  }
}

export function buildAdmissionSheetRow(admission: AdmissionRecord, syncTimestamp: string): string[] {
  return [
    admission.registration_number,
    admission.submitted_at,
    admission.unit?.name ?? '-',
    admission.academic_year?.name ?? '-',
    admission.period?.name ?? '-',
    admission.applicant?.full_name ?? '-',
    admission.applicant?.gender === 'L' ? 'Laki-laki' : 'Perempuan',
    admission.applicant?.birth_place ?? '-',
    admission.applicant?.birth_date ?? '-',
    admission.applicant?.address ?? '-',
    admission.applicant?.previous_school ?? '-',
    admission.guardian?.father_name ?? '-',
    admission.guardian?.mother_name ?? '-',
    admission.guardian?.guardian_name ?? '-',
    admission.guardian?.phone ?? '-',
    admission.guardian?.parent_address ?? '-',
    admission.status,
    admission.verification_notes ?? '',
    syncTimestamp,
  ];
}

export async function syncAdmissionToGoogleSheets(
  admission: AdmissionRecord,
  summaryCounts?: { total: number; ra: number; mi: number; smp: number; accepted: number }
): Promise<{ ok: boolean; targetTab: string; syncedAt: string; error?: string }> {
  const unitCode = (admission.unit?.unit_code ?? 'RA') as UnitCode;
  const unitTab = UNIT_TAB_MAP[unitCode] ?? 'Pendaftar R.A.';
  const syncedAt = new Date().toISOString();
  const rowValues = buildAdmissionSheetRow(admission, syncedAt);

  if (isGoogleSheetsConfigured()) {
    try {
      const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
      const token = await getGoogleAccessToken();

      // 1. Sinkron ke tab Semua Pendaftar (deduplikasi berdasarkan nomor pendaftaran)
      await upsertRowByRegistrationNumber(
        spreadsheetId,
        MASTER_TAB_NAME,
        admission.registration_number,
        rowValues,
        token
      );

      // 2. Sinkron ke tab per unit (Pendaftar R.A. / Pendaftar MI / Pendaftar SMP)
      await upsertRowByRegistrationNumber(
        spreadsheetId,
        unitTab,
        admission.registration_number,
        rowValues,
        token
      );

      // 3. Perbarui ringkasan tab Laporan PPDB jika data ringkasan tersedia
      if (summaryCounts) {
        const reportRange = encodeURIComponent(`'${REPORT_TAB_NAME}'!A1:B7`);
        await fetch(
          `${SHEETS_API_BASE}/${spreadsheetId}/values/${reportRange}?valueInputOption=USER_ENTERED`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              values: [
                ['Indikator Laporan PPDB Yayasan Muhammad Tahir Garut', 'Jumlah'],
                ['Total Semua Pendaftar', String(summaryCounts.total)],
                ['Pendaftar R.A.', String(summaryCounts.ra)],
                ['Pendaftar MI', String(summaryCounts.mi)],
                ['Pendaftar SMP', String(summaryCounts.smp)],
                ['Status Diterima', String(summaryCounts.accepted)],
                ['Terakhir Disinkronkan', syncedAt],
              ],
            }),
          }
        );
      }

      return { ok: true, targetTab: unitTab, syncedAt };
    } catch (error) {
      return {
        ok: false,
        targetTab: unitTab,
        syncedAt,
        error: error instanceof Error ? error.message : 'Error tidak diketahui saat sinkron Google Sheets API.',
      };
    }
  }

  // Alternatif Webhook Google Apps Script jika dipakai
  if (isAppsScriptConfigured()) {
    try {
      const res = await fetch(process.env.GOOGLE_APPS_SCRIPT_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: process.env.GOOGLE_APPS_SCRIPT_SECRET ?? '',
          targetTab: unitTab,
          masterTab: MASTER_TAB_NAME,
          registrationNumber: admission.registration_number,
          row: rowValues,
          summaryCounts,
        }),
      });
      if (!res.ok) {
        throw new Error(`Apps Script HTTP ${res.status}: ${await res.text()}`);
      }
      return { ok: true, targetTab: unitTab, syncedAt };
    } catch (error) {
      return {
        ok: false,
        targetTab: unitTab,
        syncedAt,
        error: error instanceof Error ? error.message : 'Gagal sinkron via Google Apps Script.',
      };
    }
  }

  return {
    ok: false,
    targetTab: unitTab,
    syncedAt,
    error: 'Google Sheets API belum dikonfigurasi pada environment variables (GOOGLE_SHEETS_SPREADSHEET_ID / Service Account).',
  };
}
