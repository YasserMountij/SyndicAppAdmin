import { createContext, useContext, type ReactNode } from 'react';
import { useCurrentAdmin, useLogin, useLogout, type AdminUser, type LoginInput } from '@/api/hooks/useAdminAuth';
import { getAuthToken } from '@/api/client';

interface AuthContextType {
    user: AdminUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isSuperAdmin: boolean;
    login: (data: LoginInput) => Promise<void>;
    logout: () => Promise<void>;
    loginError: string | null;
    isLoggingIn: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { data, isLoading, error } = useCurrentAdmin();
    const loginMutation = useLogin();
    const logoutMutation = useLogout();

    // Check if we have a token (for initial state)
    const hasToken = !!getAuthToken();

    const user = data?.admin ?? null;
    const isAuthenticated = !!user;
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    const login = async (loginData: LoginInput) => {
        await loginMutation.mutateAsync(loginData);
    };

    const logout = async () => {
        await logoutMutation.mutateAsync();
    };

    // Extract login error message
    const loginError = loginMutation.error?.response?.data?.error?.message
        ?? loginMutation.error?.message
        ?? null;

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading: hasToken && isLoading && !error,
                isAuthenticated,
                isSuperAdmin,
                login,
                logout,
                loginError,
                isLoggingIn: loginMutation.isPending,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
