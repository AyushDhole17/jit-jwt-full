const ACCESS_TOKEN_KEY = 'accessToken'; // Use the same key as login
const REFRESH_TOKEN_KEY = 'refreshToken';
const LOGIN_DATA_KEY = 'loginData';
const USER_DATA_KEY = 'userData';

export const LOGIN_ROUTE = '/login';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}
export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setAccessToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  // Also update loginData to keep it in sync
  try {
    const raw = localStorage.getItem(LOGIN_DATA_KEY);
    if (raw) {
      const obj = JSON.parse(raw);
      if (obj && typeof obj === 'object') {
        obj.accessToken = token;
        localStorage.setItem(LOGIN_DATA_KEY, JSON.stringify(obj));
      }
    }
  } catch (e) {
    console.error('Error updating loginData:', e);
  }
}
export function setRefreshToken(token) {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}
export function setTokens({ accessToken, refreshToken }) {
  if (accessToken) setAccessToken(accessToken);
  if (refreshToken) setRefreshToken(refreshToken);
}

/**
 * Hard clear of *all* auth-related keys.
 * Used for tamper, refresh failure, and logout.
 */
export function clearTokens() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(LOGIN_DATA_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  } catch {}
}
