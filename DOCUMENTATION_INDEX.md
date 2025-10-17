# JIT-JWT-FULL - Documentation Index

## 📚 Complete Documentation Guide

### 🔐 Token & Authentication

| Document                          | Description                                               | When to Use                                         |
| --------------------------------- | --------------------------------------------------------- | --------------------------------------------------- |
| **TOKEN_REFRESH_FIX.md**          | Complete technical guide for token refresh implementation | Deep dive, troubleshooting, understanding internals |
| **TOKEN_REFRESH_QUICK_REF.md**    | Quick reference card for token refresh                    | Quick lookup, testing commands                      |
| **TOKEN_REFRESH_SUMMARY.md**      | Executive summary of token refresh fix                    | Overview, what changed                              |
| **TOKEN_REFRESH_VISUAL_GUIDE.md** | Visual flow diagrams and charts                           | Understanding the flow visually                     |
| **TOKEN_MANAGEMENT_GUIDE.md**     | Complete token management documentation                   | General token management concepts                   |
| **TOKEN_FIX_SUMMARY.md**          | Original token fix summary                                | Historical reference                                |

### 🛡️ RBAC (Role-Based Access Control)

| Document                           | Description                        | When to Use                  |
| ---------------------------------- | ---------------------------------- | ---------------------------- |
| **RBAC_README.md**                 | Complete RBAC system documentation | Full RBAC reference          |
| **RBAC_QUICK_START.md**            | Quick start guide for RBAC         | Getting started quickly      |
| **RBAC_IMPLEMENTATION_SUMMARY.md** | Implementation details             | Understanding what was built |
| **RBAC_ARCHITECTURE.md**           | System architecture diagrams       | Understanding the design     |
| **RBAC_Postman_Collection.json**   | API testing collection             | Testing RBAC endpoints       |

### 📖 General

| Document               | Description             | When to Use                  |
| ---------------------- | ----------------------- | ---------------------------- |
| **QUICK_REFERENCE.md** | General quick reference | Quick lookup of common tasks |
| **help.txt**           | Help file               | Basic help                   |

## 🎯 Quick Start Guides

### For Token Refresh Issues

1. Start here: **TOKEN_REFRESH_QUICK_REF.md**
2. If you need more details: **TOKEN_REFRESH_FIX.md**
3. For visual understanding: **TOKEN_REFRESH_VISUAL_GUIDE.md**

### For RBAC Setup

1. Start here: **RBAC_QUICK_START.md**
2. For full reference: **RBAC_README.md**
3. For testing: **RBAC_Postman_Collection.json**

### For Development

1. Token management: **TOKEN_MANAGEMENT_GUIDE.md**
2. System architecture: **RBAC_ARCHITECTURE.md**
3. Implementation details: **RBAC_IMPLEMENTATION_SUMMARY.md**

## 🔧 Testing Tools

### Browser Console Commands

```javascript
// Token refresh testing
tokenTest.checkTokens(); // Check token status
tokenTest.testApiCall(); // Test API with auto-refresh
tokenTest.expireToken(); // Manually expire token
tokenTest.help(); // Show all commands
```

### Postman Collection

- **File**: `RBAC_Postman_Collection.json`
- **Import**: Open Postman → Import → Select file
- **Includes**: All auth and RBAC endpoints

## 📁 Code Structure

### Client (Frontend)

```
client/src/
├── utils/
│   ├── axiosInstance.js          ← HTTP client with auto-refresh
│   ├── tokenService.js            ← Token storage management
│   ├── refreshTokenService.js     ← Refresh token logic
│   ├── tokenTestUtils.js          ← Testing utilities
│   └── authWatcher.js             ← Auth state monitoring
├── services/
│   ├── apiService.js              ← Centralized API endpoints
│   ├── rbacService.js             ← RBAC API integration
│   └── userService.js             ← User API integration
└── views/
    ├── rbac/                      ← RBAC Management UI
    └── pages/authentication/      ← Login, Register, etc.
```

### Server (Backend)

