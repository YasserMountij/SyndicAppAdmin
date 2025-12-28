/**
 * API URL from environment
 */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Default pagination limit
 */
export const DEFAULT_LIMIT = 20;

/**
 * Residence status options for filtering
 */
export const RESIDENCE_STATUS_OPTIONS = [
    { label: 'All', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Expired', value: 'expired' },
    { label: 'Expiring Soon', value: 'expiring' },
] as const;

/**
 * User filter options
 */
export const USER_FILTER_OPTIONS = {
    demo: [
        { label: 'All Users', value: '' },
        { label: 'Demo Only', value: 'true' },
        { label: 'Real Only', value: 'false' },
    ],
    banned: [
        { label: 'All', value: '' },
        { label: 'Banned', value: 'true' },
        { label: 'Active', value: 'false' },
    ],
} as const;

/**
 * Notification target types
 */
export const NOTIFICATION_TARGETS = [
    { label: 'All Users', value: 'all' },
    { label: 'Specific Residence', value: 'residence' },
    { label: 'Specific User', value: 'user' },
] as const;

/**
 * Member roles
 */
export const MEMBER_ROLES = [
    { label: 'Syndic', value: 'SYNDIC' },
    { label: 'Resident', value: 'RESIDENT' },
] as const;
