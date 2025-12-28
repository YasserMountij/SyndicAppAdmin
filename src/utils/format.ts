import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

/**
 * Format a date string to a readable format
 */
export function formatDate(date: string | Date, format = 'DD/MM/YYYY'): string {
    return dayjs(date).format(format);
}

/**
 * Format a date with time
 */
export function formatDateTime(date: string | Date): string {
    return dayjs(date).format('DD/MM/YYYY HH:mm');
}

/**
 * Format date as relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: string | Date): string {
    return dayjs(date).fromNow();
}

/**
 * Format amount as Moroccan Dirham currency
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format Moroccan phone number
 */
export function formatPhone(phone: string | null | undefined): string {
    if (!phone) return '-';

    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Format as Moroccan number: +212 6XX XX XX XX
    if (digits.startsWith('212')) {
        const local = digits.slice(3);
        return `+212 ${local.slice(0, 3)} ${local.slice(3, 5)} ${local.slice(5, 7)} ${local.slice(7)}`;
    }

    // Format as local: 06XX XX XX XX
    if (digits.startsWith('0')) {
        return `${digits.slice(0, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
    }

    return phone;
}

/**
 * Get days until expiration
 */
export function getDaysUntilExpiration(expirationDate: string | Date): number {
    const expDate = dayjs(expirationDate);
    const now = dayjs();
    return expDate.diff(now, 'day');
}

/**
 * Check if a date is expired
 */
export function isExpired(expirationDate: string | Date): boolean {
    return dayjs(expirationDate).isBefore(dayjs());
}

/**
 * Check if expiring within N days
 */
export function isExpiringSoon(expirationDate: string | Date, days = 7): boolean {
    const expDate = dayjs(expirationDate);
    const now = dayjs();
    const daysUntil = expDate.diff(now, 'day');
    return daysUntil >= 0 && daysUntil <= days;
}
