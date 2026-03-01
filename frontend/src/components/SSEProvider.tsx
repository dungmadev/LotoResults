import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useServerEvents from '../hooks/useServerEvents';
import type { SSEEvent } from '../hooks/useServerEvents';
import useToast from '../hooks/useToast';
import ToastContainer from './Toast';

/**
 * SSEProvider — integrates Server-Sent Events with Toast notifications.
 * Listens to backend SSE events and:
 * 1. Shows toast notifications for data-ready / crawl-error events
 * 2. Auto-invalidates React Query cache on data-ready to refresh UI
 */
export default function SSEProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const { toasts, addToast, dismissToast } = useToast();

    const handleSSEEvent = useCallback((event: SSEEvent) => {
        switch (event.type) {
            case 'connected':
                // Silently connected, no toast needed
                console.log('[SSE] Connected:', event.message);
                break;

            case 'data-ready':
                addToast('success', event.message, 4000);
                // Invalidate relevant queries to trigger auto-refresh
                queryClient.invalidateQueries({ queryKey: ['results'] });
                queryClient.invalidateQueries({ queryKey: ['latest'] });
                queryClient.invalidateQueries({ queryKey: ['search'] });
                break;

            case 'crawl-error':
                addToast('error', event.message, 6000);
                break;

            case 'crawl-progress':
                // Only show progress toast for initial loading
                addToast('info', event.message, 3000);
                break;
        }
    }, [addToast, queryClient]);

    useServerEvents(handleSSEEvent);

    return (
        <>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </>
    );
}
