import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { apiClient } from '../client';
import { queryKeys } from '../keys';

// ============================================
// Stats Types
// ============================================

export interface ApiError {
    error: {
        message: string;
        code?: string;
    };
}

export interface DashboardStats {
    users: {
        total: number;
        thisMonth: number;
    };
    residences: {
        total: number;
        active: number;
        expiringSoon: number;
    };
    deletionRequests: {
        pending: number;
    };
    revenue: {
        thisMonth: number;
        total: number;
    };
}

export interface ChartDataPoint {
    month: string;
    count?: number;
    total?: number;
}

export interface RecentPayment {
    id: string;
    amount: number;
    paidAt: string;
    createdAt: string;
    residence: { name: string };
}

export interface RecentUser {
    id: string;
    name: string;
    phoneNumber: string | null;
    createdAt: string;
}

export interface RecentResidence {
    id: string;
    name: string;
    createdAt: string;
}

export interface ExpiringSoonResidence {
    id: string;
    name: string;
    expirationDate: string;
}

export interface RecentActivity {
    recentPayments: RecentPayment[];
    recentUsers: RecentUser[];
    recentResidences: RecentResidence[];
    expiringSoon: ExpiringSoonResidence[];
}

// ============================================
// Stats Hooks
// ============================================

/**
 * Get dashboard statistics
 */
export const useDashboardStats = () => {
    return useQuery<DashboardStats, AxiosError<ApiError>>({
        queryKey: queryKeys.stats.dashboard(),
        queryFn: async () => {
            const response = await apiClient.get<DashboardStats>('/stats');
            return response.data;
        },
    });
};

/**
 * Get user growth over time
 */
export const useUsersOverTime = (months = 6) => {
    return useQuery<ChartDataPoint[], AxiosError<ApiError>>({
        queryKey: queryKeys.stats.usersOverTime(months),
        queryFn: async () => {
            const response = await apiClient.get<ChartDataPoint[]>('/stats/users-over-time', {
                params: { months },
            });
            return response.data;
        },
    });
};

/**
 * Get revenue over time
 */
export const useRevenueOverTime = (months = 6) => {
    return useQuery<ChartDataPoint[], AxiosError<ApiError>>({
        queryKey: queryKeys.stats.revenueOverTime(months),
        queryFn: async () => {
            const response = await apiClient.get<ChartDataPoint[]>('/stats/revenue-over-time', {
                params: { months },
            });
            return response.data;
        },
    });
};

/**
 * Get recent activity
 */
export const useRecentActivity = () => {
    return useQuery<RecentActivity, AxiosError<ApiError>>({
        queryKey: queryKeys.stats.recent(),
        queryFn: async () => {
            const response = await apiClient.get<RecentActivity>('/stats/recent');
            return response.data;
        },
    });
};
