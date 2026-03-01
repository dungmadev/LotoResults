import { createContext } from 'react';

// --- Types ---

export interface QueueProgressState {
    /** Whether the progress bar should be displayed */
    visible: boolean;
    /** Progress percentage: 0-100 */
    progress: number;
    /** Current processing status */
    status: 'idle' | 'processing' | 'complete' | 'error';
    /** Human-readable status message */
    message: string;
    /** Current batch ID — changes when a new batch starts */
    batchId: string | null;
}

// --- Default state ---

export const defaultQueueProgress: QueueProgressState = {
    visible: false,
    progress: 0,
    status: 'idle',
    message: '',
    batchId: null,
};

// --- Context ---

export const QueueProgressContext = createContext<QueueProgressState>(defaultQueueProgress);
