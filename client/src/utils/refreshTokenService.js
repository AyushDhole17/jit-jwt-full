// src/utils/refreshTokenService.js
import { getRefreshToken, setAccessToken, setRefreshToken, clearTokens } from './tokenService';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:9001/api/v1';

/**
 * Refresh the access token using the refresh token
 * This should only be called when we get a 401 error
 */
export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    console.warn('[RefreshToken] No refresh token available');
    clearTokens();
    return null;
  }

  console.log('[RefreshToken] Attempting to refresh access token...');

  try {
    // Use fetch directly to avoid axios interceptor loop
    const res = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: refreshToken })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[RefreshToken] Request failed:', res.status, errorText);
      throw new Error(`Refresh failed with status ${res.status}`);
    }

    const data = await res.json();
    console.log('[RefreshToken] Refresh successful, got new tokens');

    if (data?.accessToken) {
      setAccessToken(data.accessToken);
    }
    if (data?.refreshToken) {
      setRefreshToken(data.refreshToken);
    }

    return data?.accessToken ?? null;
  } catch (err) {
    console.error('[RefreshToken] Failed:', err.message);
    clearTokens();
    return null;
  }
}
