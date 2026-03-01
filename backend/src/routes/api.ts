import { Router, Request, Response } from 'express';
import { getResults, getLatestResults, getProvinces, searchByNumber } from '../services/results';
import { getFrequencyStats, getHotColdNumbers, exportFrequencyCSV } from '../services/statistics';
import { validateDate, validateRegion } from '../middleware';
import { ResultsQuery, LatestQuery, Region, ApiResponse, DrawResult, Province } from '../types';

const router = Router();

// GET /api/results?date=YYYY-MM-DD&region=mb|mt|mn&province=...
router.get('/results', (req: Request, res: Response) => {
    try {
        const { date, region, province } = req.query;

        // Validate
        if (date && !validateDate(date as string)) {
            res.status(400).json({
                success: false,
                error: 'Ngày không hợp lệ. Sử dụng định dạng YYYY-MM-DD.',
            } as ApiResponse<null>);
            return;
        }
        if (region && !validateRegion(region as string)) {
            res.status(400).json({
                success: false,
                error: 'Miền không hợp lệ. Sử dụng: mb, mt, hoặc mn.',
            } as ApiResponse<null>);
            return;
        }

        const query: ResultsQuery = {
            date: date as string | undefined,
            region: region as Region | undefined,
            province: province as string | undefined,
        };

        const results = getResults(query);

        res.json({
            success: true,
            data: results,
            meta: {
                total: results.length,
            },
        } as ApiResponse<DrawResult[]>);
    } catch (error) {
        console.error('[GET /api/results]', error);
        res.status(500).json({
            success: false,
            error: 'Không thể tải kết quả. Vui lòng thử lại.',
        } as ApiResponse<null>);
    }
});

// GET /api/results/latest?region=...&province=...
router.get('/results/latest', (req: Request, res: Response) => {
    try {
        const { region, province } = req.query;

        if (region && !validateRegion(region as string)) {
            res.status(400).json({
                success: false,
                error: 'Miền không hợp lệ. Sử dụng: mb, mt, hoặc mn.',
            } as ApiResponse<null>);
            return;
        }

        const query: LatestQuery = {
            region: region as Region | undefined,
            province: province as string | undefined,
        };

        const results = getLatestResults(query);

        res.json({
            success: true,
            data: results,
            meta: {
                total: results.length,
            },
        } as ApiResponse<DrawResult[]>);
    } catch (error) {
        console.error('[GET /api/results/latest]', error);
        res.status(500).json({
            success: false,
            error: 'Không thể tải kết quả mới nhất. Vui lòng thử lại.',
        } as ApiResponse<null>);
    }
});

// GET /api/provinces?region=...
router.get('/provinces', (req: Request, res: Response) => {
    try {
        const { region } = req.query;

        if (region && !validateRegion(region as string)) {
            res.status(400).json({
                success: false,
                error: 'Miền không hợp lệ. Sử dụng: mb, mt, hoặc mn.',
            } as ApiResponse<null>);
            return;
        }

        const provinces = getProvinces(region as string | undefined);

        res.json({
            success: true,
            data: provinces,
            meta: {
                total: provinces.length,
            },
        } as ApiResponse<Province[]>);
    } catch (error) {
        console.error('[GET /api/provinces]', error);
        res.status(500).json({
            success: false,
            error: 'Không thể tải danh sách đài/tỉnh. Vui lòng thử lại.',
        } as ApiResponse<null>);
    }
});

