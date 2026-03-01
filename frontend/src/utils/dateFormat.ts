/**
 * Format a date string from YYYY-MM-DD to dd/mm/yyyy for display.
 * Returns today's date formatted if input is empty.
 */
export function formatDateDisplay(dateStr: string): string {
    if (!dateStr) {
        const now = new Date();
        const d = now.getDate().toString().padStart(2, '0');
        const m = (now.getMonth() + 1).toString().padStart(2, '0');
        return `${d}/${m}/${now.getFullYear()}`;
    }
    const [y, mo, da] = dateStr.split('-');
    return `${da}/${mo}/${y}`;
}
