import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchResults } from '../services/api';
import { REGION_NAMES } from '../types';
import type { Region } from '../types';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState, { EmptyState } from '../components/ErrorState';

type TimeRange = 7 | 30 | 90;

function getDateRange(days: number): { start: string; end: string } {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
    };
}

function getDatesInRange(days: number): string[] {
    const dates: string[] = [];
    for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
}

export default function HistoryPage() {
    const [timeRange, setTimeRange] = useState<TimeRange>(7);
    const [regionFilter, setRegionFilter] = useState<string>('');
    const navigate = useNavigate();

    const dates = getDatesInRange(timeRange);

    const { data: results, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['history', timeRange, regionFilter],
        queryFn: async () => {
            // Fetch all results without date filter, we'll group by date client-side
            const allResults = [];
            for (const date of dates.slice(0, 7)) { // Limit to 7 dates for performance
                try {
                    const res = await fetchResults({
                        date,
                        region: regionFilter || undefined,
                    });
                    allResults.push(...res);
                } catch {
                    // Skip failed dates
                }
            }
            return allResults;
        },
        staleTime: 1000 * 60 * 5,
    });

    // Group results by date
    const groupedByDate = (results || []).reduce((acc, result) => {
        if (!acc[result.draw_date]) {
            acc[result.draw_date] = [];
        }
        acc[result.draw_date].push(result);
        return acc;
    }, {} as Record<string, typeof results>);

    const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

    return (
        <div className="page-container">
            <div className="page-header animate-fade-in">
                <h1 className="page-title">📅 Lịch Sử Kết Quả</h1>
                <p className="page-subtitle">Xem lại kết quả xổ số các ngày trước</p>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div className="tabs animate-fade-in stagger-1">
                    {([7, 30, 90] as TimeRange[]).map(range => (
                        <button
                            key={range}
                            className={`tab ${timeRange === range ? 'active' : ''}`}
                            onClick={() => setTimeRange(range)}
                        >
                            {range} ngày
                        </button>
                    ))}
                </div>

                <select
                    className="filter-select animate-fade-in stagger-2"
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                    style={{ minWidth: '140px' }}
                >
                    <option value="">Tất cả miền</option>
                    {(Object.entries(REGION_NAMES) as [Region, string][]).map(([key, name]) => (
                        <option key={key} value={key}>{name}</option>
                    ))}
                </select>
            </div>

            {/* History List */}
            {isLoading ? (
                <div className="card">
                    <div className="card-body">
                        <LoadingSkeleton rows={10} />
                    </div>
                </div>
            ) : isError ? (
                <ErrorState
                    message={(error as Error)?.message}
                    onRetry={() => refetch()}
                />
            ) : sortedDates.length === 0 ? (
                <EmptyState message="Không có dữ liệu lịch sử trong khoảng thời gian đã chọn." />
            ) : (
                <div className="history-list">
                    {sortedDates.map((date, idx) => {
                        const dateResults = groupedByDate[date] || [];
                        const dateObj = new Date(date + 'T00:00:00');
                        const dayName = dateObj.toLocaleDateString('vi-VN', { weekday: 'long' });
                        const displayDate = dateObj.toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                        });

                        // Group by region
                        const regionGroups = dateResults.reduce((acc: Record<string, number>, r: any) => {
                            acc[r.region] = (acc[r.region] || 0) + 1;
                            return acc;
                        }, {});

                        return (
                            <div
                                key={date}
                                className="history-item animate-fade-in"
                                style={{ animationDelay: `${idx * 0.05}s` }}
                                onClick={() => navigate(`/search?date=${date}`)}
                            >
                                <div className="history-item-left">
                                    <div>
                                        <div className="history-date">{displayDate}</div>
                                        <div className="history-province" style={{ textTransform: 'capitalize' }}>
                                            {dayName}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {Object.entries(regionGroups).map(([r, count]) => (
                                        <span key={r} className={`region-badge ${r}`}>
                                            {REGION_NAMES[r as Region]}: {count as number}
                                        </span>
                                    ))}
                                    <span style={{
                                        color: 'var(--text-muted)',
                                        fontSize: '1.2rem',
                                        marginLeft: '8px'
                                    }}>
                                        →
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
