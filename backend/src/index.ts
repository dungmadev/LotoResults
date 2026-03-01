import express from 'express';
import cors from 'cors';
import { initializeDb } from './db/database';
import { seedDatabase } from './db/seed';
import apiRoutes from './routes/api';
import { apiLimiter, sanitizeInput, errorHandler } from './middleware';

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
        // Initialize database
        initializeDb();

        // Check if we need to seed
        const Database = require('better-sqlite3');
        const path = require('path');
        const fs = require('fs');
        const dbPath = path.join(__dirname, '..', 'data', 'xoso.db');

        if (fs.existsSync(dbPath)) {
            const db = new Database(dbPath);
            const count = db.prepare('SELECT COUNT(*) as count FROM draws').get() as any;
            db.close();
            if (count.count === 0) {
                console.log('📦 Database empty, seeding...');
                seedDatabase();
            } else {
                console.log(`📊 Database has ${count.count} draws`);
            }
        } else {
            console.log('📦 No database found, seeding...');
            seedDatabase();
        }

        app.listen(PORT, () => {
            console.log(`\n🚀 XỔ SỐ API Server running at http://localhost:${PORT}`);
            console.log(`   Health check: http://localhost:${PORT}/health`);
            console.log(`   API base:     http://localhost:${PORT}/api\n`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

start();

export default app;
