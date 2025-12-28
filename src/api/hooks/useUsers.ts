import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { apiClient } from '../client';
import { queryKeys } from '../keys';
import type { ApiError } from './useStats';

// ============================================
// User Types
// ============================================

export interface User {
    id: string;
    name: string;
    email: string;
    phoneNumber: string | null;
    isBanned: boolean;
    bannedAt: string | null;
    banReason: string | null;
    createdAt: string;
    updatedAt: string;
    _count?: {
        residencyMembers: number;
    };
}

export interface UserWithDetails extends User {
    residencyMembers: {
        id: string;
        role: 'SYNDIC' | 'RESIDENT';
        residence: {
            id: string;
            name: string;
        };
    }[];
}

export interface BanUserInput {
    reason: string;
}

// ============================================
// Response Types
// ============================================

interface GetUsersResponse {
    users: User[];
    nextCursor: string | null;
    hasMore: boolean;
    totalCount: number;
}

interface GetUsersParams {
    search?: string;
    isBanned?: boolean;
    limit?: number;
}

// ============================================
// Users Hooks
// ============================================

/**
 * Get users with infinite scroll
 */
export const useUsers = (params: GetUsersParams = {}) => {
    const { search, isBanned, limit = 20 } = params;

    return useInfiniteQuery<GetUsersResponse, AxiosError<ApiError>>({
        queryKey: queryKeys.users.list({ search, isBanned }),
        queryFn: async ({ pageParam }) => {
            const response = await apiClient.get<GetUsersResponse>('/users', {
                params: {
                    search: search || undefined,
                    isBanned: isBanned !== undefined ? isBanned : undefined,
                    cursor: pageParam as string | undefined,
                    limit,
                },
            });
            return response.data;
        },
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialPageParam: undefined as string | undefined,
    });
};

/**
 * Get a single user by ID
 */
export const useUser = (userId: string) => {
    return useQuery<UserWithDetails, AxiosError<ApiError>>({
        queryKey: queryKeys.users.detail(userId),
        queryFn: async () => {
            const response = await apiClient.get<UserWithDetails>(`/users/${userId}`);
            return response.data;
        },
        enabled: !!userId,
    });
};

/**
 * Ban a user
 */
export const useBanUser = () => {
    const queryClient = useQueryClient();

    return useMutation<void, AxiosError<ApiError>, { userId: string; data: BanUserInput }>({
        mutationFn: async ({ userId, data }) => {
            await apiClient.post(`/users/${userId}/ban`, data);
        },
        onSuccess: (_, { userId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
        },
    });
};

/**
 * Unban a user
 */
export const useUnbanUser = () => {
    const queryClient = useQueryClient();

    return useMutation<void, AxiosError<ApiError>, string>({
        mutationFn: async (userId) => {
            await apiClient.post(`/users/${userId}/unban`);
        },
        onSuccess: (_, userId) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
        },
    });
};

/**
 * Delete a user
 */
export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation<void, AxiosError<ApiError>, string>({
        mutationFn: async (userId) => {
            await apiClient.delete(`/users/${userId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
        },
    });
};
