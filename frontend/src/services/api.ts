import axios from 'axios';
import type { ApiResponse } from '../types';
import type { DrawResult, Province } from '../types';

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

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
});

export async function fetchResults(params: {
    date?: string;
    region?: string;
    province?: string;
}): Promise<DrawResult[]> {
    const { data } = await api.get<ApiResponse<DrawResult[]>>('/results', { params });
    if (!data.success) throw new Error(data.error || 'Lỗi không xác định');
    return data.data || [];
}

export async function fetchLatestResults(params: {
    region?: string;
    province?: string;
}): Promise<DrawResult[]> {
    const { data } = await api.get<ApiResponse<DrawResult[]>>('/results/latest', { params });
    if (!data.success) throw new Error(data.error || 'Lỗi không xác định');
    return data.data || [];
}

export async function fetchProvinces(region?: string): Promise<Province[]> {
    const params = region ? { region } : {};
    const { data } = await api.get<ApiResponse<Province[]>>('/provinces', { params });
    if (!data.success) throw new Error(data.error || 'Lỗi không xác định');
    return data.data || [];
}

export async function searchByNumber(params: {
    number: string;
    date?: string;
    region?: string;
    mode?: 'contains' | 'starts' | 'ends';
    prize_code?: string;
}): Promise<DrawResult[]> {
    const { data } = await api.get<ApiResponse<DrawResult[]>>('/search', { params });
    if (!data.success) throw new Error(data.error || 'Lỗi không xác định');
    return data.data || [];
}

export async function fetchFrequencyStats(params: {
    region?: string;
    days?: number;
}): Promise<FrequencyStats> {
    const { data } = await api.get<ApiResponse<FrequencyStats>>('/stats/frequency', { params });
    if (!data.success) throw new Error(data.error || 'Lỗi không xác định');
    return data.data!;
}

export async function fetchHotColdNumbers(params: {
    region?: string;
    days?: number;
    limit?: number;
}): Promise<{ hot: HotColdNumber[]; cold: HotColdNumber[] }> {
    const { data } = await api.get<ApiResponse<{ hot: HotColdNumber[]; cold: HotColdNumber[] }>>('/stats/hot-cold', { params });
    if (!data.success) throw new Error(data.error || 'Lỗi không xác định');
    return data.data!;
}

export function getExportURL(region?: string, days?: number): string {
    const params = new URLSearchParams();
    if (region) params.set('region', region);
    if (days) params.set('days', days.toString());
    return `${API_BASE}/stats/frequency/export?${params.toString()}`;
}

