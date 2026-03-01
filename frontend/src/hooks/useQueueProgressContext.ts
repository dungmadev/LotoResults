import { useContext } from 'react';
import { QueueProgressContext } from './QueueProgressContext';
import type { QueueProgressState } from './QueueProgressContext';

/**
 * Hook to consume queue progress state from QueueProgressContext.
 * Use this in any component that needs to read progress data.
 */
export function useQueueProgress(): QueueProgressState {
    return useContext(QueueProgressContext);
}
