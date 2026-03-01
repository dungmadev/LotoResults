import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// Rate limiter: max 100 requests per minute per IP
export const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
    },
});

// Input sanitizer middleware
export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
    // Sanitize query params
    for (const key of Object.keys(req.query)) {
        if (typeof req.query[key] === 'string') {
            // Remove potentially dangerous characters
            req.query[key] = (req.query[key] as string)
                .replace(/[<>\"';(){}]/g, '')
                .trim()
                .substring(0, 100); // Limit length
        }
    }
    next();
}

// Validate date format
export function validateDate(dateStr: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(Date.parse(dateStr));
}

// Validate region
export function validateRegion(region: string): boolean {
    return ['mb', 'mt', 'mn'].includes(region);
}

// Error handler middleware
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
    console.error('[ERROR]', err.message);
    res.status(500).json({
        success: false,
        error: 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.',
    });
}
