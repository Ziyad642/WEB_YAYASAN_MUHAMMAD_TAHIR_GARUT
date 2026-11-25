/**
 * Cron endpoint: Retry failed Google Sheets syncs automatically.
 *
 * Trigger this via Vercel Cron (vercel.json) or any external scheduler.
 * Protected by INTERNAL_CRON_SECRET header.
 *
 * Example vercel.json entry:
 * {
 *   "crons": [{ "path": "/api/cron/google-sync", "schedule": "0 * * * *" }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/server';
import { syncAdmissionToGoogleSheets } from '@/lib/google/sheets';

const CRON_SECRET = process.env.INTERNAL_CRON_SECRET;
// Max admissions to retry per run to avoid timeout
const BATCH_LIMIT = 20;

export async function GET(request: NextRequest) {
  // Validate cron secret
  const authHeader = request.headers.get('authorization');
  const secret = authHeader?.replace('Bearer ', '').trim();

  if (!CRON_SECRET || secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase admin client not configured' },
      { status: 503 }
    );
  }

  try {
    // Find admissions with failed or pending sync, ordered by oldest first
    const { data: failedSyncs, error: fetchError } = await supabase
      .from('google_sync_logs')
      .select('admission_id, retry_count')
      .eq('sync_status', 'failed')
      .lt('retry_count', 5) // Don't retry more than 5 times total
      .order('synced_at', { ascending: true })
      .limit(BATCH_LIMIT);

    if (fetchError) {
      console.error('[cron/google-sync] Failed to fetch sync logs:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch sync logs' },
        { status: 500 }
      );
    }

    if (!failedSyncs || failedSyncs.length === 0) {
      return NextResponse.json({
        message: 'No failed syncs found.',
        retried: 0,
        timestamp: new Date().toISOString(),
      });
    }

    const admissionIds = failedSyncs.map((s) => s.admission_id);
    console.log(
      `[cron/google-sync] Retrying ${admissionIds.length} failed syncs...`
    );

    // Fetch full admission data for each
    const { data: admissions, error: admError } = await supabase
      .from('admissions')
      .select(
        `
        *,
        applicants(*),
        guardians(*),
        admission_documents(*),
        admission_periods(*, education_units(*))
      `
      )
      .in('id', admissionIds);

    if (admError) {
      console.error('[cron/google-sync] Failed to fetch admissions:', admError);
      return NextResponse.json(
        { error: 'Failed to fetch admission records' },
        { status: 500 }
      );
    }

    let successCount = 0;
    let failCount = 0;

    for (const admission of admissions || []) {
      try {
        await syncAdmissionToGoogleSheets(admission as any);
        successCount++;
      } catch (err) {
        console.error(
          `[cron/google-sync] Retry failed for admission ${admission.id}:`,
          err
        );
        failCount++;
      }
    }

    console.log(
      `[cron/google-sync] Done. Success: ${successCount}, Failed: ${failCount}`
    );

    return NextResponse.json({
      message: 'Cron sync complete.',
      retried: admissionIds.length,
      success: successCount,
      failed: failCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[cron/google-sync] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Unexpected error during cron sync' },
      { status: 500 }
    );
  }
}
