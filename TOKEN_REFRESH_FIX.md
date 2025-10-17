# Token Refresh Fix - Complete Guide

## Issue Summary
The UI was not properly handling token refresh when the access token expired. The root causes were:
1. **Inconsistent token keys**: Login stored as `accessToken` while token service expected `authToken`
2. **No automatic retry**: Failed requests were not retried after token refresh
3. **Missing logging**: No visibility into token refresh process
4. **Token sync issues**: loginData not updated when tokens were refreshed

## Changes Made

### 1. Fixed Token Key Consistency
**File**: `client/src/utils/tokenService.js`

- Changed `ACCESS_TOKEN_KEY` from `'authToken'` to `'accessToken'` to match login behavior
- Removed backward compatibility code that was causing confusion
- Added proper error handling in `setAccessToken()` to sync with loginData

```javascript
// Before
const ACCESS_TOKEN_KEY = 'authToken';
export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem('accessToken');
}

// After
const ACCESS_TOKEN_KEY = 'accessToken';
export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}
```

### 2. Enhanced Refresh Token Service
**File**: `client/src/utils/refreshTokenService.js`

- Added detailed console logging for debugging
- Improved error handling with more specific error messages
- Better error text extraction from failed responses

**Key improvements:**
- Logs when refresh starts: `[RefreshToken] Attempting to refresh access token...`
- Logs on success: `[RefreshToken] Refresh successful, got new tokens`
- Logs errors with details: `[RefreshToken] Request failed: 401 ...`

### 3. Enhanced Axios Interceptor
**File**: `client/src/utils/axiosInstance.js`

- Added comprehensive logging to track token refresh flow
- Improved error messages for debugging
- Better handling of queued requests during refresh

**Logging added:**
- `[AxiosInterceptor] 401 error detected, attempting token refresh...`
- `[AxiosInterceptor] Refresh in progress, queuing request...`
- `[AxiosInterceptor] Token refreshed successfully, retrying original request`
- `[AxiosInterceptor] Already retried, clearing tokens and redirecting to login`

### 4. Token Storage Synchronization
**File**: `client/src/utils/tokenService.js`

The `setAccessToken()` function now properly updates the `loginData` object to keep all token references in sync:

```javascript
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
```

## How Token Refresh Works Now

### Flow Diagram
```
User Request → Axios Request Interceptor → Add Bearer Token
                                          ↓
                                  API Request Sent
                                          ↓
                          ┌───────────────┴────────────────┐
                          │                                │
                    Response OK                      401 Unauthorized
                          │                                │
                    Return Data                    Check if already retried?
                                                           │
                                          ┌────────────────┴────────────────┐
                                          │                                 │
                                    Already retried                  First attempt
                                          │                                 │
                                  Clear tokens & logout          Check if refresh in progress?
                                                                           │
                                          ┌────────────────┬───────────────┘
                                          │                │
                                   Refresh in progress   Not refreshing
                                          │                │
                                   Queue request      Call refresh token API
                                          │                │
                                   Wait for refresh   Get new access token
                                          │                │
                                   ├─────┴────────────────┘
                                   │
                           New token received?
                                   │
                    ┌──────────────┴──────────────┐
                    │                              │
               Yes - Success                   No - Failed
                    │                              │
            Update stored token          Clear tokens & logout
                    │
            Retry all queued requests
                    │
            Return responses
```

### Step-by-Step Process

1. **Request Sent**: User makes an API call using `axiosInstance`
2. **Token Added**: Request interceptor adds `Bearer <accessToken>` header
3. **401 Received**: Server returns 401 (token expired)
4. **Refresh Check**: Response interceptor checks if refresh is needed
5. **Queue Check**: If refresh already in progress, queue the request
6. **Refresh Token**: Call `/api/v1/auth/refresh-token` with refresh token
7. **Update Token**: Store new access token in localStorage and loginData
8. **Retry Request**: Retry original request with new token
9. **Process Queue**: Retry all queued requests with new token
10. **Return Response**: Original API call completes successfully

### Example Console Output (Success)
```
[AxiosInterceptor] 401 error detected, attempting token refresh...
[RefreshToken] Attempting to refresh access token...
[RefreshToken] Refresh successful, got new tokens
[AxiosInterceptor] Token refreshed successfully, retrying original request
```

### Example Console Output (Failure)
```
[AxiosInterceptor] 401 error detected, attempting token refresh...
[RefreshToken] Attempting to refresh access token...
[RefreshToken] Request failed: 401 Invalid or expired refresh token
[RefreshToken] Failed: Refresh failed with status 401
[AxiosInterceptor] Token refresh returned null, logging out
```

## Testing the Fix

### 1. Test Token Refresh
```javascript
// In browser console:

// 1. Check current token
console.log('Current token:', localStorage.getItem('accessToken'));

// 2. Make an API call
fetch('http://localhost:9001/api/v1/user/profile', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('accessToken') }
}).then(r => r.json()).then(console.log);

// 3. Wait for token to expire (or manually set an expired token)
localStorage.setItem('accessToken', 'expired_token_here');

// 4. Make another API call - should auto-refresh
fetch('http://localhost:9001/api/v1/user/profile', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('accessToken') }
}).then(r => r.json()).then(console.log);
```

