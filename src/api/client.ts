import axios from 'axios';
import { API_URL } from '@/utils/constants';

// Token management
const TOKEN_KEY = 'admin_auth_token';

export const getAuthToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
};

/**
 * Axios instance configured for the Admin API
 * All requests go to /api/admin/*
 */
export const apiClient = axios.create({
    baseURL: `${API_URL}/api/admin`,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Request interceptor for auth token and logging
 */
apiClient.interceptors.request.use(
    (config) => {
        // Add auth token if available
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log requests in development
        if (import.meta.env.DEV) {
            console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response interceptor for error handling
 */
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.error?.message || error.message;

        // Log errors
        console.error('[API Error]', {
            url: error.config?.url,
            method: error.config?.method,
            status,
            message,
        });

        // Handle 401 Unauthorized - redirect to login
        if (status === 401) {
            // Only redirect if not already on login page
            if (!window.location.pathname.includes('/login')) {
                clearAuthToken();
                window.location.href = '/login';
            }
        }

        // Handle 403 Forbidden
        if (status === 403) {
            console.error('[API] 403 Forbidden - Access denied');
        }

        return Promise.reject(error);
    }
);
