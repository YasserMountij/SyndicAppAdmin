import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { apiClient } from '../client';
import { queryKeys } from '../keys';
import type { ApiError } from './useStats';

// ============================================
// Deletion Request Types
// ============================================

export interface DeletionRequest {
    id: string;
    reason: string;
    details: string | null;
    userId: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
        phoneNumber: string | null;
        createdAt: string;
        residencyMembers: {
            residence: {
                id: string;
                name: string;
            };
        }[];
    };
}

// ============================================
// Response Types
// ============================================

interface GetRequestsResponse {
    requests: DeletionRequest[];
    nextCursor: string | null;
    hasMore: boolean;
    totalCount: number;
}

// ============================================
// Deletion Requests Hooks
// ============================================

/**
 * Get deletion requests with infinite scroll
 */
export const useDeletionRequests = () => {
    return useInfiniteQuery<GetRequestsResponse, AxiosError<ApiError>>({
        queryKey: queryKeys.deletionRequests.list(),
        queryFn: async ({ pageParam }) => {
            const response = await apiClient.get<GetRequestsResponse>('/deletion-requests', {
                params: {
                    cursor: pageParam as string | undefined,
                    limit: 20,
                },
            });
            return response.data;
        },
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialPageParam: undefined as string | undefined,
    });
};

/**
 * Process a deletion request (deletes the user)
 */
export const useProcessDeletionRequest = () => {
    const queryClient = useQueryClient();

    return useMutation<void, AxiosError<ApiError>, string>({
        mutationFn: async (requestId) => {
            await apiClient.post(`/deletion-requests/${requestId}/process`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.deletionRequests.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
        },
    });
};
