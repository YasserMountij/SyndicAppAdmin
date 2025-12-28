import { useInfiniteQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { apiClient } from '../client';
import { queryKeys } from '../keys';
import type { ApiError } from './useStats';
import type { ResidenceMember } from './useResidences';

// ============================================
// Response Types
// ============================================

interface GetMembersResponse {
    members: ResidenceMember[];
    nextCursor: string | null;
    hasMore: boolean;
    totalCount: number;
}

interface GetMembersParams {
    residenceId?: string;
    limit?: number;
}

// ============================================
// Members Hooks
// ============================================

/**
 * Get members with infinite scroll
 */
export const useMembers = (params: GetMembersParams = {}) => {
    const { residenceId, limit = 20 } = params;

    return useInfiniteQuery<GetMembersResponse, AxiosError<ApiError>>({
        queryKey: queryKeys.members.list({ residenceId }),
        queryFn: async ({ pageParam }) => {
            const response = await apiClient.get<GetMembersResponse>('/members', {
                params: {
                    residenceId: residenceId || undefined,
                    cursor: pageParam as string | undefined,
                    limit,
                },
            });
            return response.data;
        },
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialPageParam: undefined as string | undefined,
        enabled: !!residenceId,
    });
};
