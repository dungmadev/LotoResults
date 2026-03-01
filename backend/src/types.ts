// TypeScript types for Xổ Số application

export type Region = 'mb' | 'mt' | 'mn';

export interface Province {
    id: string;
    name: string;
    region: Region;
    draw_days: string[];
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
