import { getDb, initializeDb } from './database';
import { Region } from '../types';

// Province data for all 3 regions
const PROVINCES = [
    // Miền Bắc - chỉ có 1 đài chính
    { id: 'hanoi', name: 'Hà Nội', region: 'mb' as Region, draw_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], draw_time: '18:15' },

    // Miền Trung
    { id: 'thuathienhue', name: 'Thừa Thiên Huế', region: 'mt' as Region, draw_days: ['sunday'], draw_time: '17:15' },
    { id: 'phuyen', name: 'Phú Yên', region: 'mt' as Region, draw_days: ['monday'], draw_time: '17:15' },
    { id: 'daklak', name: 'Đắk Lắk', region: 'mt' as Region, draw_days: ['tuesday'], draw_time: '17:15' },
    { id: 'quangnam', name: 'Quảng Nam', region: 'mt' as Region, draw_days: ['tuesday'], draw_time: '17:15' },
    { id: 'danang', name: 'Đà Nẵng', region: 'mt' as Region, draw_days: ['wednesday'], draw_time: '17:15' },
    { id: 'khanhhoa', name: 'Khánh Hòa', region: 'mt' as Region, draw_days: ['wednesday'], draw_time: '17:15' },
    { id: 'binhdinh', name: 'Bình Định', region: 'mt' as Region, draw_days: ['thursday'], draw_time: '17:15' },
    { id: 'quangtri', name: 'Quảng Trị', region: 'mt' as Region, draw_days: ['thursday'], draw_time: '17:15' },
    { id: 'quangbinh', name: 'Quảng Bình', region: 'mt' as Region, draw_days: ['thursday'], draw_time: '17:15' },
    { id: 'gialai', name: 'Gia Lai', region: 'mt' as Region, draw_days: ['friday'], draw_time: '17:15' },
    { id: 'ninhthuan', name: 'Ninh Thuận', region: 'mt' as Region, draw_days: ['friday'], draw_time: '17:15' },
    { id: 'quangngai', name: 'Quảng Ngãi', region: 'mt' as Region, draw_days: ['saturday'], draw_time: '17:15' },
    { id: 'daknong', name: 'Đắk Nông', region: 'mt' as Region, draw_days: ['saturday'], draw_time: '17:15' },
    { id: 'kontum', name: 'Kon Tum', region: 'mt' as Region, draw_days: ['sunday'], draw_time: '17:15' },

    // Miền Nam
    { id: 'hcm', name: 'TP. Hồ Chí Minh', region: 'mn' as Region, draw_days: ['saturday'], draw_time: '16:15' },
    { id: 'dongnai', name: 'Đồng Nai', region: 'mn' as Region, draw_days: ['wednesday'], draw_time: '16:15' },
    { id: 'cantho', name: 'Cần Thơ', region: 'mn' as Region, draw_days: ['wednesday'], draw_time: '16:15' },
    { id: 'dongthap', name: 'Đồng Tháp', region: 'mn' as Region, draw_days: ['monday'], draw_time: '16:15' },
    { id: 'bariavungtau', name: 'Bà Rịa - Vũng Tàu', region: 'mn' as Region, draw_days: ['tuesday'], draw_time: '16:15' },
    { id: 'binhduong', name: 'Bình Dương', region: 'mn' as Region, draw_days: ['friday'], draw_time: '16:15' },
    { id: 'tayninh', name: 'Tây Ninh', region: 'mn' as Region, draw_days: ['thursday'], draw_time: '16:15' },
    { id: 'angiang', name: 'An Giang', region: 'mn' as Region, draw_days: ['thursday'], draw_time: '16:15' },
    { id: 'binhthuan', name: 'Bình Thuận', region: 'mn' as Region, draw_days: ['thursday'], draw_time: '16:15' },
    { id: 'vinhlong', name: 'Vĩnh Long', region: 'mn' as Region, draw_days: ['friday'], draw_time: '16:15' },
    { id: 'bentre', name: 'Bến Tre', region: 'mn' as Region, draw_days: ['tuesday'], draw_time: '16:15' },
    { id: 'camau', name: 'Cà Mau', region: 'mn' as Region, draw_days: ['monday'], draw_time: '16:15' },
    { id: 'longan', name: 'Long An', region: 'mn' as Region, draw_days: ['saturday'], draw_time: '16:15' },
    { id: 'kiengiang', name: 'Kiên Giang', region: 'mn' as Region, draw_days: ['sunday'], draw_time: '16:15' },
    { id: 'tiengiang', name: 'Tiền Giang', region: 'mn' as Region, draw_days: ['sunday'], draw_time: '16:15' },
    { id: 'dalat', name: 'Đà Lạt', region: 'mn' as Region, draw_days: ['sunday'], draw_time: '16:15' },
];

