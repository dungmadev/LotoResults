import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchLatestResults, fetchResults, refreshData } from '../services/api';
import type { FetchResultsResponse } from '../services/api';
import { REGION_NAMES } from '../types';
import type { Region, DrawResult } from '../types';
import ResultTable from '../components/ResultTable';
import { CardSkeleton } from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import ScheduleWidget from '../components/ScheduleWidget';
import { useDrawSchedule } from '../hooks/useDrawSchedule';
import Countdown from '../components/Countdown';
import { formatDateDisplay } from '../utils/dateFormat';
import { useState, useCallback, useRef } from 'react';

const REGIONS: Region[] = ['mb', 'mt', 'mn'];

export default function Dashboard() {
    const [quickSearch, setQuickSearch] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const dateInputRef = useRef<HTMLInputElement>(null);
    const { isLive, liveRegions } = useDrawSchedule();
    const queryClient = useQueryClient();

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const targetDate = selectedDate || new Date().toISOString().split('T')[0];
            await refreshData({ date: targetDate });
            await queryClient.invalidateQueries({ queryKey: ['results'] });
            await queryClient.invalidateQueries({ queryKey: ['latest'] });
        } catch (err) {
            console.error('Refresh failed:', err);
        } finally {
            setIsRefreshing(false);
        }
    }, [selectedDate, queryClient]);

    // When a date is selected, fetch results for that date; otherwise fetch latest
    const dateQuery = useQuery<FetchResultsResponse>({
        queryKey: ['results', selectedDate],
        queryFn: () => fetchResults({ date: selectedDate }),
        staleTime: 1000 * 60 * 2,
        enabled: !!selectedDate,
        refetchInterval: (query) => {
            const data = query.state.data;
            if (data && data.meta?.status === 'crawling') return 3000;
            return false;
        },
    });

    const latestQueries = useQueries({
        queries: REGIONS.map(region => ({
            queryKey: ['latest', region] as const,
            queryFn: () => fetchLatestResults({ region }),
            staleTime: 1000 * 60 * 2,
            enabled: !selectedDate, // Only fetch latest when no date is selected
            // Auto-refresh every 15s during live draw for active regions
            refetchInterval: (!selectedDate && isLive && liveRegions.includes(region)) ? 15000 : false as const,
        })),
    });

    return (
        <div className="page-container">
            {/* Compact Header */}
            <div className="dashboard-header animate-fade-in">
                <h1 className="dashboard-title">🎯 Xổ Số Việt Nam</h1>
                <div className="dashboard-controls">
                    <div
                        className="date-picker-compact"
                        onClick={() => dateInputRef.current?.showPicker()}
                    >
                        <span className="date-display">📅 {formatDateDisplay(selectedDate)}</span>
                        <input
                            ref={dateInputRef}
                            type="date"
                            className="date-input-hidden"
                            value={selectedDate || new Date().toISOString().split('T')[0]}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                    {selectedDate && (
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={() => setSelectedDate('')}
                        >
                            Hôm nay
                        </button>
                    )}
                    <button
                        className="btn btn-sm btn-secondary"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        title="Xóa dữ liệu cũ và tải lại từ nguồn"
                    >
                        {isRefreshing ? '⏳' : '🔃'} Tải lại
                    </button>
                </div>
            </div>

            {/* Schedule & Countdown */}
            <ScheduleWidget />

            {/* Quick Search */}
            <Countdown />

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                <div className="search-box animate-fade-in stagger-1">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm nhanh theo số..."
                        value={quickSearch}
                        onChange={(e) => setQuickSearch(e.target.value.replace(/\D/g, ''))}
                        maxLength={6}
                    />
                </div>
            </div>

            {/* Region Cards */}
            {selectedDate ? (
                /* Date-specific view: show all results for that date */
                <div className="region-cards">
                    {REGIONS.map((region, rIdx) => {
                        const results = (dateQuery.data?.results || []).filter(r => r.region === region);
                        const isCrawling = dateQuery.data?.meta?.status === 'crawling';

                        return (
                            <div key={region} className={`region-card ${region} animate-fade-in stagger-${rIdx + 1}`}>
                                <div className="region-card-header">
                                    <h2 className="region-card-title">{REGION_NAMES[region]}</h2>
                                    <span className={`region-badge ${region}`}>
                                        {region.toUpperCase()}
                                    </span>
                                </div>
                                <div className="region-card-body">
                                    {dateQuery.isLoading || (isCrawling && results.length === 0) ? (
                                        <CardSkeleton />
                                    ) : results.length === 0 ? (
                                        <div className="empty-state">
                                            <p className="empty-message">Chưa có kết quả</p>
                                        </div>
                                    ) : (
                                        <>
                                            {results.slice(0, 2).map((result: DrawResult) => (
                                                <div key={result.id} style={{ marginBottom: '16px' }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: '8px'
                                                    }}>
                                                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                                                            {result.province_name}
                                                        </span>
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                            {formatDateDisplay(result.draw_date)}
                                                        </span>
                                                    </div>
                                                    <ResultTable result={result} searchNumber={quickSearch} />
                                                </div>
                                            ))}
                                            {results.length > 2 && (
                                                <Link
                                                    to={`/search?date=${selectedDate}&region=${region}`}
                                                    style={{
                                                        display: 'block',
                                                        textAlign: 'center',
                                                        padding: '10px',
                                                        color: 'var(--accent-purple)',
                                                        fontWeight: 600,
                                                        fontSize: '0.85rem',
                                                    }}
                                                >
                                                    Xem thêm {results.length - 2} đài khác →
                                                </Link>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Default view: latest results per region */
                <div className="region-cards">
                    {REGIONS.map((region, rIdx) => {
                        const query = latestQueries[rIdx];
                        const results = query.data || [];

                        return (
                            <div key={region} className={`region-card ${region} animate-fade-in stagger-${rIdx + 1}`}>
                                <div className="region-card-header">
                                    <h2 className="region-card-title">{REGION_NAMES[region]}</h2>
                                    <span className={`region-badge ${region}`}>
                                        {region.toUpperCase()}
                                    </span>
                                    {isLive && liveRegions.includes(region) && (
                                        <span className="live-indicator" style={{ marginLeft: '8px' }}>
                                            <span className="live-dot" />
                                            LIVE
                                        </span>
                                    )}
                                </div>
                                <div className="region-card-body">
                                    {query.isLoading ? (
                                        <CardSkeleton />
                                    ) : query.isError ? (
                                        <ErrorState
                                            message="Không thể tải kết quả"
                                            onRetry={() => query.refetch()}
                                        />
                                    ) : results.length === 0 ? (
                                        <div className="empty-state">
                                            <p className="empty-message">Chưa có kết quả hôm nay</p>
                                        </div>
                                    ) : (
                                        <>
                                            {results.slice(0, 2).map((result: DrawResult) => (
                                                <div key={result.id} style={{ marginBottom: '16px' }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: '8px'
                                                    }}>
                                                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                                                            {result.province_name}
                                                        </span>
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                            {formatDateDisplay(result.draw_date)}
                                                        </span>
                                                    </div>
                                                    <ResultTable result={result} searchNumber={quickSearch} />
                                                </div>
                                            ))}
                                            {results.length > 2 && (
                                                <Link
                                                    to={`/results?region=${region}`}
                                                    style={{
                                                        display: 'block',
                                                        textAlign: 'center',
                                                        padding: '10px',
                                                        color: 'var(--accent-purple)',
                                                        fontWeight: 600,
                                                        fontSize: '0.85rem',
                                                    }}
                                                >
                                                    Xem thêm {results.length - 2} đài khác →
                                                </Link>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Footer */}
            <footer className="footer">
                <p>
                    ⚡ Dữ liệu xổ số được cập nhật tự động từ nguồn trực tuyến
                </p>
                <p style={{ marginTop: '4px' }}>
                    © 2026 XỔ SỐ LIVE — Tra cứu kết quả xổ số Việt Nam
                </p>
            </footer>
        </div>
    );
}
