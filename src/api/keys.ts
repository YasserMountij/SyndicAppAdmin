/**
 * Centralized Query Keys for React Query
 * Following the same pattern as mobile app
 */

export const queryKeys = {
    // Dashboard stats
    stats: {
        all: ['stats'] as const,
        dashboard: () => [...queryKeys.stats.all, 'dashboard'] as const,
        usersOverTime: (months?: number) => [...queryKeys.stats.all, 'usersOverTime', months] as const,
        revenueOverTime: (months?: number) => [...queryKeys.stats.all, 'revenueOverTime', months] as const,
        recent: () => [...queryKeys.stats.all, 'recent'] as const,
    },

    // Residences
    residences: {
        all: ['residences'] as const,
        list: (params?: { search?: string; status?: string; isDemo?: boolean }) =>
            [...queryKeys.residences.all, 'list', params] as const,
        detail: (id: string) => [...queryKeys.residences.all, 'detail', id] as const,
    },

    // Payments
    payments: {
        all: ['payments'] as const,
        list: (params?: { residenceId?: string }) =>
            [...queryKeys.payments.all, 'list', params] as const,
    },

    // Users
    users: {
        all: ['users'] as const,
        list: (params?: { search?: string; isBanned?: boolean }) =>
            [...queryKeys.users.all, 'list', params] as const,
        detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
    },

    // Deletion requests
    deletionRequests: {
        all: ['deletionRequests'] as const,
        list: () => [...queryKeys.deletionRequests.all, 'list'] as const,
    },

    // Invitations
    invitations: {
        all: ['invitations'] as const,
        list: (params?: { residenceId?: string; status?: string }) =>
            [...queryKeys.invitations.all, 'list', params] as const,
    },

    // Members
    members: {
        all: ['members'] as const,
        list: (params?: { residenceId?: string }) =>
            [...queryKeys.members.all, 'list', params] as const,
    },

    // Admin Auth
    adminAuth: {
        all: ['adminAuth'] as const,
        me: ['adminAuth', 'me'] as const,
    },

    // Admin Users Management
    adminUsers: {
        all: ['adminUsers'] as const,
        list: () => [...queryKeys.adminUsers.all, 'list'] as const,
    },

    // OTPs
    otps: {
        all: ['otps'] as const,
        list: () => [...queryKeys.otps.all, 'list'] as const,
    },
} as const;
