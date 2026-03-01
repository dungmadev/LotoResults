import { getDb } from '../db/database';
import { clearByPrefix } from './cache';

/**
 * Data Cleanup Service
 *
 * Automatically deletes old lottery results to keep database size manageable.
 * Default retention: 90 days. Configurable via DATA_RETENTION_DAYS env var.
 *
 * Runs on startup (once) and then every 24 hours.
 */

const DEFAULT_RETENTION_DAYS = 90;
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getRetentionDays(): number {
    const envDays = process.env.DATA_RETENTION_DAYS;
    if (envDays) {
        const parsed = parseInt(envDays, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return DEFAULT_RETENTION_DAYS;
}

/**
 * Delete draws (and their prizes via CASCADE) older than retention period.
 * Returns the number of deleted draws.
 */
export function cleanupOldData(): number {
    const db = getDb();
    const retentionDays = getRetentionDays();

    // Calculate cutoff date
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);
    const cutoffDate = cutoff.toISOString().split('T')[0];

    // Count before delete (for logging)
    const countResult = db.prepare(
        'SELECT COUNT(*) as count FROM draws WHERE draw_date < ?'
    ).get(cutoffDate) as { count: number };

    if (countResult.count === 0) {
        console.log(`🧹 Cleanup: No old data to delete (retention: ${retentionDays} days, cutoff: ${cutoffDate})`);
        return 0;
    }

    // Delete old draws — prizes are deleted automatically via ON DELETE CASCADE
    const result = db.prepare('DELETE FROM draws WHERE draw_date < ?').run(cutoffDate);

    // Clear all caches since data changed
    clearByPrefix('results:');
    clearByPrefix('latest:');

    console.log(`🧹 Cleanup: Deleted ${result.changes} draws older than ${cutoffDate} (retention: ${retentionDays} days)`);

    // VACUUM to reclaim disk space (only if significant data was deleted)
    if (result.changes > 50) {
        try {
            db.exec('VACUUM');
            console.log('🧹 Cleanup: Database vacuumed to reclaim space');
        } catch (err) {
            console.warn('🧹 Cleanup: VACUUM failed (non-critical):', (err as Error).message);
        }
    }

    return result.changes;
}

/**
 * Start the periodic cleanup scheduler.
 * Runs cleanup immediately on first call, then every 24 hours.
 */
export function startCleanupScheduler(): void {
    const retentionDays = getRetentionDays();
    console.log(`🧹 Cleanup scheduler started (retention: ${retentionDays} days, interval: 24h)`);

    // Run once on startup (delayed 10s to not slow down boot)
    setTimeout(() => {
        cleanupOldData();
    }, 10_000);

    // Then every 24 hours
    setInterval(() => {
        cleanupOldData();
    }, CLEANUP_INTERVAL_MS);
}
