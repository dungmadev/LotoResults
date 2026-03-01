import { getDb } from '../db/database';
import { DrawResult, Province, ResultsQuery, LatestQuery, Region } from '../types';
import {
    getCache, setCache,
    resultsCacheKey, latestCacheKey, provincesCacheKey,
    OLD_RESULT_TTL, LATEST_RESULT_TTL, PROVINCE_TTL
} from './cache';

interface DrawRow {
    id: number;
    draw_date: string;
    region: string;
    province_id: string;
    source: string;
    fetched_at: string;
    checksum: string;
    province_name: string;
}

interface PrizeRow {
    id: number;
    draw_id: number;
    prize_code: string;
    numbers: string;
}

function buildDrawResults(drawRows: DrawRow[]): DrawResult[] {
    if (drawRows.length === 0) return [];

    const db = getDb();
    const drawIds = drawRows.map(d => d.id);
    const placeholders = drawIds.map(() => '?').join(',');
    const prizeRows = db.prepare(
        `SELECT * FROM prizes WHERE draw_id IN (${placeholders}) ORDER BY draw_id, prize_code`
    ).all(...drawIds) as PrizeRow[];

    // Group prizes by draw_id
    const prizesByDraw = new Map<number, PrizeRow[]>();
    for (const p of prizeRows) {
        if (!prizesByDraw.has(p.draw_id)) {
            prizesByDraw.set(p.draw_id, []);
        }
        prizesByDraw.get(p.draw_id)!.push(p);
    }

    return drawRows.map(draw => ({
        ...draw,
        region: draw.region as Region,
        prizes: (prizesByDraw.get(draw.id) || []).map(p => ({
            ...p,
            numbers: JSON.parse(p.numbers),
        })),
    }));
}

export async function getResults(query: ResultsQuery): Promise<DrawResult[]> {
    const cacheKey = resultsCacheKey(query.date || '', query.region, query.province);
    const cached = getCache<DrawResult[]>(cacheKey);
    if (cached) return cached;

    const db = getDb();
    let sql = `
    SELECT d.*, p.name as province_name
    FROM draws d
    JOIN provinces p ON d.province_id = p.id
    WHERE 1=1
  `;
    const params: any[] = [];

    if (query.date) {
        sql += ' AND d.draw_date = ?';
        params.push(query.date);
    }
    if (query.region) {
        sql += ' AND d.region = ?';
        params.push(query.region);
    }
    if (query.province) {
        sql += ' AND d.province_id = ?';
        params.push(query.province);
    }

    sql += ' ORDER BY d.draw_date DESC, d.region, d.province_id';

    const drawRows = db.prepare(sql).all(...params) as DrawRow[];

    // Autocrawl if requesting a specific date + region but we have no results yet
    let results = buildDrawResults(drawRows);
    if (results.length === 0 && query.date) {
        // Try crawling
        const regionsToCrawl: Region[] = query.region ? [query.region as Region] : ['mb', 'mt', 'mn'];
        let newDrawsSaved = 0;

        try {
            const { crawl } = await import('../crawler/crawler');
            for (const r of regionsToCrawl) {
                newDrawsSaved += await crawl(query.date, r);
            }
        } catch (error) {
            console.error('[getResults] Auto-crawl failed:', error);
        }

        // Re-query if we saved anything
        if (newDrawsSaved > 0) {
            const reRow = db.prepare(sql).all(...params) as DrawRow[];
            results = buildDrawResults(reRow);
        }
    }

    // Cache: old dates get long TTL, today gets short TTL
    const today = new Date().toISOString().split('T')[0];
    const ttl = query.date && query.date < today ? OLD_RESULT_TTL : LATEST_RESULT_TTL;
    setCache(cacheKey, results, ttl);

    return results;
}

export function getLatestResults(query: LatestQuery): DrawResult[] {
    const cacheKey = latestCacheKey(query.region, query.province);
    const cached = getCache<DrawResult[]>(cacheKey);
    if (cached) return cached;

    const db = getDb();
    let sql = `
    SELECT d.*, p.name as province_name
    FROM draws d
    JOIN provinces p ON d.province_id = p.id
    WHERE 1=1
  `;
    const params: any[] = [];

    if (query.region) {
        sql += ' AND d.region = ?';
        params.push(query.region);
    }
    if (query.province) {
        sql += ' AND d.province_id = ?';
        params.push(query.province);
    }

    // Get latest date for each province
    sql += `
    AND d.draw_date = (
      SELECT MAX(d2.draw_date)
      FROM draws d2
      WHERE d2.province_id = d.province_id
    )
  `;

    sql += ' ORDER BY d.region, d.province_id';

    const drawRows = db.prepare(sql).all(...params) as DrawRow[];
    const results = buildDrawResults(drawRows);

    setCache(cacheKey, results, LATEST_RESULT_TTL);
    return results;
}

export function getProvinces(region?: string): Province[] {
    const cacheKey = provincesCacheKey(region);
    const cached = getCache<Province[]>(cacheKey);
    if (cached) return cached;

    const db = getDb();
    let sql = 'SELECT * FROM provinces WHERE active = 1';
    const params: any[] = [];

    if (region) {
        sql += ' AND region = ?';
        params.push(region);
    }

    sql += ' ORDER BY region, name';

    const rows = db.prepare(sql).all(...params) as any[];
    const provinces: Province[] = rows.map(r => ({
        ...r,
        draw_days: JSON.parse(r.draw_days),
        active: !!r.active,
    }));

    setCache(cacheKey, provinces, PROVINCE_TTL);
    return provinces;
}

export type SearchMode = 'contains' | 'starts' | 'ends';

export function searchByNumber(
    number: string,
    date?: string,
    region?: string,
    mode: SearchMode = 'contains',
    prizeCode?: string,
): DrawResult[] {
    const db = getDb();

    // Build LIKE pattern based on search mode
    let likePattern: string;
    switch (mode) {
        case 'starts':
            // Match numbers that start with the search term
            // numbers is stored as JSON array: ["12345","67890"]
            likePattern = `%"${number}%`;
            break;
        case 'ends':
            // Match numbers that end with the search term
            likePattern = `%${number}"%`;
            break;
        case 'contains':
        default:
            likePattern = `%${number}%`;
            break;
    }

    let sql = `
    SELECT DISTINCT d.*, p.name as province_name
    FROM draws d
    JOIN provinces p ON d.province_id = p.id
    JOIN prizes pr ON pr.draw_id = d.id
    WHERE pr.numbers LIKE ?
  `;
    const params: any[] = [likePattern];

    // Filter by specific prize tier (db, g1, g2, ...)
    if (prizeCode) {
        sql += ' AND pr.prize_code = ?';
        params.push(prizeCode);
    }

    if (date) {
        sql += ' AND d.draw_date = ?';
        params.push(date);
    }
    if (region) {
        sql += ' AND d.region = ?';
        params.push(region);
    }

    sql += ' ORDER BY d.draw_date DESC, d.region LIMIT 50';

    const drawRows = db.prepare(sql).all(...params) as DrawRow[];
    return buildDrawResults(drawRows);
}
