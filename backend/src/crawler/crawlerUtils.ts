import { Region } from '../types';

// --- Types ---

export interface CrawledResult {
    draw_date: string;
    region: Region;
    province_id: string;
    prizes: { prize_code: string; numbers: string[] }[];
}

// --- Logging ---

export function logCrawl(level: 'INFO' | 'WARN' | 'ERROR', message: string, meta?: unknown): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [CRAWLER] [${level}] ${message}`;
    if (meta) {
        console.log(logEntry, JSON.stringify(meta));
    } else {
        console.log(logEntry);
    }
}

// --- Number Padding ---

/**
 * Pad a prize number to its expected digit length based on prize code and region.
 *
 * MB digit lengths: ĐB=5, G1=5, G2=5, G3=5, G4=4, G5=4, G6=3, G7=2
 * MT/MN digit lengths: ĐB=6, G1-G4=5, G5-G6=4, G7=3, G8=2
 */
export function padNumber(num: string, prizeCode: string, region: Region): string {
    if (region === 'mb') {
        switch (prizeCode) {
            case 'db': return num.padStart(5, '0');
            case 'g1': return num.padStart(5, '0');
            case 'g2': return num.padStart(5, '0');
            case 'g3': return num.padStart(5, '0');
            case 'g4': return num.padStart(4, '0');
            case 'g5': return num.padStart(4, '0');
            case 'g6': return num.padStart(3, '0');
            case 'g7': return num.padStart(2, '0');
            default: return num;
        }
    } else {
        // MT and MN have the same structure
        switch (prizeCode) {
            case 'db': return num.padStart(6, '0');
            case 'g1': return num.padStart(5, '0');
            case 'g2': return num.padStart(5, '0');
            case 'g3': return num.padStart(5, '0');
            case 'g4': return num.padStart(5, '0');
            case 'g5': return num.padStart(4, '0');
            case 'g6': return num.padStart(4, '0');
            case 'g7': return num.padStart(3, '0');
            case 'g8': return num.padStart(2, '0');
            default: return num;
        }
    }
}

// --- Validation ---

/**
 * Count total individual prize numbers across all prizes in a result.
 * Used to validate if a source returned "sufficient" data.
 */
export function countPrizeNumbers(results: CrawledResult[]): number {
    let total = 0;
    for (const result of results) {
        for (const prize of result.prizes) {
            total += prize.numbers.length;
        }
    }
    return total;
}

/**
 * Count prize numbers for a single province result.
 */
export function countProvincePrizeNumbers(result: CrawledResult): number {
    let total = 0;
    for (const prize of result.prizes) {
        total += prize.numbers.length;
    }
    return total;
}

// --- User-Agent Rotation ---

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
];

/**
 * Get a random User-Agent string to avoid detection.
 */
export function getRandomUserAgent(): string {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}
