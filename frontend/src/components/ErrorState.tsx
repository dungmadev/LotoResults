interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
    return (
        <div className="error-state animate-fade-in">
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">Đã xảy ra lỗi</h3>
            <p className="error-message">
                {message || 'Không thể tải dữ liệu. Vui lòng kiểm tra kết nối và thử lại.'}
            </p>
            {onRetry && (
                <button className="btn btn-primary" onClick={onRetry}>
                    🔄 Thử lại
                </button>
            )}
        </div>
    );
}

export function EmptyState({ message }: { message?: string }) {
    return (
        <div className="empty-state animate-fade-in">
            <div className="empty-icon">📭</div>
            <h3 className="empty-title">Không có dữ liệu</h3>
            <p className="empty-message">
                {message || 'Không tìm thấy kết quả xổ số cho bộ lọc đã chọn.'}
            </p>
        </div>
    );
}
