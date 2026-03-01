import * as cheerio from 'cheerio';
import { Region } from '../types';
import { findProvinceId } from '../utils/provinces';
import { logCrawl, type CrawledResult, padNumber } from './crawlerUtils';

/**
 * Minh Ngọc (minhngoc.net.vn) Parser
 *
 * URL patterns:
 *   MB: https://www.minhngoc.net.vn/ket-qua-xo-so/mien-bac/{DD-MM-YYYY}.html
 *   MT: https://www.minhngoc.net.vn/ket-qua-xo-so/mien-trung/{DD-MM-YYYY}.html
 *   MN: https://www.minhngoc.net.vn/ket-qua-xo-so/mien-nam/{DD-MM-YYYY}.html
 *
 * HTML structure:
 *   Table class: "bkqtinhmienbac" (for MB), "bkqtinhmienbac" variant for MT/MN
 *   Each row = one prize level
 *   First <td> = prize label (e.g., "Giải ĐB", "Giải nhất")
 *   Second <td> = numbers, each wrapped in <div>
 */

// Prize label → prize_code mapping for MB
const MB_LABEL_MAP: Record<string, string> = {
    'đb': 'db',
    'đặc biệt': 'db',
    'giải đb': 'db',
    'nhất': 'g1',
    'giải nhất': 'g1',
    'nhì': 'g2',
    'giải nhì': 'g2',
    'ba': 'g3',
    'giải ba': 'g3',
    'tư': 'g4',
    'giải tư': 'g4',
    'năm': 'g5',
    'giải năm': 'g5',
    'sáu': 'g6',
    'giải sáu': 'g6',
    'bảy': 'g7',
    'giải bảy': 'g7',
};

// For MT/MN, prize order is reversed (G8 first, ĐB last)
const MTMN_LABEL_MAP: Record<string, string> = {
    ...MB_LABEL_MAP,
    'tám': 'g8',
    'giải tám': 'g8',
};

// Row index → prize code for MB (0=ĐB, 1=G1, ..., 7=G7)
const MB_ROW_PRIZE_MAP: Record<number, string> = {
    0: 'db', 1: 'g1', 2: 'g2', 3: 'g3', 4: 'g4', 5: 'g5', 6: 'g6', 7: 'g7',
};

// Row index → prize code for MT/MN (0=G8, 1=G7, ..., 8=ĐB)
const MTMN_ROW_PRIZE_MAP: Record<number, string> = {
    0: 'g8', 1: 'g7', 2: 'g6', 3: 'g5', 4: 'g4', 5: 'g3', 6: 'g2', 7: 'g1', 8: 'db',
};

/**
 * Build URL for minhngoc.net.vn
 */
export function buildMinhNgocUrl(date: string, region: Region): string {
    const [y, m, d] = date.split('-');
    const regionSlug = region === 'mb' ? 'mien-bac'
        : region === 'mt' ? 'mien-trung'
            : 'mien-nam';
    return `https://www.minhngoc.net.vn/ket-qua-xo-so/${regionSlug}/${d}-${m}-${y}.html`;
}

/**
 * Detect prize code from label text (fuzzy matching)
 */
function detectPrizeCode(text: string, prizeMap: Record<string, string>): string | null {
    const normalized = text.toLowerCase().replace(/[^a-zàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ0-9\s]/g, '').trim();

    for (const [key, code] of Object.entries(prizeMap)) {
        if (normalized.includes(key)) return code;
    }
    return null;
}

/**
 * Parse MB results from minhngoc.net.vn
 */
