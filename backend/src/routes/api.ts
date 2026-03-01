import { Router, Request, Response } from 'express';
import { getResults, getLatestResults, getProvinces, searchByNumber } from '../services/results';
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

export default router;
