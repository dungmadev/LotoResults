import { useDrawSchedule } from '../hooks/useDrawSchedule';
import { REGION_NAMES } from '../types';
import type { Region } from '../types';

/**
 * Widget showing draw schedule countdown and live status.
 * Displays next draw countdown and which regions are currently live.
 */
export default function ScheduleWidget() {
    const { isLive, liveRegions, nextDrawFormatted, nextDrawRegion } = useDrawSchedule();

    return (
        <div className="schedule-widget animate-fade-in">
            {isLive ? (
                <div className="schedule-live">
                    <span className="live-indicator">
                        <span className="live-dot" />
                        LIVE
                    </span>
                    <span className="live-text">
                        Đang quay: {liveRegions.map(r => REGION_NAMES[r as Region]).join(', ')}
                    </span>
                </div>
            ) : (
                <div className="schedule-countdown">
                    <span className="countdown-label">
                        ⏱️ Kỳ quay tiếp theo ({REGION_NAMES[nextDrawRegion as Region]}):
                    </span>
                    <span className="countdown-timer">{nextDrawFormatted}</span>
                </div>
            )}
        </div>
    );
}
