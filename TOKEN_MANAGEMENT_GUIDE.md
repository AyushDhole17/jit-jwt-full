# Token Management & API Integration Guide

## 🔐 Overview

The application now has a robust token management system with automatic token refresh capabilities. All API calls are handled through a centralized axios instance with interceptors.

## 🏗️ Architecture

### Token Flow

```
User Login
    ↓
Store accessToken & refreshToken
    ↓
Make API Request
    ↓
Axios Interceptor adds Bearer Token
    ↓
API Response (200 OK) → Continue
    ↓
API Response (401 Unauthorized)
    ↓
Axios Response Interceptor catches 401
    ↓
Call Refresh Token API
    ↓
Success: Update accessToken → Retry original request
    ↓
Failure: Clear tokens → Redirect to login
```

## 📁 Key Files

### 1. `/client/src/utils/axiosInstance.js`

- **Purpose**: Centralized axios instance with interceptors
- **Features**:
  - Automatic token attachment to requests
  - 401 error handling with token refresh
  - Request queuing during token refresh
  - Automatic logout on refresh failure

### 2. `/client/src/utils/tokenService.js`

- **Purpose**: Token storage management
- **Functions**:
  - `getAccessToken()` - Retrieve access token
  - `getRefreshToken()` - Retrieve refresh token
  - `setAccessToken(token)` - Store access token
  - `setRefreshToken(token)` - Store refresh token
  - `setTokens({ accessToken, refreshToken })` - Store both tokens
  - `clearTokens()` - Clear all auth data

### 3. `/client/src/utils/refreshTokenService.js`

- **Purpose**: Handle token refresh logic
- **Function**:
  - `refreshAccessToken()` - Call refresh API and update tokens

### 4. `/client/src/services/apiService.js`

- **Purpose**: Centralized API endpoints
- **Exports**:
  - `authAPI` - Authentication endpoints
  - `userAPI` - User management endpoints
  - `rbacAPI` - RBAC management endpoints

### 5. `/client/src/services/rbacService.js`

- **Purpose**: RBAC-specific service (uses axiosInstance)
- **Updated**: Now uses centralized axios instance

## 🚀 Usage

### Making API Calls

#### Option 1: Using axiosInstance directly

```javascript
import axiosInstance from "../utils/axiosInstance";

// GET request
const response = await axiosInstance.get("/user/profile");

// POST request
const response = await axiosInstance.post("/user/create", userData);

// PUT request
const response = await axiosInstance.put("/user/update/123", updateData);

// DELETE request
const response = await axiosInstance.delete("/user/delete/123");
```

#### Option 2: Using API Service (Recommended)

```javascript
import { userAPI, authAPI, rbacAPI } from "../services/apiService";

// User operations
const profile = await userAPI.getProfile();
const users = await userAPI.getAllUsers();

// Auth operations
const loginResponse = await authAPI.login({ email, password });

// RBAC operations
const roles = await rbacAPI.getAllRoles();
const permissions = await rbacAPI.getAllPermissions();
```

#### Option 3: Using specific service

```javascript
import rbacService from "../services/rbacService";

const roles = await rbacService.getAllRoles();
const permissions = await rbacService.getAllPermissions();
```

### Login Flow

```javascript
import { authAPI } from "../services/apiService";
import { setTokens } from "../utils/tokenService";

// Login
const handleLogin = async (email, password) => {
  try {
    const response = await authAPI.login({ email, password });

    // Store tokens
    setTokens({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    });

    // Store user data if needed
    localStorage.setItem("userData", JSON.stringify(response.data.user));

    // Navigate to dashboard
    navigate("/dashboard");
  } catch (error) {
    console.error("Login failed:", error);
  }
};
```

### Logout Flow

```javascript
import { clearTokens } from "../utils/tokenService";
import { authAPI } from "../services/apiService";

const handleLogout = async () => {
  try {
    // Call logout endpoint (optional)
    await authAPI.logout();
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Clear tokens regardless
    clearTokens();
    navigate("/login");
  }
};
```

## 🔄 Token Refresh Behavior

### Automatic Refresh

- Triggers when any API returns 401 (Unauthorized)
- All pending requests wait for refresh to complete
- Failed requests are retried with new token
- If refresh fails, user is logged out

### Manual Refresh (Not Recommended)

```javascript
import { refreshAccessToken } from "../utils/refreshTokenService";

const newToken = await refreshAccessToken();
if (newToken) {
  // Token refreshed successfully
} else {
  // Refresh failed, user will be logged out
}
```

## ⚙️ Configuration

### Environment Variables

Add to your `.env` file:

```env
# API Base URL
VITE_API_URL=http://localhost:9001/api/v1

# Or if different
VITE_APP_API_AUTH=http://localhost:9001/api/v1
```

### Axios Instance Configuration

Located in `/client/src/utils/axiosInstance.js`:

```javascript
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:9001/api/v1",
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});
```

## 🎯 Key Features

### 1. Automatic Token Attachment

Every request (except login/register) automatically includes:

```
Authorization: Bearer {accessToken}
```

### 2. Request Queuing

