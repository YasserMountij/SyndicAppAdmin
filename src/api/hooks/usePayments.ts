import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { apiClient } from '../client';
import { queryKeys } from '../keys';
import type { ApiError } from './useStats';

// ============================================
// Payment Types
// ============================================

export interface SubscriptionPayment {
    id: string;
    amount: number;
    note: string | null;
    residenceId: string;
    paidAt: string;
    createdAt: string;
    updatedAt: string;
    residence?: {
        id: string;
        name: string;
    };
}

export interface CreatePaymentInput {
    residenceId: string;
    amount: number;
    paidAt: string;
    note?: string;
    extendMonths?: number;
}

export interface UpdatePaymentInput {
    amount?: number;
    paidAt?: string;
    note?: string;
}

// ============================================
// Response Types
// ============================================

interface GetPaymentsResponse {
    payments: SubscriptionPayment[];
    nextCursor: string | null;
    hasMore: boolean;
    totalCount: number;
}

interface GetPaymentsParams {
    residenceId?: string;
    limit?: number;
}

// ============================================
// Payments Hooks
// ============================================

/**
 * Get payments with infinite scroll
 */
export const usePayments = (params: GetPaymentsParams = {}) => {
    const { residenceId, limit = 20 } = params;

    return useInfiniteQuery<GetPaymentsResponse, AxiosError<ApiError>>({
        queryKey: queryKeys.payments.list({ residenceId }),
        queryFn: async ({ pageParam }) => {
            const response = await apiClient.get<GetPaymentsResponse>('/payments', {
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
    });
};

/**
 * Create a new payment (optionally extends subscription)
 */
export const useCreatePayment = () => {
    const queryClient = useQueryClient();

    return useMutation<SubscriptionPayment, AxiosError<ApiError>, CreatePaymentInput>({
        mutationFn: async (data) => {
            const response = await apiClient.post<SubscriptionPayment>('/payments', data);
            return response.data;
        },
        onSuccess: (_, { residenceId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.residences.detail(residenceId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
        },
    });
};

/**
 * Update a payment
 */
export const useUpdatePayment = () => {
    const queryClient = useQueryClient();

    return useMutation<
        SubscriptionPayment,
        AxiosError<ApiError>,
        { paymentId: string; data: UpdatePaymentInput }
    >({
        mutationFn: async ({ paymentId, data }) => {
            const response = await apiClient.patch<SubscriptionPayment>(`/payments/${paymentId}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
        },
    });
};

/**
 * Delete a payment
 */
export const useDeletePayment = () => {
    const queryClient = useQueryClient();

    return useMutation<void, AxiosError<ApiError>, string>({
        mutationFn: async (paymentId) => {
            await apiClient.delete(`/payments/${paymentId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
        },
    });
};
