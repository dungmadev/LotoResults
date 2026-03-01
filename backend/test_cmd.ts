const { crawl } = require('./src/crawler/crawler');
const { initializeDb } = require('./src/db/database');

async function test() {
    initializeDb();
    const res = await crawl('2026-02-01', 'mt');
    console.log('Saved:', res);
}

test().catch(console.error);
