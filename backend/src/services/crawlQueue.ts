import { EventEmitter } from 'events';
import { Region } from '../types';
import { clearByPrefix } from './cache';

// --- Types ---

export type CrawlJobStatus = 'pending' | 'processing' | 'done' | 'failed';

export interface CrawlJob {
    id: string;
    date: string;
    region: Region;
    status: CrawlJobStatus;
    retries: number;
    maxRetries: number;
    error?: string;
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
}

export interface CrawlQueueEvent {
    type: 'data-ready' | 'crawl-error' | 'crawl-progress';
    job: CrawlJob;
    savedCount?: number;
    message: string;
}

// --- Constants ---

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;     // 1s base for exponential backoff
const RATE_LIMIT_MS = 500;      // 500ms delay between jobs
const MAX_QUEUE_SIZE = 50;      // Prevent unbounded queue growth

// --- CrawlQueue Singleton ---

class CrawlQueue extends EventEmitter {
    private queue: CrawlJob[] = [];
    private processing = false;
    private static instance: CrawlQueue;

    private constructor() {
        super();
    }

    static getInstance(): CrawlQueue {
        if (!CrawlQueue.instance) {
            CrawlQueue.instance = new CrawlQueue();
        }
        return CrawlQueue.instance;
    }

    /**
     * Generate unique job ID from date + region
     */
    private jobId(date: string, region: Region): string {
        return `${date}:${region}`;
    }

    /**
     * Check if a job for this date+region is already pending or processing
     */
    private isDuplicate(date: string, region: Region): boolean {
        return this.queue.some(
            job => job.id === this.jobId(date, region) &&
                (job.status === 'pending' || job.status === 'processing')
        );
    }

    /**
     * Enqueue a crawl job. Returns false if duplicate or queue full.
     */
    enqueue(date: string, region: Region): { enqueued: boolean; jobId: string; reason?: string } {
        const id = this.jobId(date, region);

        // Deduplication check
        if (this.isDuplicate(date, region)) {
            return { enqueued: false, jobId: id, reason: 'Yêu cầu đã có trong hàng đợi' };
        }

        // Queue size check
        const activeJobs = this.queue.filter(j => j.status === 'pending' || j.status === 'processing');
        if (activeJobs.length >= MAX_QUEUE_SIZE) {
            return { enqueued: false, jobId: id, reason: 'Hàng đợi đầy, vui lòng thử lại sau' };
        }

        const job: CrawlJob = {
            id,
            date,
            region,
            status: 'pending',
            retries: 0,
            maxRetries: MAX_RETRIES,
            createdAt: new Date().toISOString(),
        };

        this.queue.push(job);
        console.log(`[CrawlQueue] ✅ Enqueued: ${id}`);

        // Emit progress event
        this.emitEvent({
            type: 'crawl-progress',
            job,
            message: `Đã thêm vào hàng đợi: ${region.toUpperCase()} ngày ${date}`,
        });

        // Start processing if not already running
        this.processNext();

        return { enqueued: true, jobId: id };
    }

    /**
     * Enqueue crawl for all 3 regions for a given date
     */
    enqueueAllRegions(date: string): void {
        const regions: Region[] = ['mb', 'mt', 'mn'];
        for (const region of regions) {
            this.enqueue(date, region);
        }
    }

