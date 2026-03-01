import { getDb } from './database';
import { Region } from '../types';

// Province data for all 3 regions — this is REFERENCE data, not fake results
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
    { id: 'hcm', name: 'TP. Hồ Chí Minh', region: 'mn' as Region, draw_days: ['saturday', 'monday'], draw_time: '16:15' },
    { id: 'dongnai', name: 'Đồng Nai', region: 'mn' as Region, draw_days: ['wednesday'], draw_time: '16:15' },
    { id: 'cantho', name: 'Cần Thơ', region: 'mn' as Region, draw_days: ['wednesday'], draw_time: '16:15' },
    { id: 'soctrang', name: 'Sóc Trăng', region: 'mn' as Region, draw_days: ['wednesday'], draw_time: '16:15' },
    { id: 'dongthap', name: 'Đồng Tháp', region: 'mn' as Region, draw_days: ['monday'], draw_time: '16:15' },
    { id: 'bariavungtau', name: 'Bà Rịa - Vũng Tàu', region: 'mn' as Region, draw_days: ['tuesday'], draw_time: '16:15' },
    { id: 'baclieu', name: 'Bạc Liêu', region: 'mn' as Region, draw_days: ['tuesday'], draw_time: '16:15' },
    { id: 'binhduong', name: 'Bình Dương', region: 'mn' as Region, draw_days: ['friday'], draw_time: '16:15' },
    { id: 'travinh', name: 'Trà Vinh', region: 'mn' as Region, draw_days: ['friday'], draw_time: '16:15' },
    { id: 'tayninh', name: 'Tây Ninh', region: 'mn' as Region, draw_days: ['thursday'], draw_time: '16:15' },
    { id: 'angiang', name: 'An Giang', region: 'mn' as Region, draw_days: ['thursday'], draw_time: '16:15' },
    { id: 'binhthuan', name: 'Bình Thuận', region: 'mn' as Region, draw_days: ['thursday'], draw_time: '16:15' },
    { id: 'vinhlong', name: 'Vĩnh Long', region: 'mn' as Region, draw_days: ['friday'], draw_time: '16:15' },
    { id: 'bentre', name: 'Bến Tre', region: 'mn' as Region, draw_days: ['tuesday'], draw_time: '16:15' },
    { id: 'camau', name: 'Cà Mau', region: 'mn' as Region, draw_days: ['monday'], draw_time: '16:15' },
    { id: 'longan', name: 'Long An', region: 'mn' as Region, draw_days: ['saturday'], draw_time: '16:15' },
    { id: 'binhphuoc', name: 'Bình Phước', region: 'mn' as Region, draw_days: ['saturday'], draw_time: '16:15' },
    { id: 'haugiang', name: 'Hậu Giang', region: 'mn' as Region, draw_days: ['saturday'], draw_time: '16:15' },
    { id: 'kiengiang', name: 'Kiên Giang', region: 'mn' as Region, draw_days: ['sunday'], draw_time: '16:15' },
    { id: 'tiengiang', name: 'Tiền Giang', region: 'mn' as Region, draw_days: ['sunday'], draw_time: '16:15' },
    { id: 'dalat', name: 'Đà Lạt', region: 'mn' as Region, draw_days: ['sunday'], draw_time: '16:15' },
];

/**
 * Sync provinces from the PROVINCES constant into the DB.
 * Called on every app startup to ensure new provinces in code
 * are automatically available in the DB (no manual SQL needed).
 *
 * Uses INSERT OR IGNORE for new provinces and UPDATE for draw_days sync.
 */
export function syncProvinces(): void {
    const db = getDb();

    const insertOrIgnore = db.prepare(
        'INSERT OR IGNORE INTO provinces (id, name, region, draw_days, draw_time, active) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const updateDrawDays = db.prepare(
        'UPDATE provinces SET draw_days = ?, name = ? WHERE id = ?'
    );

    let inserted = 0;
    let updated = 0;

    for (const p of PROVINCES) {
        const drawDays = JSON.stringify(p.draw_days);
        const result = insertOrIgnore.run(p.id, p.name, p.region, drawDays, p.draw_time || '16:15', 1);

        if (result.changes > 0) {
            inserted++;
        } else {
            // Province exists — sync draw_days and name
            const upd = updateDrawDays.run(drawDays, p.name, p.id);
            if (upd.changes > 0) updated++;
        }
    }

    if (inserted > 0 || updated > 0) {
        console.log(`🔄 Province sync: ${inserted} new, ${updated} updated`);
    } else {
        console.log(`✅ Provinces in sync (${PROVINCES.length} total)`);
    }
}
