export type Region = 'mb' | 'mt' | 'mn';

export interface Province {
    id: string;
    name: string;
    region: Region;
    draw_days: string[];
    draw_time?: string;
    active: boolean;
}

export interface Prize {
    id: number;
    draw_id: number;
    prize_code: string;
    numbers: string[];
}

export interface DrawResult {
    id: number;
    draw_date: string;
    region: Region;
    province_id: string;
    province_name: string;
    source: string;
    fetched_at: string;
    checksum: string;
    prizes: Prize[];
}

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

export const REGION_NAMES: Record<Region, string> = {
    mb: 'Miền Bắc',
    mt: 'Miền Trung',
    mn: 'Miền Nam',
};

export const REGION_COLORS: Record<Region, string> = {
    mb: '#e74c3c',
    mt: '#3498db',
    mn: '#2ecc71',
};

// Prize display names
export const PRIZE_NAMES: Record<string, string> = {
    db: 'Giải ĐB',
    g1: 'Giải Nhất',
    g2: 'Giải Nhì',
    g3: 'Giải Ba',
    g4: 'Giải Tư',
    g5: 'Giải Năm',
    g6: 'Giải Sáu',
    g7: 'Giải Bảy',
    g8: 'Giải Tám',
};

// Prize order for display (MB: top to bottom)
export const PRIZE_ORDER_MB = ['db', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7'];
export const PRIZE_ORDER_MT_MN = ['g8', 'g7', 'g6', 'g5', 'g4', 'g3', 'g2', 'g1', 'db'];
