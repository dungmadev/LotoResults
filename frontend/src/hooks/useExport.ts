import { useCallback, useState } from 'react';
import type { DrawResult } from '../types';
import { PRIZE_NAMES } from '../types';

/**
 * Hook providing export & share functionality for lottery results.
 * - copyResultText: copies result as formatted text to clipboard
 * - shareResult: uses Web Share API (mobile) or fallback to copy
 */
export function useExport() {
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

    /**
     * Format a DrawResult into a shareable text string.
     */
    const formatResultText = useCallback((result: DrawResult): string => {
        const lines: string[] = [];
        lines.push(`🎰 ${result.province_name} — ${result.draw_date}`);
        lines.push('─'.repeat(30));

        for (const prize of result.prizes) {
            const label = PRIZE_NAMES[prize.prize_code] || prize.prize_code;
            const nums = prize.numbers.join(' - ');
            lines.push(`${label}: ${nums}`);
        }

        lines.push('');
        lines.push('🔗 XỔ SỐ LIVE — https://lotoresults-frontend.onrender.com');
        return lines.join('\n');
    }, []);

    /**
     * Copy result text to clipboard.
     */
    const copyResultText = useCallback(async (result: DrawResult) => {
        try {
            const text = formatResultText(result);
            await navigator.clipboard.writeText(text);
            setCopyStatus('copied');
            setTimeout(() => setCopyStatus('idle'), 2000);
        } catch {
            setCopyStatus('error');
            setTimeout(() => setCopyStatus('idle'), 2000);
        }
    }, [formatResultText]);

    /**
     * Share result using Web Share API (mobile) or fallback to copy.
     */
    const shareResult = useCallback(async (result: DrawResult) => {
        const text = formatResultText(result);

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Kết quả ${result.province_name} - ${result.draw_date}`,
                    text,
                });
            } catch {
                // User cancelled share — no-op
            }
        } else {
            // Fallback to copy
            await copyResultText(result);
        }
    }, [formatResultText, copyResultText]);

    /**
     * Export results as CSV text and trigger download.
     */
    const exportCsv = useCallback((results: DrawResult[], filename = 'xoso-results.csv') => {
        const rows: string[] = [];
        rows.push('Ngày,Miền,Đài,Giải,Số');

        for (const result of results) {
            for (const prize of result.prizes) {
                for (const num of prize.numbers) {
                    rows.push(`${result.draw_date},${result.region},${result.province_name},${prize.prize_code},${num}`);
                }
            }
        }

        const csv = rows.join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }, []);

    return { copyResultText, shareResult, exportCsv, copyStatus };
}
