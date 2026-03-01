import axios, { CancelTokenSource } from 'axios';
import * as cheerio from 'cheerio';
import { getDb } from '../db/database';
import { Region, EXPECTED_PRIZE_COUNT } from '../types';
import { findProvinceId } from '../utils/provinces';
import crypto from 'crypto';
import {
    logCrawl,
    type CrawledResult,
    padNumber,
    countPrizeNumbers,
    countProvincePrizeNumbers,
    getRandomUserAgent,
} from './crawlerUtils';
import { buildMinhNgocUrl, parseMinhNgocMB, parseMinhNgocMTMN } from './parseMinhNgoc';
import { buildXSKTUrl, parseXSKTMB, parseXSKTMTMN } from './parseXSKT';

// --- Source Configuration ---

interface SourceConfig {
    name: string;
    buildUrl: (date: string, region: Region) => string;
    /** Regions this source supports. If omitted, supports all. */
    supportedRegions?: Region[];
    parseMB: (html: string, date: string) => CrawledResult[];
    parseMTMN: (html: string, date: string, region: Region) => CrawledResult[];
}

const SOURCES: SourceConfig[] = [
    {
        name: 'xoso.com.vn',
        buildUrl: buildXosoUrl,
        parseMB: parseXosoComVnMB,
        parseMTMN: parseXosoComVnMTMN,
    },
    {
        name: 'minhngoc.net.vn',
        buildUrl: buildMinhNgocUrl,
        parseMB: parseMinhNgocMB,
        parseMTMN: parseMinhNgocMTMN,
    },
    {
        name: 'xskt.com.vn',
        buildUrl: buildXSKTUrl,
        parseMB: parseXSKTMB,
        parseMTMN: parseXSKTMTMN,
    },
];

// --- Crawl Result Type ---

export interface CrawlResult {
    savedCount: number;
    provinceCount: number;
    provinceNames: string[];
    sourceName: string;
}

// --- xoso.com.vn URL Builder (existing source) ---

/**
 * Build URL for xoso.com.vn
 * MB: /xsmb-DD-MM-YYYY.html
 * MT: /xsmt-DD-MM-YYYY.html
 * MN: /xsmn-DD-MM-YYYY.html
 */
function buildXosoUrl(date: string, region: Region): string {
    const [y, m, d] = date.split('-');
    const regionSlug = region === 'mb' ? 'xsmb' : region === 'mt' ? 'xsmt' : 'xsmn';
    return `https://xoso.com.vn/${regionSlug}-${d}-${m}-${y}.html`;
}

// Prize code mapping from row index (0-indexed after header) to our prize codes
const MB_PRIZE_MAP: Record<number, string> = {
    0: 'db', 1: 'g1', 2: 'g2', 3: 'g3', 4: 'g4', 5: 'g5', 6: 'g6', 7: 'g7',
};

const MT_MN_PRIZE_MAP: Record<number, string> = {
    0: 'g8', 1: 'g7', 2: 'g6', 3: 'g5', 4: 'g4', 5: 'g3', 6: 'g2', 7: 'g1', 8: 'db',
};

/**
 * Parse MB results from xoso.com.vn HTML
 * Table class="table-result" has rows: [header, ĐB, G1, G2, G3, G4, G5, G6, G7]
 */
export function parseXosoComVnMB(html: string, date: string): CrawledResult[] {
    logCrawl('INFO', `Parsing xoso.com.vn MB for ${date}`);

    try {
        const $ = cheerio.load(html);
        const table = $('table.table-result').first();

        if (table.length === 0) {
            logCrawl('WARN', 'No table.table-result found');
            return [];
        }

        const prizes: { prize_code: string; numbers: string[] }[] = [];
        const rows = table.find('tr');

        // Skip header row (index 0), parse prize rows (1-8)
        rows.each((i, tr) => {
            if (i === 0) return; // Skip header

            const tds = $(tr).find('td');
            if (tds.length < 1) return;

            const prizeCode = MB_PRIZE_MAP[i - 1];
            if (!prizeCode) return;

            // First <td> contains numbers separated by whitespace
            const numbersText = tds.eq(0).text().trim();
            const numbers = numbersText.split(/\s+/).filter(n => /^\d+$/.test(n));

            if (numbers.length > 0) {
                const padded = numbers.map(n => padNumber(n, prizeCode, 'mb'));
                prizes.push({ prize_code: prizeCode, numbers: padded });
            }
        });

        if (prizes.length === 0) {
            logCrawl('WARN', 'No prizes parsed from MB table');
            return [];
        }

        return [{
            draw_date: date,
            region: 'mb',
            province_id: 'hanoi',
            prizes,
        }];
    } catch (error) {
        logCrawl('ERROR', 'Failed to parse xoso.com.vn MB', { error: (error as Error).message });
        return [];
    }
}

/**
 * Parse MT/MN results from xoso.com.vn HTML
 * MT/MN pages contain multiple province tables
 * Each table.table-result has the province results (prize order reversed: G8→ĐB)
 */
