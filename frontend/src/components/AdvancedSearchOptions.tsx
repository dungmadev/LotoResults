export interface SearchFilters {
    searchType: 'contains' | 'startsWith' | 'endsWith';
    prizeFilter: string; // empty string means all prizes
    parityFilter: 'all' | 'even' | 'odd';
}

interface Props {
    filters: SearchFilters;
    onFiltersChange: (filters: SearchFilters) => void;
    isOpen: boolean;
    onToggle: () => void;
}

export default function AdvancedSearchOptions({ filters, onFiltersChange, isOpen, onToggle }: Props) {
    return (
        <div style={{ marginBottom: '16px' }}>
            <button
                onClick={onToggle}
                style={{
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}
            >
                <span>⚙️ Tùy chọn nâng cao</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                    {isOpen ? '▲' : '▼'}
                </span>
            </button>

            {isOpen && (
                <div
                    style={{
                        marginTop: '12px',
                        padding: '16px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                    }}
                    className="animate-fade-in"
                >
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {/* Search Type */}
                        <div>
                            <label className="filter-label">Kiểu tìm kiếm</label>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                                {[
                                    { value: 'contains', label: 'Chứa' },
                                    { value: 'startsWith', label: 'Bắt đầu' },
                                    { value: 'endsWith', label: 'Kết thúc' },
                                ].map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => onFiltersChange({ ...filters, searchType: option.value as SearchFilters['searchType'] })}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            border: '1px solid var(--border)',
                                            background: filters.searchType === option.value
                                                ? 'var(--accent-purple)'
                                                : 'transparent',
                                            color: filters.searchType === option.value
                                                ? 'white'
                                                : 'var(--text-primary)',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: filters.searchType === option.value ? 600 : 400,
                                        }}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Prize Filter */}
                        <div>
                            <label className="filter-label">Lọc theo giải</label>
                            <select
                                className="filter-select"
                                value={filters.prizeFilter}
                                onChange={(e) => onFiltersChange({ ...filters, prizeFilter: e.target.value })}
                                style={{ marginTop: '8px' }}
                            >
                                <option value="">Tất cả giải</option>
                                <option value="db">Giải Đặc Biệt</option>
                                <option value="g1">Giải Nhất</option>
                                <option value="g2">Giải Nhì</option>
                                <option value="g3">Giải Ba</option>
                                <option value="g4">Giải Tư</option>
                                <option value="g5">Giải Năm</option>
                                <option value="g6">Giải Sáu</option>
                                <option value="g7">Giải Bảy</option>
                                <option value="g8">Giải Tám</option>
                            </select>
                        </div>

                        {/* Parity Filter */}
                        <div>
                            <label className="filter-label">Chẵn / Lẻ</label>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                {[
                                    { value: 'all', label: 'Tất cả' },
                                    { value: 'even', label: 'Chẵn' },
                                    { value: 'odd', label: 'Lẻ' },
                                ].map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => onFiltersChange({ ...filters, parityFilter: option.value as SearchFilters['parityFilter'] })}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            border: '1px solid var(--border)',
                                            background: filters.parityFilter === option.value
                                                ? 'var(--accent-purple)'
                                                : 'transparent',
                                            color: filters.parityFilter === option.value
                                                ? 'white'
                                                : 'var(--text-primary)',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: filters.parityFilter === option.value ? 600 : 400,
                                        }}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