export function parseMinhNgocMB(html: string, date: string): CrawledResult[] {
    logCrawl('INFO', `Parsing minhngoc.net.vn MB for ${date}`);

    try {
        const $ = cheerio.load(html);

        // Find the result table - minhngoc uses "bkqtinhmienbac" class
        const table = $('table.bkqtinhmienbac').first();

        if (table.length === 0) {
            logCrawl('WARN', 'No table.bkqtinhmienbac found on minhngoc.net.vn');
            return [];
        }

        const prizes: { prize_code: string; numbers: string[] }[] = [];
        const rows = table.find('tr');
        let rowIndex = 0;

        rows.each((_i, tr) => {
            const tds = $(tr).find('td');
            if (tds.length < 2) return;

            const labelText = tds.first().text().trim();
            // Try label-based detection first, fallback to row index
            let prizeCode = detectPrizeCode(labelText, MB_LABEL_MAP);
            if (!prizeCode) {
                prizeCode = MB_ROW_PRIZE_MAP[rowIndex] || null;
            }
            if (!prizeCode) return;

            rowIndex++;

            // Numbers are in the last <td>, each wrapped in a <div>
            const numberTd = tds.last();
            const numbers: string[] = [];

            // Try extracting from individual divs first
            const divs = numberTd.find('div');
            if (divs.length > 0) {
                divs.each((_j, div) => {
                    const num = $(div).text().trim().replace(/\D/g, '');
                    if (num.length > 0) numbers.push(num);
                });
            } else {
                // Fallback: split text by whitespace
                const text = numberTd.text().trim();
                const nums = text.split(/\s+/).filter(n => /^\d+$/.test(n));
                numbers.push(...nums);
            }

            if (numbers.length > 0) {
                const padded = numbers.map(n => padNumber(n, prizeCode, 'mb'));
                prizes.push({ prize_code: prizeCode, numbers: padded });
            }
        });

        if (prizes.length === 0) {
            logCrawl('WARN', 'No prizes parsed from minhngoc MB table');
            return [];
        }

        return [{ draw_date: date, region: 'mb', province_id: 'hanoi', prizes }];
    } catch (error) {
        logCrawl('ERROR', 'Failed to parse minhngoc.net.vn MB', {
            error: (error as Error).message,
        });
        return [];
    }
}

/**
 * Parse MT/MN results from minhngoc.net.vn
 * MT/MN pages have multi-province tables with province headers
 */
export function parseMinhNgocMTMN(html: string, date: string, region: Region): CrawledResult[] {
    logCrawl('INFO', `Parsing minhngoc.net.vn ${region.toUpperCase()} for ${date}`);

    try {
        const $ = cheerio.load(html);
        const results: CrawledResult[] = [];

        // MT/MN tables on minhngoc use class "bkqtinh" with province columns
        const tables = $('table.bkqtinh, table.bkqtinhmienbac');

        tables.each((_idx, tbl) => {
            const rows = $(tbl).find('tr');
            if (rows.length < 9) return;

            // Header row has province names in <th> elements
            const headers = rows.eq(0).find('th');
            if (headers.length < 2) return;

            // Extract province info from headers
            const provinceColumns: { colIndex: number; provinceId: string }[] = [];
            headers.each((colIdx, th) => {
                if (colIdx === 0) return; // Skip prize label column
                const text = $(th).text().trim();
                if (text.length > 0) {
                    const pid = findProvinceId(text, region);
                    if (pid) {
                        provinceColumns.push({ colIndex: colIdx, provinceId: pid });
                    }
                }
            });

            if (provinceColumns.length === 0) return;

            // Initialize prizes for each province
            const provincePrizes: Record<string, { prize_code: string; numbers: string[] }[]> = {};
            for (const pc of provinceColumns) {
                provincePrizes[pc.provinceId] = [];
            }

            // Parse prize rows
            let prizeRowIndex = 0;
            rows.each((i, tr) => {
                if (i === 0) return; // Skip header

                const tds = $(tr).find('td');
                if (tds.length < 1) return;

                const prizeCode = MTMN_ROW_PRIZE_MAP[prizeRowIndex];
                if (!prizeCode) return;
                prizeRowIndex++;

                // For each province column
                for (let c = 0; c < provinceColumns.length; c++) {
                    const colInfo = provinceColumns[c];
                    const td = tds.eq(c);
                    const numbersText = td.text().trim();
                    const numbers = numbersText.split(/\s+/).filter(n => /^\d+$/.test(n));

                    if (numbers.length > 0) {
                        const padded = numbers.map(n => padNumber(n, prizeCode, region));
                        provincePrizes[colInfo.provinceId].push({ prize_code: prizeCode, numbers: padded });
                    }
                }
            });

            // Push results for each province
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
        logCrawl('ERROR', `Failed to parse minhngoc.net.vn ${region.toUpperCase()}`, {
            error: (error as Error).message,
        });
        return [];
    }
}
