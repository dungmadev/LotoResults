import { Router, Request, Response } from 'express';
import { getResults, getLatestResults, getProvinces, searchByNumber } from '../services/results';
import type { SearchMode } from '../services/results';
import { validateDate, validateRegion } from '../middleware';
import { ResultsQuery, LatestQuery, Region, ApiResponse, DrawResult, Province } from '../types';

const router = Router();

// GET /api/results?date=YYYY-MM-DD&region=mb|mt|mn&province=...
router.get('/results', async (req: Request, res: Response) => {
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

        const results = await getResults(query);

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

// GET /api/search?number=...&date=...&region=...&mode=contains|starts|ends&prize_code=db|g1|...
router.get('/search', (req: Request, res: Response) => {
    try {
        const { number, date, region, mode, prize_code } = req.query;

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

        // Validate search mode
        const validModes = ['contains', 'starts', 'ends'];
        const searchMode: SearchMode = (mode && validModes.includes(mode as string))
            ? (mode as SearchMode)
            : 'contains';

        // Validate prize_code
        const validPrizeCodes = ['db', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8'];
        const prizeCode = (prize_code && validPrizeCodes.includes(prize_code as string))
            ? (prize_code as string)
            : undefined;

        const results = searchByNumber(cleanNumber, date as string, region as string, searchMode, prizeCode);

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

// POST /api/crawl — crawl results for a specific date and region
router.post('/crawl', async (req: Request, res: Response) => {
    try {
        const { date, region } = req.body as { date?: string; region?: string };

        if (!date || !validateDate(date)) {
            res.status(400).json({ success: false, error: 'Ngày không hợp lệ (YYYY-MM-DD).' });
            return;
        }
        const validRegion = (region && ['mb', 'mt', 'mn'].includes(region)) ? region as Region : 'mb';

        const { crawl: doCrawl } = await import('../crawler/crawler');
        const saved = await doCrawl(date, validRegion);

        res.json({
            success: true,
            data: { saved, date, region: validRegion },
        });
    } catch (error) {
        console.error('[POST /api/crawl]', error);
        res.status(500).json({ success: false, error: 'Crawl thất bại.' });
    }
});

// POST /api/backfill — crawl historical results (MB only for now)
router.post('/backfill', async (req: Request, res: Response) => {
    try {
        const days = Math.min(Number(req.body?.days) || 30, 90);

        const { crawlBackfill } = await import('../crawler/crawler');
        const saved = await crawlBackfill(days);

        res.json({
            success: true,
            data: { saved, days },
        });
    } catch (error) {
        console.error('[POST /api/backfill]', error);
        res.status(500).json({ success: false, error: 'Backfill thất bại.' });
    }
});

export default router;

