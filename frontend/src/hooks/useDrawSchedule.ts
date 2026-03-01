import { useState, useEffect } from 'react';

// Draw times for each region (Vietnam timezone, UTC+7)
// MB: 18:15, MT: 17:15, MN: 16:15
const DRAW_TIMES: Record<string, { hour: number; minute: number }> = {
    mb: { hour: 18, minute: 15 },
    mt: { hour: 17, minute: 15 },
    mn: { hour: 16, minute: 15 },
};

// Draw duration (approximately 30 minutes)
const DRAW_DURATION_MS = 30 * 60 * 1000;

interface DrawScheduleInfo {
    /** Whether any region is currently in draw time */
    isLive: boolean;
    /** Regions currently in draw time */
    liveRegions: string[];
    /** Countdown to next draw in milliseconds */
    nextDrawMs: number;
    /** Formatted countdown string (HH:MM:SS) */
    nextDrawFormatted: string;
    /** Next draw region */
    nextDrawRegion: string;
    /** Current time */
    now: Date;
}

function getDrawTimeToday(region: string, now: Date): Date {
    const drawTime = DRAW_TIMES[region];
    if (!drawTime) return new Date(0);
    const dt = new Date(now);
    dt.setHours(drawTime.hour, drawTime.minute, 0, 0);
    return dt;
}

function formatCountdown(ms: number): string {
    if (ms <= 0) return '00:00:00';
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function useDrawSchedule(): DrawScheduleInfo {
    const [now, setNow] = useState(new Date());

    // Update every second
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Check which regions are currently live
    const liveRegions: string[] = [];
    for (const [region] of Object.entries(DRAW_TIMES)) {
        const drawStart = getDrawTimeToday(region, now);
        const drawEnd = new Date(drawStart.getTime() + DRAW_DURATION_MS);
        if (now >= drawStart && now <= drawEnd) {
            liveRegions.push(region);
        }
    }

    // Find next draw
    let nextDrawMs = Infinity;
    let nextDrawRegion = '';

    for (const [region] of Object.entries(DRAW_TIMES)) {
        const drawStart = getDrawTimeToday(region, now);
        const diff = drawStart.getTime() - now.getTime();

        // Only consider future draws
        if (diff > 0 && diff < nextDrawMs) {
            nextDrawMs = diff;
            nextDrawRegion = region;
        }
    }

    // If all draws are in the past today, calculate tomorrow's first draw (MN at 16:15)
    if (nextDrawMs === Infinity) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const firstDraw = getDrawTimeToday('mn', tomorrow);
        nextDrawMs = firstDraw.getTime() - now.getTime();
        nextDrawRegion = 'mn';
    }

    return {
        isLive: liveRegions.length > 0,
        liveRegions,
        nextDrawMs,
        nextDrawFormatted: formatCountdown(nextDrawMs),
        nextDrawRegion,
        now,
    };
}
