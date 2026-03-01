// TypeScript types for Xổ Số application

export type Region = 'mb' | 'mt' | 'mn';

export interface Province {
    id: string;
    name: string;
    region: Region;
    draw_days: string[];
    draw_time?: string;
    active: boolean;
}

export interface Draw {
    id: number;
    draw_date: string; // YYYY-MM-DD
    region: Region;
    province_id: string;
    source: string;
    fetched_at: string; // ISO timestamp
    checksum: string;
}

export interface Prize {
    id: number;
    draw_id: number;
    prize_code: string; // 'db', 'g1', 'g2'...
    numbers: string[];
}

export interface DrawResult extends Draw {
    prizes: Prize[];
    province_name: string;
}

export interface ResultsQuery {
    date?: string;
    region?: Region;
    province?: string;
}

export interface LatestQuery {
    region?: Region;
    province?: string;
}

export interface ProvincesQuery {
    region?: Region;
}

// Prize codes for each region
export const PRIZE_CODES_MB = ['db', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7'] as const;
export const PRIZE_CODES_MT_MN = ['db', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8'] as const;

/**
 * Expected total number of individual prize numbers per province per region.
 * Used by Race & Fallback crawler to validate if a source returned "complete" data.
 *
 * MB (Miền Bắc) = 27 numbers:
 *   ĐB(1) + G1(1) + G2(2) + G3(6) + G4(4) + G5(6) + G6(3) + G7(4)
 *
 * MN (Miền Nam) = 18 numbers per province:
 *   G8(1) + G7(1) + G6(3) + G5(1) + G4(7) + G3(2) + G2(1) + G1(1) + ĐB(1)
 *
 * MT (Miền Trung) = 18 numbers per province:
 *   Same prize structure as MN
 */
export const EXPECTED_PRIZE_COUNT: Record<Region, number> = {
    mb: 27,
    mn: 18,
    mt: 18,
};

export const REGION_NAMES: Record<Region, string> = {
    mb: 'Miền Bắc',
    mt: 'Miền Trung',
    mn: 'Miền Nam',
};

// Crawler source config
export interface CrawlSource {
    name: string;
    baseUrl: string;
    priority: number; // lower = higher priority
}

// API response
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    meta?: {
        total?: number;
        source?: string;
        cached?: boolean;
        fetched_at?: string;
    };
}
