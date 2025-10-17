# Token Refresh Flow - Visual Guide

## 🔄 Complete Token Refresh Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER MAKES API REQUEST                          │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  Request Interceptor   │
                    │  (axiosInstance.js)    │
                    └────────────┬───────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  Add Authorization:     │
                    │  Bearer <accessToken>   │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   Send to Backend API  │
                    └────────────┬───────────┘
                                 │
            ┌────────────────────┴────────────────────┐
            │                                         │
            ▼                                         ▼
   ┌─────────────────┐                     ┌──────────────────┐
   │  200 OK         │                     │  401 Unauthorized│
   │  Success!       │                     │  Token Expired   │
   └────────┬────────┘                     └────────┬─────────┘
            │                                       │
            ▼                                       ▼
   ┌─────────────────┐              ┌──────────────────────────┐
   │ Return Response │              │  Response Interceptor    │
   │ to User         │              │  (axiosInstance.js)      │
   └─────────────────┘              └────────────┬─────────────┘
                                                 │
                                    ┌────────────▼────────────┐
                                    │  Check: Already retried?│
                                    └────────────┬────────────┘
                                                 │
                        ┌────────────────────────┴─────────────────────┐
                        │                                              │
                        ▼                                              ▼
            ┌───────────────────────┐                     ┌────────────────────┐
            │  YES - Already Tried  │                     │  NO - First Attempt│
            └───────────┬───────────┘                     └──────────┬─────────┘
                        │                                            │
                        ▼                                            ▼
            ┌───────────────────────┐              ┌─────────────────────────────┐
            │  Clear All Tokens     │              │  Check: Refresh in Progress?│
            │  Redirect to /login   │              └────────────┬────────────────┘
            └───────────────────────┘                           │
                                                   ┌────────────┴────────────┐
                                                   │                         │
                                                   ▼                         ▼
                                      ┌────────────────────┐    ┌───────────────────────┐
                                      │  YES - Refreshing  │    │  NO - Start Refresh   │
                                      └─────────┬──────────┘    └──────────┬────────────┘
                                                │                           │
                                                ▼                           ▼
                                   ┌────────────────────────┐  ┌────────────────────────┐
                                   │  Queue This Request    │  │  Set isRefreshing=true │
                                   │  (Add to failedQueue)  │  │  Mark request._retry   │
                                   └─────────┬──────────────┘  └──────────┬─────────────┘
                                             │                             │
                                             │                             ▼
                                             │              ┌──────────────────────────────┐
                                             │              │  Call refreshAccessToken()   │
                                             │              │  (refreshTokenService.js)    │
                                             │              └──────────┬───────────────────┘
                                             │                         │
                                             │                         ▼
                                             │              ┌──────────────────────────────┐
                                             │              │  POST /auth/refresh-token    │
                                             │              │  Body: { token: refreshToken }│
                                             │              └──────────┬───────────────────┘
                                             │                         │
                                             │           ┌─────────────┴──────────────┐
                                             │           │                            │
                                             │           ▼                            ▼
                                             │  ┌────────────────┐        ┌───────────────────┐
                                             │  │  200 Success   │        │  401/403 Failed   │
                                             │  └───────┬────────┘        └──────────┬────────┘
                                             │          │                            │
                                             │          ▼                            ▼
                                             │  ┌────────────────────┐   ┌──────────────────┐
                                             │  │  Save New Tokens:  │   │  Clear Tokens    │
                                             │  │  - accessToken     │   │  Redirect /login │
                                             │  │  - refreshToken    │   └──────────────────┘
                                             │  │  - Update storage  │
                                             │  └─────────┬──────────┘
                                             │            │
                                             │            ▼
                                             │  ┌────────────────────────────┐
                                             │  │  Set isRefreshing = false  │
                                             │  │  Process failedQueue       │
                                             │  └─────────┬──────────────────┘
                                             │            │
                                             └────────────┼────────────────────┐
                                                          │                    │
                                                          ▼                    ▼
                                               ┌────────────────────┐  ┌──────────────────┐
                                               │  Retry All Queued  │  │  Retry Original  │
                                               │  Requests with     │  │  Request with    │
                                               │  New Token         │  │  New Token       │
                                               └─────────┬──────────┘  └──────────┬───────┘
                                                         │                        │
                                                         └────────────┬───────────┘
                                                                      │
                                                                      ▼
                                                         ┌────────────────────────┐
                                                         │  Return Success Data   │
                                                         │  to User               │
                                                         └────────────────────────┘
