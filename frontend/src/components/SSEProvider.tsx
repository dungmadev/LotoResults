import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useServerEvents from '../hooks/useServerEvents';
import type { SSEEvent } from '../hooks/useServerEvents';
import useToast from '../hooks/useToast';
import useQueueProgressHook from '../hooks/useQueueProgress';
import { QueueProgressContext } from '../hooks/QueueProgressContext';
import ToastContainer from './Toast';

/**
 * SSEProvider — integrates Server-Sent Events with Toast notifications + Progress Bar.
 *
 * Responsibilities:
 * 1. Listens to backend SSE events via useServerEvents hook
 * 2. Routes crawl-progress events to progress bar (instead of individual toasts)
 * 3. Shows toast only for final batch completion and errors
 * 4. Auto-invalidates React Query cache on data-ready
 * 5. Provides QueueProgressContext for child components (ProcessIndicator)
 */
export default function SSEProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const { toasts, addToast, dismissToast } = useToast();
    const {
        visible, progress, status, message, batchId,
        handleProgressEvent,
    } = useQueueProgressHook();

    const handleSSEEvent = useCallback((event: SSEEvent) => {
        switch (event.type) {
            case 'connected':
                // Silently connected, no toast needed
                console.log('[SSE] Connected:', event.message);
                break;

            case 'data-ready':
                // Update progress bar state
                handleProgressEvent(event);

                // Invalidate relevant queries to trigger auto-refresh
                queryClient.invalidateQueries({ queryKey: ['results'] });
                queryClient.invalidateQueries({ queryKey: ['latest'] });
                queryClient.invalidateQueries({ queryKey: ['search'] });

                // Show toast only when the entire batch is complete (100%)
                if (event.progress && event.progress.current >= event.progress.total) {
                    addToast('success', 'Đã cập nhật xong tất cả dữ liệu!', 4000);
                }
                break;

            case 'crawl-error':
                // Update progress bar with error state
                handleProgressEvent(event);
                // Also show a toast for errors (important for user attention)
                addToast('error', event.message, 6000);
                break;

            case 'crawl-progress':
                // Route to progress bar instead of spawning individual toasts
                handleProgressEvent(event);
                break;
        }
    }, [addToast, queryClient, handleProgressEvent]);

    useServerEvents(handleSSEEvent);

    // Provide progress state via context for ProcessIndicator
    const progressState = { visible, progress, status, message, batchId };

    return (
        <QueueProgressContext.Provider value={progressState}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </QueueProgressContext.Provider>
    );
}
