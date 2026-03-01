import * as cheerio from 'cheerio';
import { Region } from '../types';
import { findProvinceId } from '../utils/provinces';
import { logCrawl, type CrawledResult, padNumber } from './crawlerUtils';

/**
 * XSKT (xskt.com.vn) Parser
 *
 * URL patterns:
 *   MB: https://xskt.com.vn/xsmb/ngay-{D}-{M}-{YYYY}
 *   MT: https://xskt.com.vn/xsmt/ngay-{D}-{M}-{YYYY}
 *   MN: https://xskt.com.vn/xsmn/ngay-{D}-{M}-{YYYY}
 *
 * HTML structure (MB):
 *   Table class: "kqmb" or within section with id "mien-bac"
 *   Each row = one prize level
 *   First <td> class "txt-giai" = prize label (ĐB, G1, G2, ...)
 *   Second <td> class "v-giai" = numbers (text content, space-separated)
 *
 * HTML structure (MT/MN):
 *   Table within section#xsmt or section#xsmn
 *   Multi-province columns similar to xoso.com.vn
 *   Prize order: G8 → ĐB (bottom to top)
 */

// Row index → prize code for MB (0=ĐB, 1=G1, ..., 7=G7)
const MB_ROW_PRIZE_MAP: Record<number, string> = {
    0: 'db', 1: 'g1', 2: 'g2', 3: 'g3', 4: 'g4', 5: 'g5', 6: 'g6', 7: 'g7',
};

// Row index → prize code for MT/MN (0=G8, 1=G7, ..., 8=ĐB)
const MTMN_ROW_PRIZE_MAP: Record<number, string> = {
    0: 'g8', 1: 'g7', 2: 'g6', 3: 'g5', 4: 'g4', 5: 'g3', 6: 'g2', 7: 'g1', 8: 'db',
};

/**
 * Build URL for xskt.com.vn
 */
export function buildXSKTUrl(date: string, region: Region): string {
    const [y, m, d] = date.split('-');
    // xskt uses non-zero-padded day and month
    const day = parseInt(d, 10);
    const month = parseInt(m, 10);
    const regionSlug = region === 'mb' ? 'xsmb' : region === 'mt' ? 'xsmt' : 'xsmn';
    return `https://xskt.com.vn/${regionSlug}/ngay-${day}-${month}-${y}`;
}

/**
 * Parse MB results from xskt.com.vn
 */
export function parseXSKTMB(html: string, date: string): CrawledResult[] {
    logCrawl('INFO', `Parsing xskt.com.vn MB for ${date}`);

    try {
        const $ = cheerio.load(html);

        // Find the XSMB result table
        // Try multiple selectors in priority order
        let table = $('table.kqmb').first();
        if (table.length === 0) {
            table = $('#mien-bac table').first();
        }
        if (table.length === 0) {
            table = $('table.table-kqxs').first();
        }
        if (table.length === 0) {
            logCrawl('WARN', 'No XSMB result table found on xskt.com.vn');
            return [];
        }

        const prizes: { prize_code: string; numbers: string[] }[] = [];
        const rows = table.find('tr');
        let prizeRowIndex = 0;

        rows.each((_i, tr) => {
            const tds = $(tr).find('td');
            if (tds.length < 2) return;

            const prizeCode = MB_ROW_PRIZE_MAP[prizeRowIndex];
            if (!prizeCode) return;

            // The result cell is typically the second <td> or the one with class "v-giai"
            let numberTd = $(tr).find('td.v-giai').first();
            if (numberTd.length === 0) {
                numberTd = tds.eq(1);
            }

            const numbersText = numberTd.text().trim();
            const numbers = numbersText.split(/[\s\n]+/).filter(n => /^\d+$/.test(n));

            if (numbers.length > 0) {
                const padded = numbers.map(n => padNumber(n, prizeCode, 'mb'));
                prizes.push({ prize_code: prizeCode, numbers: padded });
                prizeRowIndex++;
            }
        });

        if (prizes.length === 0) {
            logCrawl('WARN', 'No prizes parsed from xskt.com.vn MB table');
            return [];
        }

        return [{ draw_date: date, region: 'mb', province_id: 'hanoi', prizes }];
    } catch (error) {
        logCrawl('ERROR', 'Failed to parse xskt.com.vn MB', {
            error: (error as Error).message,
        });
        return [];
    }
}

/**
 * Parse MT/MN results from xskt.com.vn
 */
export function parseXSKTMTMN(html: string, date: string, region: Region): CrawledResult[] {
    logCrawl('INFO', `Parsing xskt.com.vn ${region.toUpperCase()} for ${date}`);

    try {
        const $ = cheerio.load(html);
        const results: CrawledResult[] = [];

        // Find MT/MN section and table
        const sectionId = region === 'mt' ? '#xsmt' : '#xsmn';
        let table = $(`${sectionId} table`).first();
        if (table.length === 0) {
            // Fallback: look for specific table classes
            const className = region === 'mt' ? 'table.kqmt' : 'table.kqmn';
            table = $(className).first();
        }
        if (table.length === 0) {
            logCrawl('WARN', `No ${region.toUpperCase()} result table found on xskt.com.vn`);
            return [];
        }

        const rows = table.find('tr');
        if (rows.length < 9) return results;

        // Header row has province names
        const headers = rows.eq(0).find('th, td');
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

        if (provinceColumns.length === 0) return results;

        // Initialize prizes for each province
        const provincePrizes: Record<string, { prize_code: string; numbers: string[] }[]> = {};
        for (const pc of provinceColumns) {
            provincePrizes[pc.provinceId] = [];
        }

        // Parse each prize row
        let prizeRowIndex = 0;
        rows.each((i, tr) => {
            if (i === 0) return; // Skip header

            const tds = $(tr).find('td');
            if (tds.length < provinceColumns.length) return;

            const prizeCode = MTMN_ROW_PRIZE_MAP[prizeRowIndex];
            if (!prizeCode) return;
            prizeRowIndex++;

            for (let c = 0; c < provinceColumns.length; c++) {
                const colInfo = provinceColumns[c];
                const td = tds.eq(c);
                const numbersText = td.text().trim();
                const numbers = numbersText.split(/[\s\n]+/).filter(n => /^\d+$/.test(n));

                if (numbers.length > 0) {
                    const padded = numbers.map(n => padNumber(n, prizeCode, region));
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

        return results;
    } catch (error) {
        logCrawl('ERROR', `Failed to parse xskt.com.vn ${region.toUpperCase()}`, {
            error: (error as Error).message,
        });
        return [];
    }
}
