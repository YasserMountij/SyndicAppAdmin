import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { apiClient, setAuthToken, clearAuthToken } from '../client';
import { queryKeys } from '../keys';
import type { ApiError } from './useStats';

// ============================================
// Admin Auth Types
// ============================================

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN';

export interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: AdminRole;
    createdAt?: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

interface LoginResponse {
    token: string;
    admin: AdminUser;
}

interface GetMeResponse {
    admin: AdminUser;
}

// ============================================
// Admin Auth Hooks
// ============================================

/**
 * Get current admin user
 */
export const useCurrentAdmin = () => {
    return useQuery<GetMeResponse, AxiosError<ApiError>>({
        queryKey: queryKeys.adminAuth.me,
        queryFn: async () => {
            const response = await apiClient.get<GetMeResponse>('/auth/me');
            return response.data;
        },
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

/**
 * Login mutation
 */
export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation<LoginResponse, AxiosError<ApiError>, LoginInput>({
        mutationFn: async (data) => {
            const response = await apiClient.post<LoginResponse>('/auth/login', data);
            return response.data;
        },
        onSuccess: (data) => {
            // Store token
            setAuthToken(data.token);
            // Update current admin in cache
            queryClient.setQueryData(queryKeys.adminAuth.me, { admin: data.admin });
        },
    });
};

/**
 * Logout mutation
 */
export const useLogout = () => {
    const queryClient = useQueryClient();

    return useMutation<void, AxiosError<ApiError>>({
        mutationFn: async () => {
            await apiClient.post('/auth/logout');
        },
        onSuccess: () => {
            // Clear token
            clearAuthToken();
            // Clear all queries
            queryClient.clear();
        },
        onError: () => {
            // Even on error, clear local state
            clearAuthToken();
            queryClient.clear();
        },
    });
};
