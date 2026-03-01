import axios from 'axios';
import type { ApiResponse } from '../types';
import type { DrawResult, Province } from '../types';

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
