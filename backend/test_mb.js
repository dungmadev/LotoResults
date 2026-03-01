const axios = require('axios');
const cheerio = require('cheerio');

async function testMB() {
    try {
        const url = 'https://xoso.com.vn/xsmb-01-02-2026.html';
        const r = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 });
        const $ = cheerio.load(r.data);
        const tbl = $('table.table-result').first();
        if (tbl.length) {
            console.log('Table html span found! Rows: ', tbl.find('tr').length);
            tbl.find('tr').each((i, tr) => {
                const td = $(tr).find('td');
                if (td.length > 1) {
                    console.log(`row ${i}: ${td.eq(1).text().trim().substring(0, 30)}`);
                }
            });
        } else {
            console.log('No table.table-result found');
            console.log($('table').map((i, t) => $(t).attr('class') || 'none').get().join(', '));
        }
    } catch (e) {
        console.error(e.message);
    }
}
testMB();
