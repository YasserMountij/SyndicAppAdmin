import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { apiClient } from '../client';
import { queryKeys } from '../keys';
import type { ApiError } from './useStats';

// ============================================
// Invitation Types
// ============================================

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface Invitation {
    id: string;
    phoneNumber: string;
    role: 'SYNDIC' | 'RESIDENT';
    status: InvitationStatus;
    residenceId: string;
    createdAt: string;
    residence?: {
        id: string;
        name: string;
    };
}

export interface CreateInvitationInput {
    phoneNumber: string;
    role: 'SYNDIC' | 'RESIDENT';
    residenceId: string;
}

// ============================================
// Response Types
// ============================================

interface GetInvitationsResponse {
    invitations: Invitation[];
    nextCursor: string | null;
    hasMore: boolean;
    totalCount: number;
}

interface GetInvitationsParams {
    residenceId?: string;
    status?: string;
    limit?: number;
}

// ============================================
// Invitations Hooks
// ============================================

/**
 * Get invitations with infinite scroll
 */
export const useInvitations = (params: GetInvitationsParams = {}) => {
    const { residenceId, status, limit = 20 } = params;

    return useInfiniteQuery<GetInvitationsResponse, AxiosError<ApiError>>({
        queryKey: queryKeys.invitations.list({ residenceId, status }),
        queryFn: async ({ pageParam }) => {
            const response = await apiClient.get<GetInvitationsResponse>('/invitations', {
                params: {
                    residenceId: residenceId || undefined,
                    status: status || undefined,
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
 * Create an invitation
 */
export const useCreateInvitation = () => {
    const queryClient = useQueryClient();

    return useMutation<Invitation, AxiosError<ApiError>, CreateInvitationInput>({
        mutationFn: async (data) => {
            const response = await apiClient.post<Invitation>('/invitations', data);
            return response.data;
        },
        onSuccess: (_, { residenceId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.residences.detail(residenceId) });
        },
    });
};

/**
 * Delete an invitation
 */
export const useDeleteInvitation = () => {
    const queryClient = useQueryClient();

    return useMutation<void, AxiosError<ApiError>, string>({
        mutationFn: async (invitationId) => {
            await apiClient.delete(`/invitations/${invitationId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });
        },
    });
};
