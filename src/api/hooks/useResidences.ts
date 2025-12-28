import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { apiClient } from '../client';
import { queryKeys } from '../keys';
import type { ApiError } from './useStats';

// ============================================
// Residence Types
// ============================================

export type ResidenceStatus = 'ACTIVE' | 'INACTIVE';

export interface ResidenceLimits {
    maxBuildings: number;
    maxApartments: number;
    maxMembers: number;
    maxCategories: number;
    maxContacts: number;
    maxStorageBytes: number;
}

/**
 * Default limits for reference in the UI
 */
export const DEFAULT_LIMITS: ResidenceLimits = {
    maxBuildings: 15,
    maxApartments: 100,
    maxMembers: 50,
    maxCategories: 20,
    maxContacts: 50,
    maxStorageBytes: 1073741824, // 1 GB
};

/**
 * Demo limits for reference in the UI
 */
export const DEMO_LIMITS: ResidenceLimits = {
    maxBuildings: 5,
    maxApartments: 20,
    maxMembers: 10,
    maxCategories: 5,
    maxContacts: 10,
    maxStorageBytes: 104857600, // 100 MB
};

/**
 * Limit field metadata for dynamic form rendering
 */
export interface LimitFieldMeta {
    key: keyof ResidenceLimits;
    label: string;
    description: string;
    min: number;
    max: number;
    step: number;
    formatter?: (value: number) => string;
    parser?: (value: string) => number;
}

export const LIMIT_FIELDS: LimitFieldMeta[] = [
    {
        key: 'maxBuildings',
        label: 'Max Buildings',
        description: 'Maximum number of buildings in the residence',
        min: 1,
        max: 100,
        step: 1,
    },
    {
        key: 'maxApartments',
        label: 'Max Apartments',
        description: 'Maximum total apartments across all buildings',
        min: 1,
        max: 1000,
        step: 10,
    },
    {
        key: 'maxMembers',
        label: 'Max Members',
        description: 'Maximum number of members (syndics + residents)',
        min: 1,
        max: 500,
        step: 5,
    },
    {
        key: 'maxCategories',
        label: 'Max Categories',
        description: 'Maximum number of expense categories',
        min: 1,
        max: 50,
        step: 1,
    },
    {
        key: 'maxContacts',
        label: 'Max Contacts',
        description: 'Maximum number of contacts/suppliers',
        min: 1,
        max: 100,
        step: 5,
    },
    {
        key: 'maxStorageBytes',
        label: 'Max Storage',
        description: 'Maximum storage space for documents',
        min: 10485760, // 10 MB
        max: 10737418240, // 10 GB
        step: 104857600, // 100 MB steps
        formatter: (value) => `${Math.round(value / 1048576)} MB`,
        parser: (value) => parseInt(value.replace(' MB', '')) * 1048576,
    },
];

export interface Residence {
    id: string;
    name: string;
    address: string | null;
    status: ResidenceStatus;
    expirationDate: string;
    limits: ResidenceLimits;
    isDemo: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: {
        members: number;
        buildings: number;
        apartments: number;
        contributions?: number;
        expenses?: number;
        documents?: number;
    };
}

// ResidenceWithDetails is now equivalent to Residence since members, 
// invitations, and payments are fetched separately
export type ResidenceWithDetails = Residence;

export interface ResidenceMember {
    id: string;
    role: 'SYNDIC' | 'RESIDENT';
    joinedAt: string;
    user: {
        id: string;
        name: string;
        phoneNumber: string | null;
        isBanned: boolean;
    };
}

export interface CreateResidenceInput {
    name: string;
    address?: string;
    expirationDate: string;
    isDemo?: boolean;
    limits?: Partial<ResidenceLimits>;
}

export interface UpdateResidenceInput {
    name?: string;
    address?: string;
    expirationDate?: string;
    isDemo?: boolean;
    limits?: Partial<ResidenceLimits>;
}

export interface CreateDemoResidenceInput {
    name?: string;
    address?: string;
    syndicPhoneNumber: string;
}

// ============================================
// Response Types
// ============================================

interface GetResidencesResponse {
    residences: Residence[];
    nextCursor: string | null;
    hasMore: boolean;
    totalCount: number;
}

interface GetResidencesParams {
    search?: string;
    status?: string;
    isDemo?: boolean;
    limit?: number;
}

// ============================================
// Residences Hooks
// ============================================

/**
 * Get residences with infinite scroll
 */
export const useResidences = (params: GetResidencesParams = {}) => {
    const { search, status, isDemo, limit = 20 } = params;

    return useInfiniteQuery<GetResidencesResponse, AxiosError<ApiError>>({
        queryKey: queryKeys.residences.list({ search, status, isDemo }),
        queryFn: async ({ pageParam }) => {
            const response = await apiClient.get<GetResidencesResponse>('/residences', {
                params: {
                    search: search || undefined,
                    status: status || undefined,
                    isDemo: isDemo !== undefined ? isDemo : undefined,
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
 * Get a single residence by ID
 */
export const useResidence = (residenceId: string) => {
    return useQuery<ResidenceWithDetails, AxiosError<ApiError>>({
        queryKey: queryKeys.residences.detail(residenceId),
        queryFn: async () => {
            const response = await apiClient.get<ResidenceWithDetails>(`/residences/${residenceId}`);
            return response.data;
        },
        enabled: !!residenceId,
    });
};

/**
 * Create a new residence
 */
export const useCreateResidence = () => {
    const queryClient = useQueryClient();

    return useMutation<Residence, AxiosError<ApiError>, CreateResidenceInput>({
        mutationFn: async (data) => {
            const response = await apiClient.post<Residence>('/residences', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.residences.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
        },
    });
};

/**
 * Update a residence
 */
export const useUpdateResidence = () => {
    const queryClient = useQueryClient();

    return useMutation<
        Residence,
        AxiosError<ApiError>,
        { residenceId: string; data: UpdateResidenceInput }
    >({
        mutationFn: async ({ residenceId, data }) => {
            const response = await apiClient.patch<Residence>(`/residences/${residenceId}`, data);
            return response.data;
        },
        onSuccess: (_, { residenceId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.residences.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.residences.detail(residenceId) });
        },
    });
};

/**
 * Delete a residence
 */
export const useDeleteResidence = () => {
    const queryClient = useQueryClient();

    return useMutation<void, AxiosError<ApiError>, string>({
        mutationFn: async (residenceId) => {
            await apiClient.delete(`/residences/${residenceId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.residences.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
        },
    });
};
