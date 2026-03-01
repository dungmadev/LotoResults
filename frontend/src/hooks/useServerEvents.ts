import { useEffect, useRef } from 'react';

// --- Types ---

export interface SSEEvent {
    type: 'data-ready' | 'crawl-error' | 'crawl-progress' | 'connected';
    message: string;
    job?: {
        id: string;
        date: string;
        region: string;
        status: string;
    };
    savedCount?: number;
    timestamp?: string;
    progress?: {
        current: number;
        total: number;
        batchId: string;
    };
    sourceInfo?: {
        activeSources: string[];
        winnerSource?: string;
    };
}

type SSEEventHandler = (event: SSEEvent) => void;

// --- Constants ---

const SSE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/events`;
const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;

// --- Hook ---

export default function useServerEvents(onEvent: SSEEventHandler): void {
    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const onEventRef = useRef(onEvent);

    useEffect(() => {
        // Keep handler ref up-to-date
        onEventRef.current = onEvent;

        // Connect function defined inside useEffect to avoid lint issues
        function connect() {
            // Don't reconnect if we've exceeded max attempts
            if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
                console.warn('[SSE] Max reconnect attempts reached. Giving up.');
                return;
            }

            // Clean up existing connection
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }

            console.log('[SSE] Connecting to', SSE_URL);
            const es = new EventSource(SSE_URL);
            eventSourceRef.current = es;

            es.onopen = () => {
                console.log('[SSE] Connected');
                reconnectAttemptsRef.current = 0; // Reset on successful connection
            };

            // Listen to specific event types
            const eventTypes = ['connected', 'data-ready', 'crawl-error', 'crawl-progress'];

            for (const type of eventTypes) {
                es.addEventListener(type, (e: MessageEvent) => {
                    try {
                        const data = JSON.parse(e.data);
                        onEventRef.current({
                            type: type as SSEEvent['type'],
                            ...data,
                        });
                    } catch (err) {
                        console.error(`[SSE] Failed to parse ${type} event:`, err);
                    }
                });
            }

            es.onerror = () => {
                console.warn('[SSE] Connection lost. Reconnecting...');
                es.close();

                // Reconnect with delay
                reconnectAttemptsRef.current++;
                const delay = RECONNECT_DELAY_MS * Math.min(reconnectAttemptsRef.current, 5);

                reconnectTimerRef.current = setTimeout(() => {
                    connect();
                }, delay);
            };
        }

        connect();

        return () => {
            // Cleanup on unmount
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
            }
        };
    }, [onEvent]);
}
