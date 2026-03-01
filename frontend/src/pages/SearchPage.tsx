import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { fetchResults, fetchProvinces } from '../services/api';
import { REGION_NAMES } from '../types';
import type { Region, DrawResult } from '../types';
import ResultTable from '../components/ResultTable';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState, { EmptyState } from '../components/ErrorState';
import AdvancedSearchOptions, { type SearchFilters } from '../components/AdvancedSearchOptions';

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const [date, setDate] = useState(searchParams.get('date') || new Date().toISOString().split('T')[0]);
    const [region, setRegion] = useState<string>(searchParams.get('region') || '');
    const [province, setProvince] = useState<string>(searchParams.get('province') || '');
    const [searchNumber, setSearchNumber] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({
        searchType: 'contains',
        prizeFilter: '',
        parityFilter: 'all',
    });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchNumber), 300);
        return () => clearTimeout(timer);
    }, [searchNumber]);

    // Provinces query
    const { data: provinces } = useQuery({
        queryKey: ['provinces', region],
        queryFn: () => fetchProvinces(region || undefined),
        staleTime: 1000 * 60 * 60,
    });

    // Results query
    const {
        data: rawResults,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ['results', date, region, province],
        queryFn: () => fetchResults({
            date: date || undefined,
            region: region || undefined,
            province: province || undefined,
        }),
        staleTime: 1000 * 60 * 2,
    });

    // Apply advanced search filters
    const results = useMemo(() => {
        if (!rawResults) return [];
        if (!debouncedSearch && !searchFilters.prizeFilter && searchFilters.parityFilter === 'all') {
            return rawResults;
        }

        return rawResults.filter((result: DrawResult) => {
            // Filter prizes within each result
            const matchingPrizes = result.prizes.filter(prize => {
                // Prize code filter
                if (searchFilters.prizeFilter && prize.prize_code !== searchFilters.prizeFilter) {
                    return false;
                }

                // Number search filter
                if (debouncedSearch) {
                    const hasMatch = prize.numbers.some(num => {
                        switch (searchFilters.searchType) {
                            case 'startsWith': return num.startsWith(debouncedSearch);
                            case 'endsWith': return num.endsWith(debouncedSearch);
                            case 'contains':
                            default: return num.includes(debouncedSearch);
                        }
                    });
                    if (!hasMatch) return false;
                }

                // Parity filter (check last digit of each number)
                if (searchFilters.parityFilter !== 'all') {
                    const hasMatch = prize.numbers.some(num => {
                        const lastDigit = parseInt(num.slice(-1));
                        return searchFilters.parityFilter === 'even' ? lastDigit % 2 === 0 : lastDigit % 2 !== 0;
                    });
                    if (!hasMatch) return false;
                }

                return true;
            });

            return matchingPrizes.length > 0;
        });
    }, [rawResults, debouncedSearch, searchFilters]);

    // Sync URL params from event handlers
    const syncParams = (overrides: { date?: string; region?: string; province?: string } = {}) => {
        const params = new URLSearchParams();
        const d = overrides.date ?? date;
        const r = overrides.region ?? region;
        const p = overrides.province ?? province;
        if (d) params.set('date', d);
        if (r) params.set('region', r);
        if (p) params.set('province', p);
        setSearchParams(params, { replace: true });
    };

    const handleDateChange = (newDate: string) => {
        setDate(newDate);
        syncParams({ date: newDate });
    };

    const handleRegionChange = (newRegion: string) => {
        setRegion(newRegion);
        setProvince('');
        syncParams({ region: newRegion, province: '' });
    };

    const handleProvinceChange = (newProvince: string) => {
        setProvince(newProvince);
        syncParams({ province: newProvince });
    };

    return (
        <div className="page-container">
            <div className="page-header animate-fade-in">
                <h1 className="page-title">🔍 Tra Cứu Kết Quả</h1>
                <p className="page-subtitle">Chọn ngày, miền, đài để xem kết quả xổ số</p>
            </div>

            {/* Filters */}
            <div className="filters-bar animate-fade-in stagger-1">
                <div className="filter-group">
                    <label className="filter-label">Ngày</label>
                    <input
                        type="date"
                        className="filter-input"
                        value={date}
                        onChange={(e) => handleDateChange(e.target.value)}
                    />
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

                <div className="filter-group">
                    <label className="filter-label">Đài / Tỉnh</label>
                    <select
                        className="filter-select"
                        value={province}
                        onChange={(e) => handleProvinceChange(e.target.value)}
                    >
                        <option value="">Tất cả đài</option>
                        {provinces?.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label className="filter-label">Tìm số</label>
                    <input
                        type="text"
                        className="filter-input"
                        placeholder="VD: 123"
                        value={searchNumber}
                        onChange={(e) => setSearchNumber(e.target.value.replace(/\D/g, ''))}
                        maxLength={6}
                        style={{ fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}
                    />
                </div>

                <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
                    <button className="btn btn-primary" onClick={() => refetch()}>
                        🔄 Làm mới
                    </button>
                </div>
            </div>

            {/* Advanced Search Options */}
            {searchNumber && (
                <AdvancedSearchOptions
                    filters={searchFilters}
                    onFiltersChange={setSearchFilters}
                    isOpen={advancedOpen}
                    onToggle={() => setAdvancedOpen(!advancedOpen)}
                />
            )}

            {/* Results */}
            {isLoading ? (
                <div className="card">
                    <div className="card-body">
                        <LoadingSkeleton rows={8} />
                    </div>
                </div>
            ) : isError ? (
                <ErrorState
                    message={error instanceof Error ? error.message : 'Đã xảy ra lỗi'}
                    onRetry={() => refetch()}
                />
            ) : !results || results.length === 0 ? (
                <EmptyState message={`Không có kết quả xổ số cho ngày ${date}${region ? ` - ${REGION_NAMES[region as Region]}` : ''}`} />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {results.map((result: DrawResult, idx: number) => (
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
                                    📅 {result.draw_date}
                                </span>
                            </div>
                            <div className="card-body">
                                <ResultTable result={result} searchNumber={debouncedSearch} />
                                <div style={{
                                    marginTop: '12px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: '0.75rem',
                                    color: 'var(--text-muted)',
                                }}>
                                    <span>Nguồn: {result.source}</span>
                                    <span>Cập nhật: {new Date(result.fetched_at).toLocaleString('vi-VN')}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
