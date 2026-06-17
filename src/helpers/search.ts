export function normalizeSearch(str: string): string {
    return str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
