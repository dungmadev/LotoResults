import type { DrawResult } from '../types';
import { PRIZE_NAMES, PRIZE_ORDER_MB, PRIZE_ORDER_MT_MN } from '../types';
import { useExport } from '../hooks/useExport';

interface ResultTableProps {
    result: DrawResult;
    searchNumber?: string;
}

export default function ResultTable({ result, searchNumber }: ResultTableProps) {
    const prizeOrder = result.region === 'mb' ? PRIZE_ORDER_MB : PRIZE_ORDER_MT_MN;
    const { copyResultText, shareResult, copyStatus } = useExport();

    const highlightNumber = (num: string): boolean => {
        if (!searchNumber || searchNumber.trim() === '') return false;
        return num.includes(searchNumber);
    };

    return (
        <div className="result-table-wrapper">
            <table className="result-table">
                <thead>
                    <tr>
                        <th style={{ width: '100px' }}>Giải</th>
                        <th>Kết Quả</th>
                    </tr>
                </thead>
                <tbody>
                    {prizeOrder.map((code, idx) => {
                        const prize = result.prizes.find(p => p.prize_code === code);
                        if (!prize) return null;

                        return (
                            <tr key={code} className={`animate-fade-in stagger-${Math.min(idx + 1, 4)}`} style={{ animationDelay: `${idx * 0.04}s` }}>
                                <td>
                                    <span className={`prize-code ${code}`}>
                                        {PRIZE_NAMES[code] || code}
                                    </span>
                                </td>
                                <td>
                                    <div className="numbers-row">
                                        {prize.numbers.map((num, nIdx) => (
                                            <span
                                                key={nIdx}
                                                className={`number-cell ${code === 'db' ? 'db-number' : ''} ${highlightNumber(num) ? 'highlight' : ''
                                                    }`}
                                            >
                                                {num}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div className="result-actions">
                <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => copyResultText(result)}
                    title="Sao chép kết quả"
                >
                    {copyStatus === 'copied' ? '✅ Đã sao chép!' : '📋 Sao chép'}
                </button>
                <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => shareResult(result)}
                    title="Chia sẻ kết quả"
                >
                    📤 Chia sẻ
                </button>
            </div>
        </div>
    );
}