When token is being refreshed:

- All concurrent requests are queued
- After refresh completes, all requests continue with new token
- Prevents multiple simultaneous refresh calls

### 3. Smart Error Handling

- 401 errors trigger token refresh
- Other errors are passed through normally
- Network errors are handled gracefully

### 4. Secure Token Storage

- Tokens stored in localStorage
- Keys: `authToken`, `refreshToken`
- Cleared on logout or refresh failure

## 🛠️ Updating Existing Code

### Before (Manual Token Management)

```javascript
const token = localStorage.getItem("authToken");
const response = await axios.get(`${API_URL}/users`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

### After (Automatic Token Management)

```javascript
import axiosInstance from "../utils/axiosInstance";

const response = await axiosInstance.get("/users");
// Token is added automatically!
```

## 📝 Best Practices

### 1. Always Use axiosInstance

```javascript
// ✅ Good
import axiosInstance from '../utils/axiosInstance';
const data = await axiosInstance.get('/endpoint');

// ❌ Bad
import axios from 'axios';
const data = await axios.get(url, { headers: {...} });
```

### 2. Use API Service Functions

```javascript
// ✅ Good
import { userAPI } from "../services/apiService";
const users = await userAPI.getAllUsers();

// ⚠️ OK, but less organized
import axiosInstance from "../utils/axiosInstance";
const response = await axiosInstance.get("/user/getAllUsers");
```

### 3. Handle Errors Properly

```javascript
try {
  const response = await userAPI.getProfile();
  // Use response
} catch (error) {
  if (error.response?.status === 403) {
    // Handle forbidden
  } else if (error.response?.status === 404) {
    // Handle not found
  } else {
    // Handle other errors
  }
}
```

### 4. Don't Manually Handle 401

```javascript
// ❌ Bad - Interceptor handles this
if (error.response?.status === 401) {
  await refreshAccessToken();
  // Retry...
}

// ✅ Good - Let interceptor handle it
try {
  const response = await axiosInstance.get("/endpoint");
} catch (error) {
  // Only handle non-401 errors here
}
```

## 🔍 Debugging

### Enable Request Logging

Add to `axiosInstance.js`:

```javascript
// Request interceptor
axiosInstance.interceptors.request.use((config) => {
  console.log("📤 Request:", config.method?.toUpperCase(), config.url);
  // ... rest of code
});

// Response interceptor
axiosInstance.interceptors.response.use((response) => {
  console.log("✅ Response:", response.config.url, response.status);
  return response;
});
```

### Check Token Expiry

```javascript
import { getAccessToken } from "../utils/tokenService";
import { isJwtSane } from "../utils/jwtUtils";

const token = getAccessToken();
const isValid = isJwtSane(token);
console.log("Token valid:", isValid);
```

## 🚨 Troubleshooting

### Issue: Infinite Refresh Loop

**Cause**: Refresh endpoint returns 401
**Solution**: Ensure refresh endpoint doesn't require authentication or is excluded in interceptor

### Issue: Token Not Attached

**Cause**: Using raw axios instead of axiosInstance
**Solution**: Import and use axiosInstance

### Issue: Multiple Refresh Calls

**Cause**: Race condition in concurrent requests
**Solution**: Already handled by request queuing in interceptor

### Issue: Redirects to Login Immediately

**Cause**: No refresh token or expired refresh token
**Solution**: Ensure refresh token is stored on login and check expiry

## 📊 Token Storage Keys

| Key            | Description                                 |
| -------------- | ------------------------------------------- |
| `authToken`    | Primary access token key                    |
| `accessToken`  | Backup access token key (for compatibility) |
| `refreshToken` | Refresh token                               |
| `loginData`    | Additional login data (optional)            |
| `userData`     | User profile data (optional)                |

## 🔐 Security Notes

1. **HTTPS Only**: Always use HTTPS in production
2. **Token Expiry**: Access tokens should be short-lived (15-30 min)
3. **Refresh Tokens**: Refresh tokens can be longer (7-30 days)
4. **XSS Protection**: Be cautious with localStorage (consider httpOnly cookies for sensitive apps)
5. **CSRF Protection**: Not needed for Bearer token auth (but ensure CORS is configured)

## ✅ Migration Checklist

- [x] Created centralized axios instance
- [x] Added request interceptor for token attachment
- [x] Added response interceptor for 401 handling
- [x] Implemented request queuing during refresh
- [x] Updated tokenService to use correct keys
- [x] Updated refreshTokenService for proper refresh flow
- [x] Updated rbacService to use axiosInstance
- [x] Created apiService for centralized endpoints
- [ ] Update all other services to use axiosInstance
- [ ] Test login flow
- [ ] Test token refresh on 401
- [ ] Test logout flow
- [ ] Test concurrent requests during refresh

## 📚 Additional Resources

- Axios Documentation: https://axios-http.com/
- JWT Best Practices: https://jwt.io/
- React Auth Patterns: https://kentcdodds.com/blog/authentication-in-react-applications

---

**Last Updated**: October 16, 2025
**Status**: ✅ Ready for use
