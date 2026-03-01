import { useState, useEffect } from 'react';

// --- Types ---

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
    id: string;
    type: ToastType;
    message: string;
    duration?: number; // ms, default 5000
}

// --- Toast Item Component ---

function ToastItemComponent({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const duration = toast.duration || 5000;
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onDismiss(toast.id), 300); // Wait for exit animation
        }, duration);
        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onDismiss]);

    const icons: Record<ToastType, string> = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️',
    };

    return (
        <div
            className={`toast-item toast-${toast.type} ${isExiting ? 'toast-exit' : 'toast-enter'}`}
            role="alert"
            aria-live="polite"
        >
            <span className="toast-icon">{icons[toast.type]}</span>
            <span className="toast-message">{toast.message}</span>
            <button
                className="toast-close"
                onClick={() => {
                    setIsExiting(true);
                    setTimeout(() => onDismiss(toast.id), 300);
                }}
                aria-label="Đóng"
            >
                ×
            </button>
        </div>
    );
}

// --- Toast Container Component ---

export default function ToastContainer({ toasts, onDismiss }: {
    toasts: ToastItem[];
    onDismiss: (id: string) => void;
}) {
    if (toasts.length === 0) return null;

    return (
        <div className="toast-container" aria-label="Thông báo">
            {toasts.map(toast => (
                <ToastItemComponent key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
}

