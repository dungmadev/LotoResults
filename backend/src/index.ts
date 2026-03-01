import express from 'express';
import cors from 'cors';
import { initializeDb, getDb } from './db/database';
import { syncProvinces } from './db/seed';
import apiRoutes from './routes/api';
import { apiLimiter, sanitizeInput, errorHandler } from './middleware';
import { crawlQueue } from './services/crawlQueue';
import { sseManager } from './services/sseManager';
import { startCleanupScheduler } from './services/cleanup';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS - allow dev & production origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'https://lotoresults-frontend.onrender.com',
];

// Also allow custom origins from env (comma-separated)
if (process.env.CORS_ORIGIN) {
    allowedOrigins.push(...process.env.CORS_ORIGIN.split(',').map(s => s.trim()));
}

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
}));
app.use(express.json());
app.use(sanitizeInput);
app.use('/api', apiLimiter);

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Initialize DB and start server
async function start(): Promise<void> {
    try {
        // Initialize database (creates tables + runs migrations)
        initializeDb();

        // Clean up old seed data if it exists (one-time migration)
        const db = getDb();
        const seedDraws = db.prepare("SELECT COUNT(*) as count FROM draws WHERE source = 'seed-data'").get() as any;
        if (seedDraws.count > 0) {
            console.log(`🧹 Removing ${seedDraws.count} seed draws (fake data)...`);
            db.exec("DELETE FROM draws WHERE source = 'seed-data'");
            console.log('✅ Seed data removed — will crawl real data on startup');
        }

        // Clean up duplicate prizes (from previous bug where prizes weren't deleted before re-insert)
        const dupes = db.prepare(`
            SELECT draw_id, prize_code, COUNT(*) as cnt
            FROM prizes
            GROUP BY draw_id, prize_code
            HAVING cnt > 1
        `).all() as { draw_id: number; prize_code: string; cnt: number }[];

        if (dupes.length > 0) {
            console.log(`🧹 Fixing ${dupes.length} duplicate prize entries...`);
            for (const dupe of dupes) {
                // Keep only the latest prize (highest id), delete the rest
                db.prepare(`
                    DELETE FROM prizes WHERE draw_id = ? AND prize_code = ?
                    AND id NOT IN (
                        SELECT MAX(id) FROM prizes WHERE draw_id = ? AND prize_code = ?
                    )
                `).run(dupe.draw_id, dupe.prize_code, dupe.draw_id, dupe.prize_code);
            }
            console.log('✅ Duplicate prizes cleaned up');
        }

        // Always sync provinces → ensures new provinces from code are in DB
        syncProvinces();

        app.listen(PORT, () => {
            console.log(`\n🚀 XỔ SỐ API Server running at http://localhost:${PORT}`);
            console.log(`   Health check: http://localhost:${PORT}/health`);
            console.log(`   API base:     http://localhost:${PORT}/api`);
            console.log(`   SSE events:   http://localhost:${PORT}/api/events\n`);

            // Auto-crawl today's data for all 3 regions after server starts
            const today = new Date().toISOString().split('T')[0];
            console.log(`📡 Auto-crawl: Enqueueing today's data (${today}) for all regions...`);
            crawlQueue.enqueueAllRegions(today);

            // Ensure SSE manager is initialized (singleton)
            console.log(`📡 SSE Manager: Ready (${sseManager.getClientCount()} clients)`);

            // Start cleanup scheduler (auto-delete old data)
            startCleanupScheduler();
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

start();

export default app;

