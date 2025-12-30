// Stats hooks and types
export {
    useDashboardStats,
    useUsersOverTime,
    useRevenueOverTime,
    useRecentActivity,
} from './useStats';
export type {
    ApiError,
    DashboardStats,
    ChartDataPoint,
    RecentActivity,
    RecentPayment,
    RecentUser,
    RecentResidence,
    ExpiringSoonResidence,
} from './useStats';

// Residences hooks and types
export {
    useResidences,
    useResidence,
    useCreateResidence,
    useUpdateResidence,
    useDeleteResidence,
    DEFAULT_LIMITS,
    DEMO_LIMITS,
    LIMIT_FIELDS,
} from './useResidences';
export type {
    Residence,
    ResidenceWithDetails,
    ResidenceStatus,
    ResidenceLimits,
    LimitFieldMeta,
    ResidenceMember,
    CreateResidenceInput,
    UpdateResidenceInput,
    CreateDemoResidenceInput,
} from './useResidences';

// Payments hooks and types
export {
    usePayments,
    useCreatePayment,
    useUpdatePayment,
    useDeletePayment,
} from './usePayments';
export type {
    SubscriptionPayment,
    CreatePaymentInput,
    UpdatePaymentInput,
} from './usePayments';

// Users hooks and types
export {
    useUsers,
    useUser,
    useBanUser,
    useUnbanUser,
    useDeleteUser,
} from './useUsers';
export type {
    User,
    UserWithDetails,
    BanUserInput,
} from './useUsers';

// Deletion requests hooks and types
export {
    useDeletionRequests,
    useProcessDeletionRequest,
} from './useDeletionRequests';
export type {
    DeletionRequest,
} from './useDeletionRequests';

// Invitations hooks and types
export {
    useInvitations,
    useCreateInvitation,
    useDeleteInvitation,
} from './useInvitations';
export type {
    Invitation,
    InvitationStatus,
    CreateInvitationInput,
} from './useInvitations';

// Members hooks
export {
    useMembers,
} from './useMembers';

// OTPs hooks and types
export {
    useOtps,
} from './useOtps';
export type {
    PendingOtp,
} from './useOtps';
