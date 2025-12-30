import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { apiClient } from '../client';
import { queryKeys } from '../keys';
import type { ApiError } from './useStats';

// ============================================
// OTP Types
// ============================================

export interface PendingOtp {
    phoneNumber: string;
    code: string;
}

// ============================================
// Response Types
// ============================================

interface GetOtpsResponse {
    otps: PendingOtp[];
}

// ============================================
// OTPs Hooks
// ============================================

/**
 * Get all pending OTPs with auto-refresh
 * OTPs are cleared from Redis after reading
 */
export const useOtps = () => {
    return useQuery<GetOtpsResponse, AxiosError<ApiError>>({
        queryKey: queryKeys.otps.list(),
        queryFn: async () => {
            const response = await apiClient.get<GetOtpsResponse>('/otps');
            return response.data;
        },
        refetchInterval: 5000, // Auto-refresh every 5 seconds
    });
};
