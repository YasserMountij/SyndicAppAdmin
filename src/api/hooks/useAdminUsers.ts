import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { apiClient } from '../client';
import { queryKeys } from '../keys';
import type { ApiError } from './useStats';
import type { AdminUser, AdminRole } from './useAdminAuth';

// ============================================
// Admin Users Types
// ============================================

export interface CreateAdminInput {
    email: string;
    password: string;
    name: string;
}

interface GetAdminUsersResponse {
    admins: AdminUser[];
}

interface CreateAdminResponse {
    admin: AdminUser;
}

// ============================================
// Admin Users Hooks
// ============================================

/**
 * Get all admin users
 */
export const useAdminUsers = () => {
    return useQuery<GetAdminUsersResponse, AxiosError<ApiError>>({
        queryKey: queryKeys.adminUsers.list(),
        queryFn: async () => {
            const response = await apiClient.get<GetAdminUsersResponse>('/admin-users');
            return response.data;
        },
    });
};

/**
 * Create a new admin user
 */
export const useCreateAdmin = () => {
    const queryClient = useQueryClient();

    return useMutation<CreateAdminResponse, AxiosError<ApiError>, CreateAdminInput>({
        mutationFn: async (data) => {
            const response = await apiClient.post<CreateAdminResponse>('/admin-users', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
        },
    });
};

/**
 * Delete an admin user
 */
export const useDeleteAdmin = () => {
    const queryClient = useQueryClient();

    return useMutation<void, AxiosError<ApiError>, string>({
        mutationFn: async (adminId) => {
            await apiClient.delete(`/admin-users/${adminId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
        },
    });
};

// Re-export types for convenience
export type { AdminUser, AdminRole };
