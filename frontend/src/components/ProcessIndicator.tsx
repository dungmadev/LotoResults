import { useQueueProgress } from '../hooks/useQueueProgressContext';

/**
 * ProcessIndicator — Displays a progress bar for CrawlQueue batch processing.
 *
 * Features:
 * - Appears with fade-in when processing starts
 * - Shows animated progress bar with percentage
 * - SVG spinner icon indicates active processing
 * - Displays source info (which crawler source is active/won)
 * - Fade-out when hidden (via CSS transition on opacity + max-height)
 * - Does NOT overlay content — uses sticky positioning in document flow
 */
export default function ProcessIndicator() {
    const { visible, progress, status, message, sourceInfo } = useQueueProgress();

    // Build CSS class names based on state
    const containerClass = [
        'process-indicator',
        visible ? 'process-indicator-visible' : '',
        status === 'complete' ? 'process-indicator-complete' : '',
        status === 'error' ? 'process-indicator-error' : '',
    ].filter(Boolean).join(' ');

    // Determine bar gradient based on status
    const barClass = [
        'process-indicator-bar',
        status === 'complete' ? 'process-indicator-bar-complete' : '',
        status === 'error' ? 'process-indicator-bar-error' : '',
    ].filter(Boolean).join(' ');

    return (
        <div
            className={containerClass}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-hidden={!visible}
            aria-label="Tiến trình xử lý"
        >
            <div className="process-indicator-content">
                {/* SVG Processing Spinner Icon */}
                <svg
                    className={`process-indicator-icon ${status === 'processing' ? 'spinning' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    {status === 'complete' ? (
                        /* Checkmark icon for complete state */
                        <path
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    ) : status === 'error' ? (
                        /* X circle icon for error state */
                        <path
                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    ) : (
                        /* Loader spinner icon for processing state */
                        <>
                            <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeDasharray="31.42 31.42"
                                strokeLinecap="round"
                                opacity="0.3"
                            />
                            <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeDasharray="20 42.84"
                                strokeLinecap="round"
                            />
                        </>
                    )}
                </svg>

                {/* Status message */}
                <span className="process-indicator-message">{message}</span>

                {/* Source info badge */}
                {sourceInfo?.winnerSource && (
                    <span className="process-indicator-source">
                        🏆 {sourceInfo.winnerSource}
                    </span>
                )}

                {/* Percentage display */}
                <span className="process-indicator-percent">{progress}%</span>
            </div>

            {/* Progress bar track */}
            <div className="process-indicator-track">
                <div
                    className={barClass}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