export function parseXosoComVnMTMN(html: string, date: string, region: Region): CrawledResult[] {
    logCrawl('INFO', `Parsing xoso.com.vn ${region.toUpperCase()} for ${date}`);

    try {
        const $ = cheerio.load(html);
        const results: CrawledResult[] = [];

        $('table.table-result').each((_idx, tbl) => {
            const rows = $(tbl).find('tr');
            if (rows.length < 9) return;

            const headers = rows.eq(0).find('th');
            if (headers.length < 2) return;

            const provinceColumns: { colIndex: number; provinceId: string }[] = [];
            headers.each((colIdx, th) => {
                const text = $(th).text().trim();
                if (colIdx > 0 && text.length > 0) {
                    const pid = findProvinceId(text, region);
                    if (pid) {
                        provinceColumns.push({ colIndex: colIdx, provinceId: pid });
                    }
                }
            });

            const provincePrizes: Record<string, { prize_code: string; numbers: string[] }[]> = {};
            for (const pc of provinceColumns) {
                provincePrizes[pc.provinceId] = [];
            }

            rows.each((i, tr) => {
                if (i === 0) return;

                const tds = $(tr).find('td');
                if (tds.length < provinceColumns.length) return;

                const prizeCode = MT_MN_PRIZE_MAP[i - 1];
                if (!prizeCode) return;

                for (let c = 0; c < provinceColumns.length; c++) {
                    const colInfo = provinceColumns[c];
                    const td = tds.eq(c);
                    const numbersText = td.text().trim();
                    const numbers = numbersText.split(/\s+/).filter((n: string) => /^\d+$/.test(n));

                    if (numbers.length > 0) {
                        const padded = numbers.map((n: string) => padNumber(n, prizeCode, region));
                        provincePrizes[colInfo.provinceId].push({ prize_code: prizeCode, numbers: padded });
                    }
                }
            });

            for (const pc of provinceColumns) {
                if (provincePrizes[pc.provinceId].length > 0) {
                    results.push({
                        draw_date: date,
                        region,
                        province_id: pc.provinceId,
                        prizes: provincePrizes[pc.provinceId],
                    });
                }
            }
        });

        return results;
    } catch (error) {
        logCrawl('ERROR', `Failed to parse xoso.com.vn ${region.toUpperCase()}`, {
            error: (error as Error).message,
        });
        return [];
    }
}

// Normalize and validate crawled data
export function normalizeResults(raw: CrawledResult[]): CrawledResult[] {
    return raw.filter(result => {
        if (!result.draw_date || !result.region || !result.province_id) {
            logCrawl('WARN', 'Skipping result with missing fields', result);
            return false;
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(result.draw_date)) {
            logCrawl('WARN', 'Skipping result with invalid date', { date: result.draw_date });
            return false;
        }
        if (!['mb', 'mt', 'mn'].includes(result.region)) {
            logCrawl('WARN', 'Skipping result with invalid region', { region: result.region });
            return false;
        }
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
                updateDraw.run(sourceName, new Date().toISOString(), checksum, existing.id);
                deletePrizes.run(existing.id);
                drawId = existing.id;
                logCrawl('INFO', `Updated draw ${result.province_id} on ${result.draw_date}`);
            } else {
                const res = insertDraw.run(
                    result.draw_date, result.region, result.province_id,
                    sourceName, new Date().toISOString(), checksum
                );
                drawId = Number(res.lastInsertRowid);
                logCrawl('INFO', `New draw saved: ${result.province_id} on ${result.draw_date}`);
            }

            for (const prize of result.prizes) {
                insertPrize.run(drawId, prize.prize_code, JSON.stringify(prize.numbers));
            }
            savedCount++;
        }
    });

    saveAll();
    return savedCount;
}

// --- Race & Fallback Mechanism ---

/**
 * Validate if results are "sufficient" — all provinces have enough prize numbers.
 * A result is sufficient when each province has at least EXPECTED_PRIZE_COUNT numbers.
 */
function isResultSufficient(results: CrawledResult[], region: Region): boolean {
    if (results.length === 0) return false;

    const expectedCount = EXPECTED_PRIZE_COUNT[region];

    // For MB: exactly 1 province = hanoi
    if (region === 'mb') {
        return results.length >= 1 && countProvincePrizeNumbers(results[0]) >= expectedCount;
    }

    // For MT/MN: at least 1 province with sufficient data
    return results.some(r => countProvincePrizeNumbers(r) >= expectedCount);
}

/**
 * Fetch and parse data from a single source with AbortController support.
 * Returns parsed results if sufficient, otherwise throws.
 */
