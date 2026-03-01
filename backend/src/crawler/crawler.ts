import axios from 'axios';
import * as cheerio from 'cheerio';
import { getDb } from '../db/database';
import { CrawlSource, Region } from '../types';
import crypto from 'crypto';

// Crawler sources configuration
const SOURCES: CrawlSource[] = [
    { name: 'xoso.com.vn', baseUrl: 'https://xoso.com.vn', priority: 1 },
    { name: 'xosodaiphat.com', baseUrl: 'https://xosodaiphat.com', priority: 2 },
];

interface CrawledResult {
    draw_date: string;
    region: Region;
    province_id: string;
    prizes: { prize_code: string; numbers: string[] }[];
}

// Log utility
function logCrawl(level: 'INFO' | 'WARN' | 'ERROR', message: string, meta?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [CRAWLER] [${level}] ${message}`;
    if (meta) {
        console.log(logEntry, JSON.stringify(meta));
    } else {
        console.log(logEntry);
    }
}

// Parse results from xoso.com.vn (simulated parser)
export function parseXosoComVn(html: string, date: string, region: Region): CrawledResult[] {
    // NOTE: This is a simulated parser structure.
    // In production, this would parse actual HTML from the source.
    // For now, we return empty to use seed data.
    logCrawl('INFO', `Parsing xoso.com.vn for ${region} on ${date}`);

    try {
        const $ = cheerio.load(html);
        const results: CrawledResult[] = [];
        // Parser logic would go here based on actual HTML structure
        return results;
    } catch (error) {
        logCrawl('ERROR', `Failed to parse xoso.com.vn`, { error: (error as Error).message });
        return [];
    }
}

// Parse results from xosodaiphat.com (simulated parser)
export function parseXosoDaiPhat(html: string, date: string, region: Region): CrawledResult[] {
    logCrawl('INFO', `Parsing xosodaiphat.com for ${region} on ${date}`);

    try {
        const $ = cheerio.load(html);
        const results: CrawledResult[] = [];
        // Parser logic would go here based on actual HTML structure
        return results;
    } catch (error) {
        logCrawl('ERROR', `Failed to parse xosodaiphat.com`, { error: (error as Error).message });
        return [];
    }
}

// Normalize and validate crawled data
export function normalizeResults(raw: CrawledResult[]): CrawledResult[] {
    return raw.filter(result => {
        // Validate required fields
        if (!result.draw_date || !result.region || !result.province_id) {
            logCrawl('WARN', 'Skipping result with missing fields', result);
            return false;
        }
        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(result.draw_date)) {
            logCrawl('WARN', 'Skipping result with invalid date', { date: result.draw_date });
            return false;
        }
        // Validate region
        if (!['mb', 'mt', 'mn'].includes(result.region)) {
            logCrawl('WARN', 'Skipping result with invalid region', { region: result.region });
            return false;
        }
        // Validate prizes
        if (!result.prizes || result.prizes.length === 0) {
            logCrawl('WARN', 'Skipping result with no prizes', result);
            return false;
        }
        return true;
    });
}

// Compute checksum for draw data (detect changes)
export function computeChecksum(result: CrawledResult): string {
    const data = JSON.stringify({
        date: result.draw_date,
        province: result.province_id,
        prizes: result.prizes,
    });
    return crypto.createHash('md5').update(data).digest('hex');
}

// Save crawled results to database
export function saveCrawledResults(results: CrawledResult[], sourceName: string): number {
    const db = getDb();
    let savedCount = 0;

    const checkExisting = db.prepare(
        'SELECT id, checksum FROM draws WHERE draw_date = ? AND province_id = ?'
    );
    const insertDraw = db.prepare(
        'INSERT INTO draws (draw_date, region, province_id, source, fetched_at, checksum) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const updateDraw = db.prepare(
        'UPDATE draws SET source = ?, fetched_at = ?, checksum = ? WHERE id = ?'
    );
    const deletePrizes = db.prepare('DELETE FROM prizes WHERE draw_id = ?');
    const insertPrize = db.prepare(
        'INSERT INTO prizes (draw_id, prize_code, numbers) VALUES (?, ?, ?)'
    );

    const saveAll = db.transaction(() => {
        for (const result of results) {
            const checksum = computeChecksum(result);
            const existing = checkExisting.get(result.draw_date, result.province_id) as any;

            let drawId: number;

            if (existing) {
                if (existing.checksum === checksum) {
                    logCrawl('INFO', `No changes detected for ${result.province_id} on ${result.draw_date}`);
                    continue;
                }
                // Update existing draw
                updateDraw.run(sourceName, new Date().toISOString(), checksum, existing.id);
                deletePrizes.run(existing.id);
                drawId = existing.id;
                logCrawl('INFO', `Updated draw ${result.province_id} on ${result.draw_date}`);
            } else {
                // Insert new draw
                const res = insertDraw.run(
                    result.draw_date, result.region, result.province_id,
                    sourceName, new Date().toISOString(), checksum
                );
                drawId = Number(res.lastInsertRowid);
                logCrawl('INFO', `New draw saved: ${result.province_id} on ${result.draw_date}`);
            }

            // Insert prizes
            for (const prize of result.prizes) {
                insertPrize.run(drawId, prize.prize_code, JSON.stringify(prize.numbers));
            }
            savedCount++;
        }
    });

    saveAll();
    return savedCount;
}

// Main crawl function with failover
export async function crawl(date: string, region: Region): Promise<number> {
    logCrawl('INFO', `Starting crawl for ${region} on ${date}`);

    const sortedSources = [...SOURCES].sort((a, b) => a.priority - b.priority);

    for (const source of sortedSources) {
        try {
            logCrawl('INFO', `Trying source: ${source.name}`);

            // Build URL based on source
            let url: string;
            if (source.name === 'xoso.com.vn') {
                const regionPath = region === 'mb' ? 'xsmb' : region === 'mt' ? 'xsmt' : 'xsmn';
                url = `${source.baseUrl}/xoso-${regionPath}/${date}.html`;
            } else {
                url = `${source.baseUrl}/xskt/${date}/${region}.html`;
            }

            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; XoSoBot/1.0)',
                },
            });

            if (response.status !== 200) {
                throw new Error(`HTTP ${response.status}`);
            }

            // Parse based on source
            let rawResults: CrawledResult[];
            if (source.name === 'xoso.com.vn') {
                rawResults = parseXosoComVn(response.data, date, region);
            } else {
                rawResults = parseXosoDaiPhat(response.data, date, region);
            }

            // Normalize
            const normalized = normalizeResults(rawResults);

            if (normalized.length === 0) {
                logCrawl('WARN', `No valid results parsed from ${source.name}`);
                continue; // Try next source
            }

            // Save to DB
            const saved = saveCrawledResults(normalized, source.name);
            logCrawl('INFO', `Successfully saved ${saved} results from ${source.name}`);
            return saved;

        } catch (error) {
            logCrawl('ERROR', `Source ${source.name} failed`, {
                error: (error as Error).message,
            });
            // Continue to next source (failover)
        }
    }

    logCrawl('ERROR', `All sources failed for ${region} on ${date}`);
    return 0;
}
