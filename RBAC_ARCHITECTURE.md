# RBAC System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           RBAC SYSTEM OVERVIEW                           │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                               │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              RBAC Management UI Component                        │   │
│  │              (/client/src/views/rbac/index.jsx)                 │   │
│  │                                                                   │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐     │   │
│  │  │  Roles Tab   │  │ Permissions  │  │    Assignment    │     │   │
│  │  │              │  │     Tab      │  │     Dialog       │     │   │
│  │  │ - View Roles │  │ - View Perms │  │ - Assign Perms   │     │   │
│  │  │ - Add/Edit   │  │ - Add/Edit   │  │   to Roles       │     │   │
│  │  │ - Delete     │  │ - Delete     │  │ - Grouped View   │     │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                   │                                      │
│                                   ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    RBAC Service Layer                            │   │
│  │              (/client/src/services/rbacService.js)              │   │
│  │                                                                   │   │
│  │  • getAllRoles()        • createRole()        • deleteRole()     │   │
│  │  • getAllPermissions()  • createPermission()  • assignPermissions│   │
│  │  • checkPermission()    • getUserPermissions()                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                   │                                      │
└───────────────────────────────────┼──────────────────────────────────────┘
                                    │
                      HTTP Requests │ (JWT Auth)
                                    │
┌───────────────────────────────────▼──────────────────────────────────────┐
│                              BACKEND LAYER                                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      API Routes Layer                            │   │
│  │              (/server/api-auth/src/routes/v1/policy.js)         │   │
│  │                                                                   │   │
│  │  Endpoints:                                                       │   │
│  │  ┌────────────────────────────────────────────────────────┐     │   │
│  │  │ Roles:        GET/POST/PUT/DELETE /api/v1/policy/roles │     │   │
│  │  │ Permissions:  GET/POST/PUT/DELETE /api/v1/policy/perms │     │   │
│  │  │ Assignment:   POST /api/v1/policy/roles/:id/permissions│     │   │
│  │  │ User Check:   POST/GET /api/v1/policy/check-permission │     │   │
│  │  │ Initialize:   POST /api/v1/policy/initialize           │     │   │
│  │  └────────────────────────────────────────────────────────┘     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                   │                                      │
│                     ┌─────────────┴─────────────┐                       │
│                     ▼                           ▼                        │
│  ┌─────────────────────────────┐  ┌──────────────────────────────┐    │
│  │    Middleware Layer         │  │    Controller Layer          │    │
│  │    (rbac.js)                │  │    (policyController.js)     │    │
│  │                             │  │                              │    │
│  │  • authenticateToken()      │  │  • getAllRoles()             │    │
│  │  • checkPermission()        │  │  • createRole()              │    │
│  │  • authorizeRoles()         │  │  • updateRole()              │    │
│  │  • checkAdmin()             │  │  • deleteRole()              │    │
│  │                             │  │  • getAllPermissions()       │    │
│  └─────────────────────────────┘  │  • createPermission()        │    │
│                                    │  • assignPermissions()       │    │
│                                    │  • checkUserPermission()     │    │
│                                    └──────────────────────────────┘    │
│                                                 │                        │
│                                                 ▼                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      Service Layer                               │   │
│  │              (/server/api-auth/src/services/rbacService.js)     │   │
│  │                                                                   │   │
│  │  Business Logic:                                                 │   │
│  │  • checkPermission(userId, resource, action)                     │   │
│  │  • getUserPermissions(userId)                                    │   │
│  │  • createRole(data) / updateRole() / deleteRole()               │   │
│  │  • createPermission() / updatePermission() / deletePermission() │   │
│  │  • assignPermissionsToRole()                                     │   │
│  │  • initializeDefaultRBAC()                                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                   │                                      │
└───────────────────────────────────┼──────────────────────────────────────┘
                                    │
                          MongoDB   │
                          Queries   │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          DATABASE LAYER (MongoDB)                         │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────────┐   │
