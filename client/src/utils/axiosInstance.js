import axios from 'axios';
import { getAccessToken, setAccessToken, clearTokens } from './tokenService';
import { refreshAccessToken } from './refreshTokenService';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:9001/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor - Add access token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    // Skip token for auth endpoints
    if (config.url?.includes('/auth/login') || config.url?.includes('/auth/register')) {
      return config;
    }

    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle token refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or request is to auth endpoints, reject immediately
    if (
      error.response?.status !== 401 ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh-token')
    ) {
      return Promise.reject(error);
    }

    console.log('[AxiosInterceptor] 401 error detected, attempting token refresh...');

    // If already tried to refresh, logout
    if (originalRequest._retry) {
      console.log('[AxiosInterceptor] Already retried, clearing tokens and redirecting to login');
      clearTokens();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // If currently refreshing, queue this request
    if (isRefreshing) {
      console.log('[AxiosInterceptor] Refresh in progress, queuing request...');
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          console.log('[AxiosInterceptor] Retrying queued request with new token');
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    // Mark as retrying and start refresh
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        console.log('[AxiosInterceptor] Token refreshed successfully, retrying original request');
        setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        return axiosInstance(originalRequest);
      } else {
        console.log('[AxiosInterceptor] Token refresh returned null, logging out');
        processQueue(new Error('Token refresh failed'), null);
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    } catch (refreshError) {
      console.error('[AxiosInterceptor] Token refresh error:', refreshError);
      processQueue(refreshError, null);
      clearTokens();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