```

## 🔍 Console Log Timeline

### Scenario: Token Expired

```
Time    Component               Log Message
─────   ──────────────────────  ──────────────────────────────────────────
T+0ms   [User Action]           User clicks "View Users" button
T+10ms  [AxiosInterceptor]      Adding Bearer token to request
T+50ms  [Backend]               Returns 401 Unauthorized
T+51ms  [AxiosInterceptor]      ✋ 401 error detected, attempting token refresh...
T+52ms  [RefreshToken]          🔄 Attempting to refresh access token...
T+100ms [Backend]               Refresh endpoint processing...
T+150ms [RefreshToken]          ✅ Refresh successful, got new tokens
T+151ms [TokenService]          Saving new access token
T+152ms [TokenService]          Updating loginData in sync
T+153ms [AxiosInterceptor]      🔁 Token refreshed successfully, retrying original request
T+200ms [Backend]               Returns 200 OK with user data
T+201ms [AxiosInterceptor]      ✅ Request succeeded
T+202ms [User Interface]        Data displayed to user
```

## 📊 Token States

```
┌──────────────────────────────────────────────────────────────────┐
│                      TOKEN LIFECYCLE                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🟢 FRESH                                                        │
│  ├─ Access Token Valid                                          │
│  ├─ Refresh Token Valid                                         │
│  └─ Time Left: > 5 minutes                                      │
│      → All requests succeed immediately                         │
│                                                                  │
│  🟡 EXPIRING SOON                                               │
│  ├─ Access Token Valid                                          │
│  ├─ Refresh Token Valid                                         │
│  └─ Time Left: < 5 minutes                                      │
│      → Requests still succeed                                   │
│      → Consider proactive refresh                               │
│                                                                  │
│  🟠 ACCESS EXPIRED                                              │
│  ├─ Access Token Expired                                        │
│  ├─ Refresh Token Valid                                         │
│  └─ Action: Auto-refresh triggered                              │
│      → First 401 triggers refresh                               │
│      → Subsequent requests queued                               │
│      → All retried after refresh                                │
│                                                                  │
│  🔴 REFRESH EXPIRED                                             │
│  ├─ Access Token Expired                                        │
│  ├─ Refresh Token Expired                                       │
│  └─ Action: Logout required                                     │
│      → Clear all tokens                                         │
│      → Redirect to login                                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## 🎯 Key Decision Points

### 1. Should Request Include Token?
```
Is URL /auth/login or /auth/register?
├─ YES → Skip token (no auth needed)
└─ NO  → Add Bearer token
```

### 2. Should Trigger Refresh?
```
Is response 401?
├─ NO  → Return response normally
└─ YES → Is URL an auth endpoint?
         ├─ YES → Return error (don't refresh for auth endpoints)
         └─ NO  → Is this a retry?
                  ├─ YES → Logout (already tried to refresh)
                  └─ NO  → Trigger refresh flow
```

### 3. Should Queue Request?
```
Is refresh in progress?
├─ YES → Queue this request
│        └─ Will retry after refresh completes
└─ NO  → Start new refresh
         └─ This becomes the first queued request
```

## 🧪 Testing Scenarios

### ✅ Scenario 1: Normal Operation
```
Given: Valid access token
When:  User makes API request
Then:  Request succeeds immediately
And:   No refresh triggered
```

### ✅ Scenario 2: Token Just Expired
```
Given: Expired access token, valid refresh token
When:  User makes API request
Then:  Request returns 401
And:   Auto-refresh is triggered
And:   New token is obtained
And:   Original request retried
And:   User sees data (seamless experience)
```

### ✅ Scenario 3: Multiple Concurrent Requests
```
Given: Expired access token
When:  User makes 5 API requests simultaneously
Then:  First request triggers refresh
And:   Other 4 requests are queued
And:   Refresh completes once
And:   All 5 requests retry with new token
And:   All 5 requests succeed
```

### ✅ Scenario 4: Refresh Token Expired
```
Given: Expired access token, expired refresh token
When:  User makes API request
Then:  Request returns 401
And:   Auto-refresh is attempted
And:   Refresh fails (403)
And:   All tokens cleared
And:   User redirected to login
```

## 🐛 Debugging Checklist

When token refresh isn't working, check:

- [ ] Using `axiosInstance` (not plain `axios` or `fetch`)
- [ ] Tokens exist in localStorage
  - `localStorage.getItem('accessToken')`
  - `localStorage.getItem('refreshToken')`
- [ ] Console shows `[AxiosInterceptor]` logs
- [ ] Console shows `[RefreshToken]` logs
- [ ] Network tab shows `/auth/refresh-token` call
- [ ] Refresh token is not expired (< 7 days old)
- [ ] Backend refresh endpoint is working
- [ ] CORS is configured correctly
- [ ] No firewall blocking requests

## 📱 User Experience

### Before Fix:
```
User Action → API Call → 401 Error → ❌ Error Message
                                    → 🔄 Manual Login Required
```

### After Fix:
```
User Action → API Call → 401 Error → 🔄 Auto Refresh (silent)
                                    → 🔁 Retry Request (silent)
                                    → ✅ Success (seamless!)
```

---

**Visual Aid Created**: October 17, 2025  
**Purpose**: Help developers understand token refresh flow  
**Related Docs**: TOKEN_REFRESH_FIX.md, TOKEN_REFRESH_QUICK_REF.md