    /**
     * Process the next job in the queue (concurrency = 1)
     */
    private async processNext(): Promise<void> {
        if (this.processing) return;

        const nextJob = this.queue.find(j => j.status === 'pending');
        if (!nextJob) return;

        this.processing = true;
        nextJob.status = 'processing';
        nextJob.startedAt = new Date().toISOString();

        console.log(`[CrawlQueue] 🔄 Processing: ${nextJob.id} (attempt ${nextJob.retries + 1}/${nextJob.maxRetries + 1})`);

        this.emitEvent({
            type: 'crawl-progress',
            job: nextJob,
            message: `Đang crawl: ${nextJob.region.toUpperCase()} ngày ${nextJob.date}`,
        });

        try {
            // Dynamic import to avoid circular dependency issues
            const { crawl } = await import('../crawler/crawler');
            const savedCount = await crawl(nextJob.date, nextJob.region);

            nextJob.status = 'done';
            nextJob.completedAt = new Date().toISOString();

            // Invalidate all cached results for this date so next fetch gets fresh DB data
            clearByPrefix(`results:${nextJob.date}`);
            // Also clear "latest" cache since new data may affect latest results
            clearByPrefix('latest:');

            console.log(`[CrawlQueue] ✅ Done: ${nextJob.id}, saved ${savedCount} results (cache cleared)`);

            this.emitEvent({
                type: 'data-ready',
                job: nextJob,
                savedCount,
                message: `Đã cập nhật: ${nextJob.region.toUpperCase()} ngày ${nextJob.date} (${savedCount} kết quả)`,
            });

        } catch (error) {
            const errMsg = error instanceof Error ? error.message : 'Unknown error';
            console.error(`[CrawlQueue] ❌ Failed: ${nextJob.id}`, errMsg);

            nextJob.retries++;

            if (nextJob.retries <= nextJob.maxRetries) {
                // Retry with exponential backoff
                nextJob.status = 'pending';
                const delay = BASE_DELAY_MS * Math.pow(2, nextJob.retries - 1);
                console.log(`[CrawlQueue] 🔁 Retry ${nextJob.retries}/${nextJob.maxRetries} in ${delay}ms`);

                this.emitEvent({
                    type: 'crawl-progress',
                    job: nextJob,
                    message: `Đang thử lại (${nextJob.retries}/${nextJob.maxRetries}): ${nextJob.region.toUpperCase()} ngày ${nextJob.date}`,
                });

                await this.delay(delay);
            } else {
                // Max retries reached
                nextJob.status = 'failed';
                nextJob.error = errMsg;
                nextJob.completedAt = new Date().toISOString();

                console.error(`[CrawlQueue] ☠️ Permanently failed: ${nextJob.id} after ${nextJob.maxRetries} retries`);

                this.emitEvent({
                    type: 'crawl-error',
                    job: nextJob,
                    message: `Crawl thất bại: ${nextJob.region.toUpperCase()} ngày ${nextJob.date} — ${errMsg}`,
                });
            }
        }

        this.processing = false;

        // Rate limit: wait before processing next job
        await this.delay(RATE_LIMIT_MS);

        // Cleanup old completed/failed jobs (keep last 100)
        this.cleanup();

        // Process next
        this.processNext();
    }

    /**
     * Emit event to all listeners (SSE manager will listen to these)
     */
    private emitEvent(event: CrawlQueueEvent): void {
        this.emit('crawl-event', event);
    }

    /**
     * Get current queue status
     */
    getStatus(): {
        pending: number;
        processing: number;
        done: number;
        failed: number;
        jobs: CrawlJob[];
    } {
        const activeJobs = this.queue.filter(
            j => j.status === 'pending' || j.status === 'processing'
        );
        return {
            pending: this.queue.filter(j => j.status === 'pending').length,
            processing: this.queue.filter(j => j.status === 'processing').length,
            done: this.queue.filter(j => j.status === 'done').length,
            failed: this.queue.filter(j => j.status === 'failed').length,
            jobs: activeJobs,
        };
    }

    /**
     * Check if there are any pending or processing jobs for a given date.
     * Used by getResults to determine if more data is still coming.
     */
    hasPendingJobsForDate(date: string): boolean {
        return this.queue.some(
            j => j.date === date &&
                (j.status === 'pending' || j.status === 'processing')
        );
    }

    /**
     * Cleanup old completed/failed jobs
     */
    private cleanup(): void {
        const completedJobs = this.queue.filter(j => j.status === 'done' || j.status === 'failed');
        if (completedJobs.length > 100) {
            // Remove oldest completed jobs
            const toRemove = completedJobs.slice(0, completedJobs.length - 100);
            this.queue = this.queue.filter(j => !toRemove.includes(j));
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export singleton
export const crawlQueue = CrawlQueue.getInstance();
