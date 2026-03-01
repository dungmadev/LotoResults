import { normalizeResults, computeChecksum } from '../src/crawler/crawler';

describe('Crawler - normalizeResults', () => {
    it('should accept valid results', () => {
        const input = [
            {
                draw_date: '2026-03-01',
                region: 'mb' as const,
                province_id: 'hanoi',
                prizes: [
                    { prize_code: 'db', numbers: ['12345'] },
                    { prize_code: 'g1', numbers: ['67890'] },
                ],
            },
        ];

        const result = normalizeResults(input);
        expect(result).toHaveLength(1);
        expect(result[0].draw_date).toBe('2026-03-01');
    });

    it('should reject results with missing date', () => {
        const input = [
            {
                draw_date: '',
                region: 'mb' as const,
                province_id: 'hanoi',
                prizes: [{ prize_code: 'db', numbers: ['12345'] }],
            },
        ];

        const result = normalizeResults(input);
        expect(result).toHaveLength(0);
    });

    it('should reject results with invalid date format', () => {
        const input = [
            {
                draw_date: '01-03-2026', // wrong format
                region: 'mb' as const,
                province_id: 'hanoi',
                prizes: [{ prize_code: 'db', numbers: ['12345'] }],
            },
        ];

        const result = normalizeResults(input);
        expect(result).toHaveLength(0);
    });

    it('should reject results with invalid region', () => {
        const input = [
            {
                draw_date: '2026-03-01',
                region: 'xx' as any,
                province_id: 'hanoi',
                prizes: [{ prize_code: 'db', numbers: ['12345'] }],
            },
        ];

        const result = normalizeResults(input);
        expect(result).toHaveLength(0);
    });

    it('should reject results with no prizes', () => {
        const input = [
            {
                draw_date: '2026-03-01',
                region: 'mb' as const,
                province_id: 'hanoi',
                prizes: [],
            },
        ];

        const result = normalizeResults(input);
        expect(result).toHaveLength(0);
    });

    it('should handle multiple results and filter invalid ones', () => {
        const input = [
            {
                draw_date: '2026-03-01',
                region: 'mb' as const,
                province_id: 'hanoi',
                prizes: [{ prize_code: 'db', numbers: ['12345'] }],
            },
            {
                draw_date: '',
                region: 'mt' as const,
                province_id: 'danang',
                prizes: [{ prize_code: 'db', numbers: ['12345'] }],
            },
            {
                draw_date: '2026-03-01',
                region: 'mn' as const,
                province_id: 'hcm',
                prizes: [{ prize_code: 'db', numbers: ['67890'] }],
            },
        ];

        const result = normalizeResults(input);
        expect(result).toHaveLength(2);
    });
});

describe('Crawler - computeChecksum', () => {
    it('should return consistent checksum for same data', () => {
        const data = {
            draw_date: '2026-03-01',
            region: 'mb' as const,
            province_id: 'hanoi',
            prizes: [{ prize_code: 'db', numbers: ['12345'] }],
        };

        const hash1 = computeChecksum(data);
        const hash2 = computeChecksum(data);
        expect(hash1).toBe(hash2);
    });

    it('should return different checksum for different data', () => {
        const data1 = {
            draw_date: '2026-03-01',
            region: 'mb' as const,
            province_id: 'hanoi',
            prizes: [{ prize_code: 'db', numbers: ['12345'] }],
        };
        const data2 = {
            draw_date: '2026-03-01',
            region: 'mb' as const,
            province_id: 'hanoi',
            prizes: [{ prize_code: 'db', numbers: ['99999'] }],
        };

        expect(computeChecksum(data1)).not.toBe(computeChecksum(data2));
    });
});
