import { useState, useCallback, useRef, useEffect } from 'react';
import type { SSEEvent } from './useServerEvents';
import type { QueueProgressState } from './QueueProgressContext';
import { defaultQueueProgress } from './QueueProgressContext';

// --- Constants ---

/** Delay before hiding progress bar after reaching 100% */
const COMPLETE_HIDE_DELAY_MS = 1500;
/** Delay before hiding progress bar after error */
const ERROR_HIDE_DELAY_MS = 3000;

// --- Hook ---

/**
 * useQueueProgress — Manages queue progress state from SSE events.
 *
 * Features:
 * - Tracks batch progress (current/total) from CrawlQueue events
 * - Auto-shows on first event, auto-hides after completion (1.5s delay)
 * - Resets when a new batch starts (new batchId detected)
 * - Error state auto-hides after 3 seconds
 *
 * @returns Progress state + event handler to be called by SSEProvider
 */
export default function useQueueProgress(): QueueProgressState & {
    handleProgressEvent: (event: SSEEvent) => void;
} {
    const [state, setState] = useState<QueueProgressState>(defaultQueueProgress);
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (hideTimerRef.current) {
                clearTimeout(hideTimerRef.current);
            }
        };
    }, []);

    /**
     * Handle SSE events related to queue progress.
     * Called by SSEProvider for crawl-progress, data-ready, crawl-error events.
     */
    const handleProgressEvent = useCallback((event: SSEEvent) => {
        const progress = event.progress;
        if (!progress) return;

        // Clear any pending hide timer when new events arrive
        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
        }

        const { current, total, batchId } = progress;
        const percent = total > 0 ? Math.round((current / total) * 100) : 0;

        switch (event.type) {
            case 'crawl-progress': {
                setState(prev => {
                    // New batch detected → reset progress
                    if (batchId && batchId !== prev.batchId) {
                        return {
                            visible: true,
                            progress: percent,
                            status: 'processing',
                            message: event.message,
                            batchId,
                            sourceInfo: event.sourceInfo,
                        };
                    }
                    // Same batch → update progress
                    return {
                        ...prev,
                        visible: true,
                        progress: percent,
                        status: 'processing',
                        message: event.message,
                        sourceInfo: event.sourceInfo,
                    };
                });
                break;
            }

            case 'data-ready': {
                const newPercent = total > 0 ? Math.round((current / total) * 100) : 100;
                const isComplete = newPercent >= 100;

                setState(prev => ({
                    ...prev,
                    visible: true,
                    progress: newPercent,
                    status: isComplete ? 'complete' : 'processing',
                    message: isComplete ? 'Hoàn tất cập nhật dữ liệu!' : event.message,
                }));

                // Auto-hide after delay when batch is complete
                if (isComplete) {
                    hideTimerRef.current = setTimeout(() => {
                        setState(defaultQueueProgress);
                    }, COMPLETE_HIDE_DELAY_MS);
                }
                break;
            }

            case 'crawl-error': {
                setState(prev => ({
                    ...prev,
                    visible: true,
                    progress: percent,
                    status: 'error',
                    message: event.message,
                }));

                // Auto-hide error state after delay
                hideTimerRef.current = setTimeout(() => {
                    setState(prev => {
                        // Only hide if still in error state (no new events overrode it)
                        if (prev.status === 'error') {
                            return defaultQueueProgress;
                        }
                        return prev;
                    });
                }, ERROR_HIDE_DELAY_MS);
                break;
            }
        }
    }, []);

    return { ...state, handleProgressEvent };
}
