import axios from 'axios';
import * as cheerio from 'cheerio';
import { getDb } from '../db/database';
import { CrawlSource, Region } from '../types';
import { findProvinceId } from '../utils/provinces';
import crypto from 'crypto';

// Crawler sources configuration
const SOURCES: CrawlSource[] = [
    { name: 'xoso.com.vn', baseUrl: 'https://xoso.com.vn', priority: 1 },
];

interface CrawledResult {
    draw_date: string;
    region: Region;
    province_id: string;
    prizes: { prize_code: string; numbers: string[] }[];
}

// Log utility
function logCrawl(level: 'INFO' | 'WARN' | 'ERROR', message: string, meta?: unknown): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [CRAWLER] [${level}] ${message}`;
    if (meta) {
        console.log(logEntry, JSON.stringify(meta));
    } else {
        console.log(logEntry);
    }
}

/**
 * Build URL for xoso.com.vn
 * MB: /xsmb-DD-MM-YYYY.html
 * MT: /xsmt-DD-MM-YYYY.html
 * MN: /xsmn-DD-MM-YYYY.html
 */
function buildXosoUrl(baseUrl: string, date: string, region: Region): string {
    const [y, m, d] = date.split('-');
    const regionSlug = region === 'mb' ? 'xsmb' : region === 'mt' ? 'xsmt' : 'xsmn';
    return `${baseUrl}/${regionSlug}-${d}-${m}-${y}.html`;
}

// Prize code mapping from row index (0-indexed after header) to our prize codes
const MB_PRIZE_MAP: Record<number, string> = {
    0: 'db', // Giải ĐB
    1: 'g1',
    2: 'g2',
    3: 'g3',
    4: 'g4',
    5: 'g5',
    6: 'g6',
    7: 'g7',
};

const MT_MN_PRIZE_MAP: Record<number, string> = {
    0: 'g8',
    1: 'g7',
    2: 'g6',
    3: 'g5',
    4: 'g4',
    5: 'g3',
    6: 'g2',
    7: 'g1',
    8: 'db',
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
                // Pad numbers according to prize digit requirements
                const padded = numbers.map(n => {
                    if (prizeCode === 'db') return n.padStart(5, '0');
                    if (prizeCode === 'g1') return n.padStart(5, '0');
                    if (prizeCode === 'g2') return n.padStart(5, '0');
                    if (prizeCode === 'g3') return n.padStart(5, '0');
                    if (prizeCode === 'g4') return n.padStart(4, '0');
                    if (prizeCode === 'g5') return n.padStart(4, '0');
                    if (prizeCode === 'g6') return n.padStart(3, '0');
                    if (prizeCode === 'g7') return n.padStart(2, '0');
                    return n;
                });
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

        // MT/MN pages may have multiple tables for different regions/days, but usually just one main table.
        // The table columns represent different provinces on the same day.
        $('table.table-result').each((_idx, tbl) => {
            const rows = $(tbl).find('tr');
            if (rows.length < 9) return; // Need at least header + 8/9 prize rows

            // First row (index 0) is header: <th>G</th> <th>Province 1</th> <th>Province 2</th> ...
            const headers = rows.eq(0).find('th');
            if (headers.length < 2) return;

            // Extract province IDs from headers
            const provinceColumns: { colIndex: number; provinceId: string }[] = [];
            headers.each((colIdx, th) => {
                const text = $(th).text().trim();
                if (colIdx > 0 && text.length > 0) { // Skip first column ("G")
                    const pid = findProvinceId(text, region);
                    if (pid) {
                        provinceColumns.push({ colIndex: colIdx, provinceId: pid });
                    }
                }
            });

            // Initialize prizes array for each province
            const provincePrizes: Record<string, { prize_code: string; numbers: string[] }[]> = {};
            for (const pc of provinceColumns) {
                provincePrizes[pc.provinceId] = [];
            }

            // Parse each prize row (starting from index 1)
            rows.each((i, tr) => {
                if (i === 0) return; // Skip header

                const tds = $(tr).find('td');
                if (tds.length < provinceColumns.length) return; // Ignore malformed rows

                const prizeCode = MT_MN_PRIZE_MAP[i - 1]; // Row 1 -> G8, Row 2 -> G7, ...
                if (!prizeCode) return;

                // For each province column
                for (let c = 0; c < provinceColumns.length; c++) {
                    const colInfo = provinceColumns[c];
                    // The first <td> in MT/MN table rows might be the column headers too, but actually `cells` just has the numbers.
                    // Let's rely on the crawler output: Row 1: [ '08', '00', '95' ] -> length 3 (matches 3 provinces).
                    // So cell index corresponds to province index (since the 'G' column uses <th> or we skip it).
                    const td = tds.eq(c);
                    const numbersText = td.text().trim();
                    const numbers = numbersText.split(/\s+/).filter((n: string) => /^\d+$/.test(n));

                    if (numbers.length > 0) {
                        const padded = numbers.map((n: string) => {
                            if (prizeCode === 'db') return n.padStart(6, '0');
                            if (['g1', 'g2', 'g3', 'g4'].includes(prizeCode)) return n.padStart(5, '0');
                            if (['g5', 'g6'].includes(prizeCode)) return n.padStart(4, '0');
                            if (prizeCode === 'g7') return n.padStart(3, '0');
                            if (prizeCode === 'g8') return n.padStart(2, '0');
                            return n;
                        });
                        provincePrizes[colInfo.provinceId].push({ prize_code: prizeCode, numbers: padded });
                    }
                }
            });

            // Push to final results
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

// Main crawl function
export async function crawl(date: string, region: Region): Promise<number> {
    logCrawl('INFO', `Starting crawl for ${region} on ${date}`);

    for (const source of SOURCES) {
        try {
            logCrawl('INFO', `Trying source: ${source.name}`);

            const url = buildXosoUrl(source.baseUrl, date, region);
            logCrawl('INFO', `Fetching: ${url}`);

            const response = await axios.get(url, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
            });

            if (response.status !== 200) {
                throw new Error(`HTTP ${response.status}`);
            }

            // Parse based on region
            let rawResults: CrawledResult[];
            if (region === 'mb') {
                rawResults = parseXosoComVnMB(response.data, date);
            } else {
                rawResults = parseXosoComVnMTMN(response.data, date, region);
            }

            const normalized = normalizeResults(rawResults);

            if (normalized.length === 0) {
                logCrawl('WARN', `No valid results parsed from ${source.name}`);
                continue;
            }

            const saved = saveCrawledResults(normalized, source.name);
            logCrawl('INFO', `Successfully saved ${saved} results from ${source.name}`);
            return saved;

        } catch (error) {
            logCrawl('ERROR', `Source ${source.name} failed`, {
                error: (error as Error).message,
            });
        }
    }

    logCrawl('ERROR', `All sources failed for ${region} on ${date}`);
    return 0;
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
            const saved = await crawl(dateStr, 'mb');
            totalSaved += saved;

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
