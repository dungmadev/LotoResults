import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(__dirname, '..', '..', 'data');
const DB_PATH = path.join(DB_DIR, 'xoso.db');

let db: Database.Database;

export function getDb(): Database.Database {
    if (!db) {
        // Ensure data directory exists
        if (!fs.existsSync(DB_DIR)) {
            fs.mkdirSync(DB_DIR, { recursive: true });
        }
        db = new Database(DB_PATH);
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');
    }
    return db;
}

export function initializeDb(): void {
    const database = getDb();

    database.exec(`
    CREATE TABLE IF NOT EXISTS provinces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      region TEXT NOT NULL CHECK(region IN ('mb', 'mt', 'mn')),
      draw_days TEXT NOT NULL,
      draw_time TEXT DEFAULT '18:00',
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS draws (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      draw_date TEXT NOT NULL,
      region TEXT NOT NULL CHECK(region IN ('mb', 'mt', 'mn')),
      province_id TEXT NOT NULL,
      source TEXT,
      fetched_at TEXT NOT NULL,
      checksum TEXT,
      FOREIGN KEY (province_id) REFERENCES provinces(id),
      UNIQUE(draw_date, province_id)
    );

    CREATE TABLE IF NOT EXISTS prizes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      draw_id INTEGER NOT NULL,
      prize_code TEXT NOT NULL,
      numbers TEXT NOT NULL,
      FOREIGN KEY (draw_id) REFERENCES draws(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_draws_date ON draws(draw_date);
    CREATE INDEX IF NOT EXISTS idx_draws_region ON draws(region);
    CREATE INDEX IF NOT EXISTS idx_draws_province ON draws(province_id);
    CREATE INDEX IF NOT EXISTS idx_draws_date_region ON draws(draw_date, region);
    CREATE INDEX IF NOT EXISTS idx_prizes_draw ON prizes(draw_id);
  `);

    console.log('✅ Database initialized successfully');
}

export function closeDb(): void {
    if (db) {
        db.close();
    }
}