async function fetchFromSource(
    source: SourceConfig,
    date: string,
    region: Region,
    cancelToken: CancelTokenSource,
): Promise<{ results: CrawledResult[]; sourceName: string }> {
    // Check if source supports this region
    if (source.supportedRegions && !source.supportedRegions.includes(region)) {
        throw new Error(`Source ${source.name} does not support region ${region}`);
    }

    const url = source.buildUrl(date, region);
    logCrawl('INFO', `[Race] Fetching from ${source.name}: ${url}`);

    try {
        const response = await axios.get(url, {
            timeout: 15000,
            cancelToken: cancelToken.token,
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
            },
        });

        if (response.status !== 200) {
            throw new Error(`HTTP ${response.status}`);
        }

        // Parse response

        // Parse based on region
        let rawResults: CrawledResult[];
        if (region === 'mb') {
            rawResults = source.parseMB(response.data, date);
        } else {
            rawResults = source.parseMTMN(response.data, date, region);
        }

        const normalized = normalizeResults(rawResults);

        // Validate sufficiency
        if (!isResultSufficient(normalized, region)) {
            const total = countPrizeNumbers(normalized);
            const expected = EXPECTED_PRIZE_COUNT[region];
            logCrawl('WARN', `[Race] ${source.name} returned insufficient data (${total} numbers, expected ≥${expected})`);
            throw new Error(`Insufficient data from ${source.name}: got ${total} numbers, expected ≥${expected}`);
        }

        const total = countPrizeNumbers(normalized);
        logCrawl('INFO', `[Race] ✅ ${source.name} returned sufficient data (${total} numbers)`);
        logCrawl('INFO', `[Race] ✅ ${source.name} — ${normalized.length} province(s) parsed`);

        return { results: normalized, sourceName: source.name };
    } catch (error) {
        if (axios.isCancel(error)) {
            logCrawl('INFO', `[Race] ⚡ ${source.name} aborted (another source won the race)`);
            throw error; // Re-throw cancel to respect Promise.any semantics
        }
        // Source failed — let Promise.any try others
        logCrawl('WARN', `[Race] ❌ ${source.name} failed: ${(error as Error).message}`);
        throw error;
    }
}

/**
 * Main crawl function — Race & Fallback using Promise.any + AbortController.
 *
 * 1. Fetch from all sources concurrently
 * 2. First source to return "sufficient" data wins
 * 3. Cancel remaining requests immediately
 *
 * @returns CrawlResult with savedCount, provinceCount, provinceNames, sourceName
 */
export async function crawl(
    date: string,
    region: Region,
): Promise<CrawlResult> {
    logCrawl('INFO', `Starting crawl for ${region} on ${date} (Race & Fallback, ${SOURCES.length} sources)`);

    // Filter sources that support this region
    const activeSources = SOURCES.filter(
        s => !s.supportedRegions || s.supportedRegions.includes(region)
    );

    if (activeSources.length === 0) {
        logCrawl('ERROR', `No sources available for ${region}`);
        return { savedCount: 0, provinceCount: 0, provinceNames: [], sourceName: '' };
    }

    // Create a CancelTokenSource per source for independent cancellation
    const cancelTokens: CancelTokenSource[] = activeSources.map(() => axios.CancelToken.source());

    try {
        // Race all sources — first to return sufficient data wins
        const { results, sourceName } = await Promise.any(
            activeSources.map((source, index) =>
                fetchFromSource(source, date, region, cancelTokens[index])
            )
        );

        // Cancel all remaining sources
        logCrawl('INFO', `[Race] 🏆 Winner: ${sourceName} — Cancelling ${activeSources.length - 1} remaining sources`);
        for (const token of cancelTokens) {
            token.cancel(`Race won by ${sourceName}`);
        }

        // Save to database
        const saved = saveCrawledResults(results, sourceName);

        // Extract province info from results
        const { PROVINCES } = await import('../utils/provinces');
        const provinceNames = results.map(r => {
            const province = PROVINCES.find(p => p.id === r.province_id);
            return province?.name || r.province_id;
        });

        logCrawl('INFO', `Successfully saved ${saved} results (${results.length} provinces) from ${sourceName}`);

        return {
            savedCount: saved,
            provinceCount: results.length,
            provinceNames,
            sourceName,
        };

    } catch (error: unknown) {
        // All sources failed — AggregateError from Promise.any
        if (error instanceof AggregateError) {
            const errors = error.errors.map((e: unknown) => (e instanceof Error ? e.message : String(e))).join('; ');
            logCrawl('ERROR', `[Race] All ${activeSources.length} sources failed for ${region} on ${date}: ${errors}`);
        } else {
            logCrawl('ERROR', `[Race] Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
        }
        return { savedCount: 0, provinceCount: 0, provinceNames: [], sourceName: '' };
    }
}

/**
 * Crawl multiple days of MB results for backfill
 */
export async function crawlBackfill(days: number = 30): Promise<number> {
    let totalSaved = 0;
    const today = new Date();

    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        try {
            const result = await crawl(dateStr, 'mb');
            totalSaved += result.savedCount;

            // Rate limit: wait 500ms between requests
            if (i < days - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        } catch (error) {
            logCrawl('ERROR', `Backfill failed for ${dateStr}`, {
                error: (error as Error).message,
            });
        }
    }

    logCrawl('INFO', `Backfill complete: ${totalSaved} draws saved over ${days} days`);
    return totalSaved;
}
