const axios = require('axios');
const cheerio = require('cheerio');

async function testCrawl() {
    try {
        const url = 'https://xoso.com.vn/xsmt-01-03-2026.html';
        console.log('Fetching:', url);
        const r = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 15000,
        });
        const $ = cheerio.load(r.data);

        $('table.table-result').each((i, tbl) => {
            console.log(`\n=== Table ${i} ===`);
            const ths = $(tbl).find('th');
            const thTexts = [];
            ths.each((j, th) => thTexts.push($(th).text().trim()));
            console.log('Headers:', thTexts);

            const rows = $(tbl).find('tr');
            rows.each((j, tr) => {
                const cells = [];
                $(tr).find('td').each((k, td) => cells.push($(td).text().trim().substring(0, 30)));
                if (cells.length) console.log(` Row ${j}:`, cells);
            });
        });
    } catch (e) {
        console.error('Error:', e.message);
    }
}
testCrawl();
