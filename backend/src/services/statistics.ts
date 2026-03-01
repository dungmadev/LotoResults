import { getDb } from '../db/database';
import { Region } from '../types';

export interface FrequencyItem {
    number: string;
    count: number;
    lastSeen?: string;
}

export interface FrequencyStats {
    last2Digits: FrequencyItem[];
    last3Digits: FrequencyItem[];
    totalDraws: number;
    dateRange: {
        start: string;
        end: string;
    };
}

export interface HotColdNumber {
    number: string;
    frequency: number;
    lastSeen: string;
    daysSinceLastSeen: number;
}

/**
 * Get frequency statistics for numbers
 */
export function getFrequencyStats(
    region?: Region,
    days: number = 30
): FrequencyStats {
    const db = getDb();
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    // Build query
    let sql = `
        SELECT p.numbers, d.draw_date
        FROM prizes p
        JOIN draws d ON p.draw_id = d.id
        WHERE d.draw_date >= ? AND d.draw_date <= ?
    `;
    const params: any[] = [startStr, endStr];
    
    if (region) {
        sql += ' AND d.region = ?';
        params.push(region);
    }
    
    interface PrizeRow {
        numbers: string;
        draw_date: string;
    }
    
    const rows = db.prepare(sql).all(...params) as PrizeRow[];
    
    // Count frequencies
    const last2Map = new Map<string, { count: number; lastSeen: string }>();
    const last3Map = new Map<string, { count: number; lastSeen: string }>();
    
    for (const row of rows) {
        const numbers: string[] = JSON.parse(row.numbers);
        for (const num of numbers) {
            // Last 2 digits
            const last2 = num.slice(-2);
            const existing2 = last2Map.get(last2) || { count: 0, lastSeen: '' };
            last2Map.set(last2, {
                count: existing2.count + 1,
                lastSeen: row.draw_date > existing2.lastSeen ? row.draw_date : existing2.lastSeen,
            });
            
            // Last 3 digits (if number has 3+ digits)
            if (num.length >= 3) {
                const last3 = num.slice(-3);
                const existing3 = last3Map.get(last3) || { count: 0, lastSeen: '' };
                last3Map.set(last3, {
                    count: existing3.count + 1,
                    lastSeen: row.draw_date > existing3.lastSeen ? row.draw_date : existing3.lastSeen,
                });
            }
        }
    }
    
    // Convert to sorted arrays
    const last2Digits = Array.from(last2Map.entries())
        .map(([number, data]) => ({
            number,
            count: data.count,
            lastSeen: data.lastSeen,
        }))
        .sort((a, b) => b.count - a.count);
    
    const last3Digits = Array.from(last3Map.entries())
        .map(([number, data]) => ({
            number,
            count: data.count,
            lastSeen: data.lastSeen,
        }))
        .sort((a, b) => b.count - a.count);
    
    // Count total draws
    const totalDrawsQuery = `
        SELECT COUNT(DISTINCT d.id) as total
        FROM draws d
        WHERE d.draw_date >= ? AND d.draw_date <= ?
        ${region ? 'AND d.region = ?' : ''}
    `;
    const totalDrawsParams = region ? [startStr, endStr, region] : [startStr, endStr];
    const totalDrawsRow = db.prepare(totalDrawsQuery).get(...totalDrawsParams) as { total: number };
    
    return {
        last2Digits,
        last3Digits,
        totalDraws: totalDrawsRow.total,
        dateRange: {
            start: startStr,
            end: endStr,
        },
    };
}

/**
 * Get hot and cold numbers
 */
export function getHotColdNumbers(
    region?: Region,
    days: number = 30,
    limit: number = 10
): { hot: HotColdNumber[]; cold: HotColdNumber[] } {
    const db = getDb();
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    // Build query
    let sql = `
        SELECT p.numbers, d.draw_date
        FROM prizes p
        JOIN draws d ON p.draw_id = d.id
        WHERE d.draw_date >= ? AND d.draw_date <= ?
    `;
    const params: any[] = [startStr, endStr];
    
    if (region) {
        sql += ' AND d.region = ?';
        params.push(region);
    }
    
    sql += ' ORDER BY d.draw_date DESC';
    
    interface PrizeRow {
        numbers: string;
        draw_date: string;
    }
    
    const rows = db.prepare(sql).all(...params) as PrizeRow[];
    
    // Track last 2 digits
    const numberMap = new Map<string, { count: number; lastSeen: string }>();
    
    for (const row of rows) {
        const numbers: string[] = JSON.parse(row.numbers);
        for (const num of numbers) {
            const last2 = num.slice(-2);
            const existing = numberMap.get(last2) || { count: 0, lastSeen: '' };
            numberMap.set(last2, {
                count: existing.count + 1,
                lastSeen: row.draw_date > existing.lastSeen ? row.draw_date : existing.lastSeen,
            });
        }
    }
    
    // Calculate days since last seen
    const today = new Date();
    const allNumbers = Array.from(numberMap.entries()).map(([number, data]) => {
        const lastSeenDate = new Date(data.lastSeen);
        const daysDiff = Math.floor((today.getTime() - lastSeenDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
            number,
            frequency: data.count,
            lastSeen: data.lastSeen,
            daysSinceLastSeen: daysDiff,
        };
    });
    
    // Hot numbers (high frequency, recently seen)
    const hot = allNumbers
        .sort((a, b) => {
            // Prioritize frequency first, then recency
            if (b.frequency !== a.frequency) {
                return b.frequency - a.frequency;
            }
            return a.daysSinceLastSeen - b.daysSinceLastSeen;
        })
        .slice(0, limit);
    
    // Cold numbers (low frequency or not seen recently)
    const cold = allNumbers
        .sort((a, b) => {
            // Prioritize not seen recently, then low frequency
            if (b.daysSinceLastSeen !== a.daysSinceLastSeen) {
                return b.daysSinceLastSeen - a.daysSinceLastSeen;
            }
            return a.frequency - b.frequency;
        })
        .slice(0, limit);
    
    return { hot, cold };
}

/**
 * Export frequency data as CSV string
 */
export function exportFrequencyCSV(stats: FrequencyStats): string {
    const lines = [
        'Số,Tần suất,Lần cuối xuất hiện',
        '',
        '=== 2 SỐ CUỐI ===',
        ...stats.last2Digits.slice(0, 50).map(item => 
            `${item.number},${item.count},${item.lastSeen}`
        ),
        '',
        '=== 3 SỐ CUỐI ===',
        ...stats.last3Digits.slice(0, 50).map(item => 
            `${item.number},${item.count},${item.lastSeen}`
        ),
        '',
        `Tổng số kỳ quay: ${stats.totalDraws}`,
        `Khoảng thời gian: ${stats.dateRange.start} - ${stats.dateRange.end}`,
    ];
    
    return lines.join('\n');
}