// Generate random lottery numbers
function randomNumbers(digitCount: number, count: number): string[] {
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
        const max = Math.pow(10, digitCount);
        const num = Math.floor(Math.random() * max);
        result.push(num.toString().padStart(digitCount, '0'));
    }
    return result;
}

// Generate MB prizes
function generateMBPrizes(): { prize_code: string; numbers: string[] }[] {
    return [
        { prize_code: 'db', numbers: randomNumbers(5, 1) },
        { prize_code: 'g1', numbers: randomNumbers(5, 1) },
        { prize_code: 'g2', numbers: randomNumbers(5, 2) },
        { prize_code: 'g3', numbers: randomNumbers(5, 6) },
        { prize_code: 'g4', numbers: randomNumbers(4, 4) },
        { prize_code: 'g5', numbers: randomNumbers(4, 6) },
        { prize_code: 'g6', numbers: randomNumbers(3, 3) },
        { prize_code: 'g7', numbers: randomNumbers(2, 4) },
    ];
}

// Generate MT/MN prizes
function generateMTMNPrizes(): { prize_code: string; numbers: string[] }[] {
    return [
        { prize_code: 'g8', numbers: randomNumbers(2, 1) },
        { prize_code: 'g7', numbers: randomNumbers(3, 1) },
        { prize_code: 'g6', numbers: randomNumbers(4, 3) },
        { prize_code: 'g5', numbers: randomNumbers(4, 1) },
        { prize_code: 'g4', numbers: randomNumbers(5, 7) },
        { prize_code: 'g3', numbers: randomNumbers(5, 2) },
        { prize_code: 'g2', numbers: randomNumbers(5, 1) },
        { prize_code: 'g1', numbers: randomNumbers(5, 1) },
        { prize_code: 'db', numbers: randomNumbers(6, 1) },
    ];
}

function formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export function seedDatabase(): void {
    initializeDb();
    const db = getDb();

    console.log('🌱 Seeding database...');

    // Clear existing data
    db.exec('DELETE FROM prizes');
    db.exec('DELETE FROM draws');
    db.exec('DELETE FROM provinces');

    // Insert provinces
    const insertProvince = db.prepare(
        'INSERT INTO provinces (id, name, region, draw_days, draw_time, active) VALUES (?, ?, ?, ?, ?, ?)'
    );

    for (const p of PROVINCES) {
        insertProvince.run(p.id, p.name, p.region, JSON.stringify(p.draw_days), p.draw_time, 1);
    }
    console.log(`  ✅ Inserted ${PROVINCES.length} provinces`);

    // Generate draws for last 7 days
    const insertDraw = db.prepare(
        'INSERT INTO draws (draw_date, region, province_id, source, fetched_at, checksum) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const insertPrize = db.prepare(
        'INSERT INTO prizes (draw_id, prize_code, numbers) VALUES (?, ?, ?)'
    );

    const insertDraws = db.transaction(() => {
        let drawCount = 0;
        let prizeCount = 0;

        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
            const date = new Date();
            date.setDate(date.getDate() - dayOffset);
            const dateStr = formatDate(date);
            const dayName = dayNames[date.getDay()];

            for (const province of PROVINCES) {
                if (!province.draw_days.includes(dayName)) continue;

                const checksum = `seed_${province.id}_${dateStr}`;
                const result = insertDraw.run(
                    dateStr,
                    province.region,
                    province.id,
                    'seed-data',
                    new Date().toISOString(),
                    checksum
                );
                const drawId = result.lastInsertRowid;
                drawCount++;

                const prizes = province.region === 'mb' ? generateMBPrizes() : generateMTMNPrizes();
                for (const prize of prizes) {
                    insertPrize.run(drawId, prize.prize_code, JSON.stringify(prize.numbers));
                    prizeCount++;
                }
            }
        }

        console.log(`  ✅ Inserted ${drawCount} draws with ${prizeCount} prize records`);
    });

    insertDraws();
    console.log('🎉 Database seeded successfully!');
}

// Run seed if called directly
if (require.main === module) {
    seedDatabase();
}