```
server/api-auth/src/
├── models/
│   ├── User.js                    ← User model with roleRef
│   └── policy.js                  ← Permission, Role, RolePermission
├── services/
│   ├── jwtService.js              ← JWT generation
│   └── rbacService.js             ← RBAC business logic
├── controllers/
│   ├── authController.js          ← Auth endpoints (login, refresh)
│   └── policyController.js        ← RBAC endpoints
├── routes/v1/
│   ├── auth.js                    ← /api/v1/auth/*
│   └── policy.js                  ← /api/v1/policy/*
├── middlewares/
│   └── rbac.js                    ← Permission checking
└── scripts/
    └── rbacSeeder.js              ← Database seeder
```

## 🚀 Common Tasks

### Start the Application

```bash
# Backend
cd server/api-auth
npm run dev

# Frontend
cd client
npm run dev
```

### Seed RBAC Data

```bash
cd server/api-auth
npm run seed:rbac
```

### Test Token Refresh

```javascript
// In browser console
tokenTest.checkTokens();
tokenTest.testApiCall();
```

### Test RBAC Endpoints

1. Import `RBAC_Postman_Collection.json` to Postman
2. Run "Login" request first
3. Test any RBAC endpoint

## 🐛 Troubleshooting

### Token Issues

- **Docs**: TOKEN_REFRESH_FIX.md (Troubleshooting section)
- **Quick Check**: `tokenTest.checkTokens()` in console
- **Look For**: `[RefreshToken]` and `[AxiosInterceptor]` logs

### RBAC Issues

- **Docs**: RBAC_README.md (Troubleshooting section)
- **Check**: Seeder ran successfully
- **Test**: Use Postman collection

### API Issues

- **Check**: Backend is running (port 9001)
- **Check**: CORS is configured
- **Check**: Environment variables set

## 📊 Status

| Component        | Status      | Documentation              |
| ---------------- | ----------- | -------------------------- |
| Token Refresh    | ✅ Complete | TOKEN_REFRESH_FIX.md       |
| Token Management | ✅ Complete | TOKEN_MANAGEMENT_GUIDE.md  |
| RBAC Backend     | ✅ Complete | RBAC_README.md             |
| RBAC Frontend    | ✅ Complete | RBAC_README.md             |
| Testing Tools    | ✅ Complete | TOKEN_REFRESH_QUICK_REF.md |
| Documentation    | ✅ Complete | This index                 |

## 🎓 Learning Path

### Beginner

1. Read RBAC_QUICK_START.md
2. Read TOKEN_REFRESH_QUICK_REF.md
3. Try tokenTest commands in console
4. Import and test Postman collection

### Intermediate

1. Study TOKEN_REFRESH_FIX.md
2. Study RBAC_README.md
3. Examine code in utils/ and services/
4. Run the seeder and test RBAC UI

### Advanced

1. Study TOKEN_REFRESH_VISUAL_GUIDE.md
2. Study RBAC_ARCHITECTURE.md
3. Review RBAC_IMPLEMENTATION_SUMMARY.md
4. Understand interceptor and middleware patterns

## 🔗 External Resources

### JWT

- [JWT.io](https://jwt.io/) - JWT debugger
- [RFC 7519](https://tools.ietf.org/html/rfc7519) - JWT specification

### RBAC

- [NIST RBAC Model](https://csrc.nist.gov/projects/role-based-access-control)
- [OWASP Access Control](https://owasp.org/www-community/Access_Control)

### Axios

- [Axios Docs](https://axios-http.com/docs/intro)
- [Interceptors Guide](https://axios-http.com/docs/interceptors)

## 📝 Notes

### Token Expiration

- **Access Token**: 15 minutes (configurable in backend)
- **Refresh Token**: 7 days (configurable in backend)

### Default RBAC Roles

- Super Admin (priority: 100)
- Admin (priority: 90)
- Manager (priority: 70)
- Supervisor (priority: 60)
- Operator (priority: 50)

### Default Permissions

19 permissions across:

- User management
- Role management
- Dashboard access
- Reports access
- Settings access
- Device management
- Alerts management

## 🆘 Getting Help

1. **Check Console**: Look for error logs
2. **Check Docs**: Use this index to find relevant guide
3. **Use Test Tools**: `tokenTest.help()` in console
4. **Check Postman**: Test endpoints directly
5. **Review Network Tab**: See actual API calls

---

**Documentation Version**: 1.0  
**Last Updated**: October 17, 2025  
**Status**: Complete and Up-to-Date

**Main Documentation Files**:

- Token: 6 files
- RBAC: 5 files
- Total: 11+ comprehensive guides
