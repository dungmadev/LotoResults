import { validateDate, validateRegion } from '../src/middleware';

describe('Middleware - validateDate', () => {
    it('should accept valid date', () => {
        expect(validateDate('2026-03-01')).toBe(true);
    });

    it('should reject invalid format', () => {
        expect(validateDate('01-03-2026')).toBe(false);
        expect(validateDate('2026/03/01')).toBe(false);
        expect(validateDate('abc')).toBe(false);
    });

    it('should reject empty string', () => {
        expect(validateDate('')).toBe(false);
    });
});

describe('Middleware - validateRegion', () => {
    it('should accept valid regions', () => {
        expect(validateRegion('mb')).toBe(true);
        expect(validateRegion('mt')).toBe(true);
        expect(validateRegion('mn')).toBe(true);
    });

    it('should reject invalid regions', () => {
        expect(validateRegion('xx')).toBe(false);
        expect(validateRegion('')).toBe(false);
        expect(validateRegion('MB')).toBe(false);
    });
});
