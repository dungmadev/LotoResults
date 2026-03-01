import { Region, Province } from '../types';

export const PROVINCES = [
    // Miền Bắc
    { id: 'hanoi', name: 'Hà Nội', region: 'mb' as Region, draw_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },

    // Miền Trung
    { id: 'thuathienhue', name: 'Thừa Thiên Huế', region: 'mt' as Region, draw_days: ['sunday'] },
    { id: 'phuyen', name: 'Phú Yên', region: 'mt' as Region, draw_days: ['monday'] },
    { id: 'daklak', name: 'Đắk Lắk', region: 'mt' as Region, draw_days: ['tuesday'] },
    { id: 'quangnam', name: 'Quảng Nam', region: 'mt' as Region, draw_days: ['tuesday'] },
    { id: 'danang', name: 'Đà Nẵng', region: 'mt' as Region, draw_days: ['wednesday'] },
    { id: 'khanhhoa', name: 'Khánh Hòa', region: 'mt' as Region, draw_days: ['wednesday'] },
    { id: 'binhdinh', name: 'Bình Định', region: 'mt' as Region, draw_days: ['thursday'] },
    { id: 'quangtri', name: 'Quảng Trị', region: 'mt' as Region, draw_days: ['thursday'] },
    { id: 'quangbinh', name: 'Quảng Bình', region: 'mt' as Region, draw_days: ['thursday'] },
    { id: 'gialai', name: 'Gia Lai', region: 'mt' as Region, draw_days: ['friday'] },
    { id: 'ninhthuan', name: 'Ninh Thuận', region: 'mt' as Region, draw_days: ['friday'] },
    { id: 'quangngai', name: 'Quảng Ngãi', region: 'mt' as Region, draw_days: ['saturday'] },
    { id: 'daknong', name: 'Đắk Nông', region: 'mt' as Region, draw_days: ['saturday'] },
    { id: 'kontum', name: 'Kon Tum', region: 'mt' as Region, draw_days: ['sunday'] },

    // Miền Nam
    { id: 'hcm', name: 'TP. Hồ Chí Minh', region: 'mn' as Region, draw_days: ['saturday', 'monday'] },
    { id: 'dongnai', name: 'Đồng Nai', region: 'mn' as Region, draw_days: ['wednesday'] },
    { id: 'cantho', name: 'Cần Thơ', region: 'mn' as Region, draw_days: ['wednesday'] },
    { id: 'dongthap', name: 'Đồng Tháp', region: 'mn' as Region, draw_days: ['monday'] },
    { id: 'bariavungtau', name: 'Bà Rịa - Vũng Tàu', region: 'mn' as Region, draw_days: ['tuesday'] },
    { id: 'binhduong', name: 'Bình Dương', region: 'mn' as Region, draw_days: ['friday'] },
    { id: 'tayninh', name: 'Tây Ninh', region: 'mn' as Region, draw_days: ['thursday'] },
    { id: 'angiang', name: 'An Giang', region: 'mn' as Region, draw_days: ['thursday'] },
    { id: 'binhthuan', name: 'Bình Thuận', region: 'mn' as Region, draw_days: ['thursday'] },
    { id: 'vinhlong', name: 'Vĩnh Long', region: 'mn' as Region, draw_days: ['friday'] },
    { id: 'bentre', name: 'Bến Tre', region: 'mn' as Region, draw_days: ['tuesday'] },
    { id: 'camau', name: 'Cà Mau', region: 'mn' as Region, draw_days: ['monday'] },
    { id: 'longan', name: 'Long An', region: 'mn' as Region, draw_days: ['saturday'] },
    { id: 'kiengiang', name: 'Kiên Giang', region: 'mn' as Region, draw_days: ['sunday'] },
    { id: 'tiengiang', name: 'Tiền Giang', region: 'mn' as Region, draw_days: ['sunday'] },
    { id: 'dalat', name: 'Đà Lạt', region: 'mn' as Region, draw_days: ['sunday'] },
];

function removeAccents(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9]/g, "");
}

export function findProvinceId(name: string, region: Region): string {
    if (region === 'mb') return 'hanoi'; // MB always maps to hanoi currently

    const normalized = removeAccents(name);

    // Exact or loose match in the region
    for (const p of PROVINCES) {
        if (p.region === region) {
            const safeName = removeAccents(p.name);
            if (safeName === normalized || normalized.includes(safeName) || safeName.includes(normalized)) {
                return p.id;
            }
        }
    }

    // Edge cases mapping for xoso.com.vn table headers
    if (region === 'mt') {
        if (normalized.includes('hue')) return 'thuathienhue';
        if (normalized.includes('qnam')) return 'quangnam';
        if (normalized.includes('qbinh')) return 'quangbinh';
        if (normalized.includes('qngai')) return 'quangngai';
        if (normalized.includes('ntrung')) return 'binhdinh';
    }
    if (region === 'mn') {
        if (normalized.includes('tphcm') || normalized.includes('tp')) return 'hcm';
        if (normalized.includes('hcm')) return 'hcm';
        if (normalized.includes('vungtau') || normalized.includes('brvt')) return 'bariavungtau';
    }

    console.warn(`[PROVINCE] Could not match province for "${name}" in region ${region}. Using generic.`);
    return `${region}_general`;
}

// --- Day-of-week helpers ---

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * Get the English day name for a date string (YYYY-MM-DD)
 */
function getDayName(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dayIndex = new Date(y, m - 1, d).getDay();
    return DAY_NAMES[dayIndex];
}

/**
 * Get all provinces that draw on a specific date.
 * Used to calculate total province count for progress bar.
 *
 * @param dateStr - Date in YYYY-MM-DD format
 * @param region - Optional region filter (mb, mt, mn). If omitted, returns all regions.
 * @returns Array of { id, name, region } for provinces drawing on that date
 */
export function getProvincesForDate(dateStr: string, region?: Region): { id: string; name: string; region: Region }[] {
    const dayName = getDayName(dateStr);

    return PROVINCES
        .filter(p => {
            const matchDay = p.draw_days.includes(dayName);
            const matchRegion = region ? p.region === region : true;
            return matchDay && matchRegion;
        })
        .map(p => ({ id: p.id, name: p.name, region: p.region }));
}

/**
 * Count total provinces drawing on a specific date.
 * Quick helper for progress bar total calculation.
 */
export function countProvincesForDate(dateStr: string, region?: Region): number {
    return getProvincesForDate(dateStr, region).length;
}
