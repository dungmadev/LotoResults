import { useState, useCallback, useRef } from 'react';
import type { ToastType, ToastItem } from '../components/Toast';

let toastIdCounter = 0;

export default function useToast() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const toastsRef = useRef(toasts);
    toastsRef.current = toasts;

    const addToast = useCallback((type: ToastType, message: string, duration?: number) => {
        const id = `toast-${++toastIdCounter}-${Date.now()}`;
        const newToast: ToastItem = { id, type, message, duration };
        setToasts(prev => [...prev.slice(-4), newToast]); // Keep max 5 toasts
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return { toasts, addToast, dismissToast };
}
