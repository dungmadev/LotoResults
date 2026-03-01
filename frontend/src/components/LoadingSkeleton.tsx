export default function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div style={{ padding: '8px 0' }}>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="skeleton-table-row" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="skeleton skeleton-table-cell" style={{ maxWidth: '80px' }} />
                    <div className="skeleton skeleton-table-cell" style={{ flex: 3 }} />
                </div>
            ))}
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="card animate-fade-in">
            <div className="card-header">
                <div className="skeleton skeleton-line short" />
            </div>
            <div className="card-body">
                <LoadingSkeleton rows={4} />
            </div>
        </div>
    );
}