// GET /api/search?number=...&date=...&region=...
router.get('/search', (req: Request, res: Response) => {
    try {
        const { number, date, region } = req.query;

        if (!number || (number as string).trim().length === 0) {
            res.status(400).json({
                success: false,
                error: 'Vui lòng nhập số cần tìm kiếm.',
            } as ApiResponse<null>);
            return;
        }

        // Only allow digits
        const cleanNumber = (number as string).replace(/\D/g, '');
        if (cleanNumber.length === 0 || cleanNumber.length > 6) {
            res.status(400).json({
                success: false,
                error: 'Số tìm kiếm phải từ 1-6 chữ số.',
            } as ApiResponse<null>);
            return;
        }

        if (date && !validateDate(date as string)) {
            res.status(400).json({
                success: false,
                error: 'Ngày không hợp lệ.',
            } as ApiResponse<null>);
            return;
        }

        const results = searchByNumber(cleanNumber, date as string, region as string);

        res.json({
            success: true,
            data: results,
            meta: {
                total: results.length,
            },
        } as ApiResponse<DrawResult[]>);
    } catch (error) {
        console.error('[GET /api/search]', error);
        res.status(500).json({
            success: false,
            error: 'Tìm kiếm thất bại. Vui lòng thử lại.',
        } as ApiResponse<null>);
    }
});

// GET /api/stats/frequency?region=...&days=...
router.get('/stats/frequency', (req: Request, res: Response) => {
    try {
        const { region, days } = req.query;

        if (region && !validateRegion(region as string)) {
            res.status(400).json({
                success: false,
                error: 'Miền không hợp lệ. Sử dụng: mb, mt, hoặc mn.',
            } as ApiResponse<null>);
            return;
        }

        const daysNum = days ? parseInt(days as string, 10) : 30;
        if (!days || isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
            res.status(400).json({
                success: false,
                error: 'Số ngày phải từ 1-365.',
            } as ApiResponse<null>);
            return;
        }

        const stats = getFrequencyStats(region as Region | undefined, daysNum);

        res.json({
            success: true,
            data: stats,
        } as ApiResponse<typeof stats>);
    } catch (error) {
        console.error('[GET /api/stats/frequency]', error);
        res.status(500).json({
            success: false,
            error: 'Không thể tải thống kê. Vui lòng thử lại.',
        } as ApiResponse<null>);
    }
});

// GET /api/stats/hot-cold?region=...&days=...&limit=...
router.get('/stats/hot-cold', (req: Request, res: Response) => {
    try {
        const { region, days, limit } = req.query;

        if (region && !validateRegion(region as string)) {
            res.status(400).json({
                success: false,
                error: 'Miền không hợp lệ. Sử dụng: mb, mt, hoặc mn.',
            } as ApiResponse<null>);
            return;
        }

        const daysNum = days ? parseInt(days as string, 10) : 30;
        const limitNum = limit ? parseInt(limit as string, 10) : 10;

        if (!days || isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
            res.status(400).json({
                success: false,
                error: 'Số ngày phải từ 1-365.',
            } as ApiResponse<null>);
            return;
        }

        if (!limit || isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
            res.status(400).json({
                success: false,
                error: 'Limit phải từ 1-50.',
            } as ApiResponse<null>);
            return;
        }

        const data = getHotColdNumbers(region as Region | undefined, daysNum, limitNum);

        res.json({
            success: true,
            data,
        } as ApiResponse<typeof data>);
    } catch (error) {
        console.error('[GET /api/stats/hot-cold]', error);
        res.status(500).json({
            success: false,
            error: 'Không thể tải thống kê. Vui lòng thử lại.',
        } as ApiResponse<null>);
    }
});

// GET /api/stats/frequency/export?region=...&days=...
router.get('/stats/frequency/export', (req: Request, res: Response) => {
    try {
        const { region, days } = req.query;

        if (region && !validateRegion(region as string)) {
            res.status(400).send('Miền không hợp lệ. Sử dụng: mb, mt, hoặc mn.');
            return;
        }

        const daysNum = days ? parseInt(days as string) : 30;
        if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
            res.status(400).send('Số ngày phải từ 1-365.');
            return;
        }

        const stats = getFrequencyStats(region as Region | undefined, daysNum);
        const csv = exportFrequencyCSV(stats);

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="frequency-stats-${stats.dateRange.start}-${stats.dateRange.end}.csv"`);
        res.send('\uFEFF' + csv); // BOM for UTF-8
    } catch (error) {
        console.error('[GET /api/stats/frequency/export]', error);
        res.status(500).send('Không thể xuất dữ liệu. Vui lòng thử lại.');
    }
});

export default router;