│  │  User Model     │  │  Role Model     │  │  Permission Model    │   │
│  │  (User.js)      │  │  (policy.js)    │  │  (policy.js)         │   │
│  │                 │  │                 │  │                      │   │
│  │  • _id          │  │  • _id          │  │  • _id               │   │
│  │  • name         │  │  • name         │  │  • name              │   │
│  │  • email        │  │  • displayName  │  │  • resource          │   │
│  │  • role (str)   │  │  • description  │  │  • action            │   │
│  │  • roleRef  ────┼──┼─ • permissions[]│◄─┤  • description       │   │
│  │  • company      │  │  • isSystem     │  │  • isActive          │   │
│  │  • isActive     │  │  • priority     │  │  • timestamps        │   │
│  │  • ...          │  │  • isActive     │  │                      │   │
│  └─────────────────┘  └─────────────────┘  └──────────────────────┘   │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────┐
│                        PERMISSION CHECK FLOW                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  User Request → authenticateToken() → checkPermission(resource, action)  │
│                                              │                            │
│                                              ▼                            │
│                                    rbacService.checkPermission()          │
│                                              │                            │
│                                              ▼                            │
│                          1. Get User with populated roleRef              │
│                          2. Check if role is active                      │
│                          3. Find matching permission                     │
│                          4. Return true/false                            │
│                                              │                            │
│                          ┌───────────────────┴───────────────────┐      │
│                          ▼                                       ▼       │
│                    Permission Granted                   Permission Denied │
│                    Continue Request                     Return 403        │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────┐
│                      DATA RELATIONSHIPS                                   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   User                 Role                    Permission                │
│   ┌──────┐            ┌──────┐                ┌───────────┐            │
│   │ _id  │            │ _id  │                │   _id     │            │
│   │ name │   1:1      │ name │       n:n      │   name    │            │
│   │roleRef│───────────│perms[]│────────────────│  resource │            │
│   │      │            │      │                │  action   │            │
│   └──────┘            └──────┘                └───────────┘            │
│                                                                           │
│  One user has ONE role (via roleRef)                                    │
│  One role has MANY permissions                                          │
│  One permission can belong to MANY roles                                │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────┐
│                      USAGE EXAMPLE IN CODE                                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  // Protect a route with permission                                      │
│  router.post('/api/invoices',                                           │
│    authenticateToken,                                                    │
│    checkPermission('invoice', 'create'),  // ← RBAC Check               │
│    createInvoiceController                                              │
│  );                                                                      │
│                                                                           │
│  // Check permission programmatically                                    │
│  const canCreate = await rbacService.checkPermission(                   │
│    userId,                                                               │
│    'invoice',                                                            │
│    'create'                                                              │
│  );                                                                      │
│                                                                           │
│  if (canCreate) {                                                        │
│    // Allow action                                                       │
│  } else {                                                                │
│    // Deny action                                                        │
│  }                                                                       │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────┐
│                      KEY FEATURES                                         │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ✅ Dynamic Role & Permission Management                                 │
│  ✅ MongoDB-based Storage                                                │
│  ✅ RESTful API                                                          │
│  ✅ Beautiful Material-UI Interface                                      │
│  ✅ Granular Permission Control                                          │
│  ✅ Role Priority System                                                 │
│  ✅ System Role Protection                                               │
│  ✅ Backward Compatible                                                  │
│  ✅ Seeder for Default Setup                                             │
│  ✅ Full Documentation                                                   │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

## File Structure

```
jit-jwt-full/
│
├── server/api-auth/src/
│   ├── models/
│   │   ├── policy.js                 # Role, Permission, RolePermission models
│   │   └── User.js                   # Updated with roleRef field
│   │
│   ├── services/
│   │   └── rbacService.js            # Core RBAC business logic
│   │
│   ├── controllers/
│   │   └── policyController.js       # RBAC HTTP request handlers
│   │
│   ├── routes/v1/
│   │   └── policy.js                 # RBAC API endpoints
│   │
│   ├── middlewares/
│   │   └── rbac.js                   # Permission checking middleware
│   │
│   ├── scripts/
│   │   └── rbacSeeder.js             # Database seeder
│   │
│   └── index.js                       # App entry (RBAC routes mounted)
│
├── client/src/
│   ├── services/
│   │   └── rbacService.js            # API integration service
│   │
│   ├── views/rbac/
│   │   └── index.jsx                 # RBAC Management UI
│   │
│   ├── menu-items/
│   │   └── dashboard.js              # Navigation menu (RBAC item added)
│   │
│   └── routes/
│       └── MainRoutes.jsx            # Frontend routes (RBAC route added)
│
└── Documentation/
    ├── RBAC_README.md                 # Complete documentation
    ├── RBAC_IMPLEMENTATION_SUMMARY.md # Implementation details
    ├── RBAC_QUICK_START.md           # Quick start guide
    └── RBAC_ARCHITECTURE.md          # This file
```

## Permission Naming Convention

```
Format: {action}_{resource}

Actions: create, read, update, delete, manage, view, execute
Resource: user, role, dashboard, reports, settings, device, alerts, etc.

Examples:
  ✅ create_user
  ✅ view_dashboard
  ✅ update_settings
  ✅ manage_alerts
  ✅ delete_role
```

## Security Flow

```
1. User logs in → JWT token generated
2. User makes request with JWT token
3. authenticateToken() validates token
4. checkPermission() middleware checks:
   - Is user authenticated?
   - Does user have roleRef?
   - Is role active?
   - Does role have required permission?
   - Is permission active?
5. If all checks pass → Request proceeds
6. If any check fails → 403 Forbidden
```