### 2. Test Using the App
1. Login to the application
2. Use the app normally
3. Wait for the access token to expire (default: 15 minutes)
4. Make any API call (view dashboard, user profile, RBAC page, etc.)
5. Check browser console for refresh logs
6. Verify the request succeeds after refresh

### 3. Test with RBAC Page
1. Navigate to "RBAC Management" page
2. Let token expire
3. Try to fetch roles or permissions
4. Should see automatic refresh in console and data loads successfully

## Token Expiration Times

### Backend Configuration
Check `server/api-auth/src/services/jwtService.js`:

```javascript
// Access Token (short-lived)
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' }); // 15 minutes
};

// Refresh Token (long-lived)
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' }); // 7 days
};
```

### Adjust Expiration (if needed)
To test token refresh quickly, temporarily reduce access token expiration:

```javascript
// For testing - expires in 1 minute
expiresIn: '1m'

// For production - typical values
expiresIn: '15m' // or '1h', '24h', etc.
```

## Troubleshooting

### Issue: Token not refreshing
**Check:**
1. Open browser console
2. Look for `[RefreshToken]` and `[AxiosInterceptor]` logs
3. Check if refresh token exists: `localStorage.getItem('refreshToken')`
4. Verify backend refresh endpoint is working (see Postman collection)

### Issue: Continuous login redirects
**Check:**
1. Verify login sets both tokens: `localStorage.getItem('accessToken')` and `localStorage.getItem('refreshToken')`
2. Check if refresh token is expired (7 days default)
3. Look for error in console logs

### Issue: 401 error not triggering refresh
**Check:**
1. Ensure you're using `axiosInstance` from `utils/axiosInstance.js`
2. Not using plain `axios` or `fetch` directly
3. Check that the URL doesn't include auth endpoints (login, register, refresh-token)

### Issue: Multiple refresh calls
**Check:**
1. The `isRefreshing` flag should prevent this
2. Look for `[AxiosInterceptor] Refresh in progress, queuing request...` logs
3. If you see this, queuing is working correctly

## Files Changed

### Modified Files
1. ✅ `client/src/utils/tokenService.js` - Fixed token key and sync
2. ✅ `client/src/utils/refreshTokenService.js` - Added logging and error handling
3. ✅ `client/src/utils/axiosInstance.js` - Enhanced interceptor with logging

### Files to Update (If Using Direct fetch/axios)
If any services are still using direct `fetch` or `axios` instead of `axiosInstance`, they should be updated:

```javascript
// ❌ Don't do this
import axios from 'axios';
axios.get('/api/v1/users');

// ❌ Don't do this
fetch('/api/v1/users', {
  headers: { 'Authorization': 'Bearer ' + token }
});

// ✅ Do this instead
import axiosInstance from '@/utils/axiosInstance';
axiosInstance.get('/users'); // No need to add token manually
```

## Backend Requirements

### Refresh Token Endpoint
**Endpoint**: `POST /api/v1/auth/refresh-token`

**Request:**
```json
{
  "token": "<refresh_token>"
}
```

**Success Response (200):**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "userData": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

**Error Response (401/403):**
```json
{
  "message": "Invalid or expired refresh token"
}
```

## Security Considerations

### Token Storage
- ✅ Tokens stored in `localStorage` (acceptable for most use cases)
- ⚠️ For high-security apps, consider `httpOnly` cookies instead
- ✅ Tokens cleared on logout and failed refresh

### Token Lifetimes
- ✅ Access token: Short-lived (15 minutes)
- ✅ Refresh token: Longer-lived (7 days)
- ✅ Automatic logout after refresh token expires

### XSS Protection
- Use Content Security Policy (CSP)
- Sanitize user inputs
- Keep dependencies updated

### CSRF Protection
- Not needed for Bearer token auth (tokens in headers, not cookies)
- If switching to cookies, add CSRF protection

## Best Practices

### 1. Always Use axiosInstance
```javascript
// ✅ Good
import axiosInstance from '@/utils/axiosInstance';
const response = await axiosInstance.get('/users');

// ❌ Bad
import axios from 'axios';
const response = await axios.get('/api/v1/users');
```

### 2. Don't Manually Handle Tokens
```javascript
// ❌ Bad - manual token handling
const token = localStorage.getItem('accessToken');
fetch('/api/v1/users', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// ✅ Good - automatic token handling
import axiosInstance from '@/utils/axiosInstance';
axiosInstance.get('/users'); // Token added automatically
```

### 3. Handle Logout Properly
```javascript
import { clearTokens } from '@/utils/tokenService';

function logout() {
  clearTokens(); // Clears all auth data
  window.location.href = '/login';
}
```

### 4. Monitor Console Logs
Keep browser console open during development to see token refresh activity and catch issues early.

## Additional Resources

- **Postman Collection**: `RBAC_Postman_Collection.json` - Test all endpoints
- **Token Management Guide**: `TOKEN_MANAGEMENT_GUIDE.md` - Complete token management documentation
- **RBAC Documentation**: `RBAC_README.md` - RBAC system documentation

## Support

If you encounter issues:
1. Check browser console for error messages
2. Verify backend is running and accessible
3. Test refresh endpoint directly using Postman
4. Review this document's troubleshooting section
5. Check network tab for failed requests

---

**Last Updated**: October 17, 2025
**Status**: ✅ Fixed and Tested
