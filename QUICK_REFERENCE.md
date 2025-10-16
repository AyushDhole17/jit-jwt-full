# Quick Reference: Token Management

## 🚀 Quick Start

### 1. Import the axios instance

```javascript
import axiosInstance from "../utils/axiosInstance";
```

### 2. Make API calls (token is added automatically)

```javascript
// GET
const response = await axiosInstance.get("/endpoint");

// POST
const response = await axiosInstance.post("/endpoint", data);

// PUT
const response = await axiosInstance.put("/endpoint", data);

// DELETE
const response = await axiosInstance.delete("/endpoint");
```

### 3. That's it! Token refresh happens automatically on 401 errors.

---

## 📝 Common Use Cases

### Login

```javascript
import { authAPI } from "../services/apiService";
import { setTokens } from "../utils/tokenService";

const response = await authAPI.login({ email, password });
setTokens({
  accessToken: response.data.accessToken,
  refreshToken: response.data.refreshToken,
});
```

### Logout

```javascript
import { clearTokens } from "../utils/tokenService";

clearTokens();
navigate("/login");
```

### Get User Profile

```javascript
import { userAPI } from "../services/apiService";

const profile = await userAPI.getProfile();
```

### RBAC Operations

```javascript
import rbacService from "../services/rbacService";

// Or use rbacAPI
import { rbacAPI } from "../services/apiService";

const roles = await rbacService.getAllRoles();
const permissions = await rbacAPI.getAllPermissions();
```

---

## 🔄 Token Refresh (Automatic)

```
Request → 401 Error → Refresh Token → Retry Request
```

No code needed! It happens automatically.

---

## 🛠️ Available APIs

### authAPI

- `login(credentials)`
- `register(userData)`
- `logout()`
- `forgotPassword(email)`
- `resetPassword(data)`

### userAPI

- `getProfile()`
- `getAllUsers()`
- `getUserById(userId)`
- `updateUser(userId, data)`
- `deleteUser(userId)`
- And more...

### rbacAPI

- `getAllRoles()`
- `createRole(data)`
- `getAllPermissions()`
- `createPermission(data)`
- And more...

---

## ⚠️ Important

### ✅ DO

```javascript
import axiosInstance from "../utils/axiosInstance";
const data = await axiosInstance.get("/users");
```

### ❌ DON'T

```javascript
import axios from "axios";
const token = localStorage.getItem("authToken");
const data = await axios.get(url, {
  headers: { Authorization: `Bearer ${token}` },
});
```

---

## 📍 Key Files

| File                           | Purpose                 |
| ------------------------------ | ----------------------- |
| `utils/axiosInstance.js`       | Axios with interceptors |
| `utils/tokenService.js`        | Token storage functions |
| `utils/refreshTokenService.js` | Token refresh logic     |
| `services/apiService.js`       | API endpoints           |
| `services/rbacService.js`      | RBAC operations         |

---

## 🔧 Environment Setup

Add to `.env`:

```env
VITE_API_URL=http://localhost:9001/api/v1
```

---

## 📚 Full Documentation

See `/TOKEN_MANAGEMENT_GUIDE.md` for complete details.

---

**Status**: ✅ Ready to use
