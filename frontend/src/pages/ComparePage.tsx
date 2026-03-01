import { useQuery } from '@tanstack/react-query';
import { useState, useRef } from 'react';
import { fetchResults, fetchProvinces } from '../services/api';
import { REGION_NAMES } from '../types';
import type { Region, DrawResult } from '../types';
import ResultTable from '../components/ResultTable';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState, { EmptyState } from '../components/ErrorState';
import { formatDateDisplay } from '../utils/dateFormat';

const MAX_COMPARE = 4;

export default function ComparePage() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const dateRef = useRef<HTMLInputElement>(null);
    const [region, setRegion] = useState<string>('');
    const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);

    // Provinces query
    const { data: provinces } = useQuery({
        queryKey: ['provinces', region],
        queryFn: () => fetchProvinces(region || undefined),
        staleTime: 1000 * 60 * 60,
    });

    // Results query — fetch all results for the date + region
    const {
        data: rawData,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['results', date, region],
        queryFn: () => fetchResults({
            date: date || undefined,
            region: region || undefined,
        }),
        staleTime: 1000 * 60 * 2,
        // Auto-refetch every 3s while backend is crawling data
        refetchInterval: (query) => {
            const data = query.state.data;
            if (data && data.meta?.status === 'crawling') {
                return 3000;
            }
            return false;
        },
    });

    // Extract crawl status for showing loading state while data is being fetched
    const crawlStatus = rawData?.meta || { status: 'ready' as const };

    // Filter results to only selected provinces
    const filteredResults = rawData?.results?.filter(
        (r: DrawResult) => selectedProvinces.length === 0 || selectedProvinces.includes(r.province_id)
    ) || [];

    const handleToggleProvince = (provinceId: string) => {
        setSelectedProvinces(prev => {
            if (prev.includes(provinceId)) {
                return prev.filter(p => p !== provinceId);
            }
            if (prev.length >= MAX_COMPARE) return prev;
            return [...prev, provinceId];
        });
    };

    const handleDateChange = (newDate: string) => {
        setDate(newDate);
    };

    const handleRegionChange = (newRegion: string) => {
        setRegion(newRegion);
        setSelectedProvinces([]);
    };

    return (
        <div className="page-container">
            <div className="page-header animate-fade-in">
                <h1 className="page-title">⚖️ So Sánh Đài</h1>
                <p className="page-subtitle">Chọn ngày và tối đa {MAX_COMPARE} đài để so sánh kết quả</p>
            </div>

            {/* Filters */}
            <div className="filters-bar animate-fade-in stagger-1">
                <div className="filter-group">
                    <label className="filter-label">Ngày</label>
                    <div
                        className="date-picker-compact"
                        onClick={() => dateRef.current?.showPicker()}
                    >
                        <span className="date-display">📅 {formatDateDisplay(date)}</span>
                        <input
                            ref={dateRef}
                            type="date"
                            className="date-input-hidden"
                            value={date}
                            onChange={(e) => handleDateChange(e.target.value)}
                        />
                    </div>
                </div>

                <div className="filter-group">
                    <label className="filter-label">Miền</label>
                    <select
                        className="filter-select"
                        value={region}
                        onChange={(e) => handleRegionChange(e.target.value)}
                    >
                        <option value="">Tất cả miền</option>
                        {(Object.entries(REGION_NAMES) as [Region, string][]).map(([key, name]) => (
                            <option key={key} value={key}>{name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Province selection chips */}
            {provinces && provinces.length > 0 && (
                <div className="compare-chips animate-fade-in stagger-2">
                    <span className="filter-label" style={{ marginRight: '8px' }}>
                        Chọn đài ({selectedProvinces.length}/{MAX_COMPARE}):
                    </span>
                    <div className="chips-container">
                        {provinces.map(p => {
                            const isSelected = selectedProvinces.includes(p.id);
                            const isDisabled = !isSelected && selectedProvinces.length >= MAX_COMPARE;
                            return (
                                <button
                                    key={p.id}
                                    className={`chip ${isSelected ? 'chip-active' : ''} ${isDisabled ? 'chip-disabled' : ''}`}
                                    onClick={() => handleToggleProvince(p.id)}
                                    disabled={isDisabled}
                                >
                                    {p.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Crawl Status Banner */}
            {crawlStatus.status === 'crawling' && (
                <div className="crawl-status-banner animate-fade-in">
                    <div className="crawl-spinner" />
                    <span className="crawl-message">
                        {crawlStatus.message || 'Đang tải dữ liệu từ nguồn...'}
                    </span>
                </div>
            )}

            {/* Results comparison */}
            {isLoading ? (
                <div className="card">
                    <div className="card-body">
                        <LoadingSkeleton rows={8} />
                    </div>
                </div>
            ) : isError ? (
                <ErrorState
                    message={error instanceof Error ? error.message : 'Đã xảy ra lỗi'}
                />
            ) : filteredResults.length === 0 ? (
                crawlStatus.status === 'crawling' ? (
                    /* Data is being crawled — show loading instead of empty */
                    <div className="card">
                        <div className="card-body">
                            <LoadingSkeleton rows={8} />
                        </div>
                    </div>
                ) : (
                    <EmptyState message={`Không có kết quả cho ngày ${date}`} />
                )
            ) : (
                <div className="compare-grid">
                    {filteredResults.map((result: DrawResult, idx: number) => (
                        <div
                            key={result.id}
                            className="card animate-fade-in"
                            style={{ animationDelay: `${idx * 0.06}s` }}
                        >
                            <div className="card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span className={`region-badge ${result.region}`}>
                                        {REGION_NAMES[result.region]}
                                    </span>
                                    <span className="card-title">{result.province_name}</span>
                                </div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    📅 {formatDateDisplay(result.draw_date)}
                                </span>
                            </div>
                            <div className="card-body">
                                <ResultTable result={result} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
