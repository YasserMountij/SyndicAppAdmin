import axios from 'axios';
import { API_URL } from '@/utils/constants';

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
    withCredentials: true, // Include cookies for Cloudflare Access
});

/**
 * Request interceptor for logging and error handling
 */
apiClient.interceptors.request.use(
    (config) => {
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

        // Handle 401 Unauthorized
        if (status === 401) {
            console.error('[API] 401 Unauthorized - Check Cloudflare Access configuration');
        }

        // Handle 403 Forbidden
        if (status === 403) {
            console.error('[API] 403 Forbidden - Access denied');
        }

        return Promise.reject(error);
    }
);
