import { useQuery, useQueries } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchLatestResults, fetchProvinces } from '../services/api';
import { REGION_NAMES } from '../types';
import type { Region, DrawResult } from '../types';
import ResultTable from '../components/ResultTable';
import { CardSkeleton } from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import Countdown from '../components/Countdown';
import { useState } from 'react';

const REGIONS: Region[] = ['mb', 'mt', 'mn'];

export default function Dashboard() {
    const [quickSearch, setQuickSearch] = useState('');

    const { data: provinces } = useQuery({
        queryKey: ['provinces'],
        queryFn: () => fetchProvinces(),
        staleTime: 1000 * 60 * 60,
    });

    const latestQueries = useQueries({
        queries: REGIONS.map(region => ({
            queryKey: ['latest', region] as const,
            queryFn: () => fetchLatestResults({ region }),
            staleTime: 1000 * 60 * 2,
        })),
    });

    const today = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const totalDraws = latestQueries.reduce((sum, q) => sum + (q.data?.length || 0), 0);
    const totalProvinces = provinces?.length || 0;

    return (
        <div className="page-container">
            {/* Hero Section */}
            <section className="hero-section animate-fade-in">
                <div className="hero-content">
                    <h1 className="hero-title">Kết Quả Xổ Số Việt Nam</h1>
                    <p className="hero-subtitle">
                        Cập nhật nhanh chóng · {today}
                    </p>
                    <div className="hero-stats">
                        <div className="hero-stat">
                            <div className="hero-stat-value">3</div>
                            <div className="hero-stat-label">Miền</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-value">{totalProvinces}</div>
                            <div className="hero-stat-label">Đài / Tỉnh</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-value">{totalDraws}</div>
                            <div className="hero-stat-label">Kỳ quay hôm nay</div>
                        </div>
                    </div>
                </div>
            </section>

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
                                                        {result.draw_date}
                                                    </span>
                                                </div>
                                                <ResultTable result={result} searchNumber={quickSearch} />
                                            </div>
                                        ))}
                                        {results.length > 2 && (
                                            <Link
                                                to={`/search?region=${region}`}
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

            {/* Footer */}
            <footer className="footer">
                <p>
                    ⚡ Dữ liệu xổ số được cập nhật tự động · Nguồn: seed-data (demo)
                </p>
                <p style={{ marginTop: '4px' }}>
                    © 2026 XỔ SỐ LIVE — Tra cứu kết quả xổ số Việt Nam
                </p>
            </footer>
        </div>
    );
}
