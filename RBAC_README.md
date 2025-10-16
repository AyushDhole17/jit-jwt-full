# RBAC (Role-Based Access Control) System

## Overview

This project now includes a complete, dynamic RBAC system that allows you to manage roles and permissions through the MongoDB database and a user-friendly web interface.

## Features

- ✅ Dynamic role and permission management
- ✅ MongoDB-based storage for flexibility
- ✅ RESTful API endpoints for all RBAC operations
- ✅ Beautiful, Material-UI based management interface
- ✅ Permission-based access control middleware
- ✅ Default roles and permissions pre-configured
- ✅ Support for custom roles and permissions

## Architecture

### Backend Components

1. **Models** (`server/api-auth/src/models/policy.js`)

   - `Permission`: Individual permissions with resource and action
   - `Role`: Roles that contain multiple permissions
   - `RolePermission`: Junction table for role-permission relationships

2. **Service** (`server/api-auth/src/services/rbacService.js`)

   - Core business logic for RBAC operations
   - Permission checking
   - Role and permission CRUD operations
   - Default RBAC initialization

3. **Controller** (`server/api-auth/src/controllers/policyController.js`)

   - HTTP request handlers
   - Input validation
   - Response formatting

4. **Routes** (`server/api-auth/src/routes/v1/policy.js`)

   - RESTful API endpoints
   - Authentication and authorization middleware

5. **Middleware** (`server/api-auth/src/middlewares/rbac.js`)
   - `checkPermission(resource, action)`: Dynamic permission checking
   - `authorizeRoles(roles)`: Legacy role-based authorization

### Frontend Components

1. **Service** (`client/src/services/rbacService.js`)

   - API integration layer
   - HTTP request handling

2. **UI Component** (`client/src/views/rbac/index.jsx`)
   - Complete management interface
   - Role management tab
   - Permission management tab
   - Permission assignment interface

## API Endpoints

### Role Management

- `GET /api/v1/policy/roles` - Get all roles
- `GET /api/v1/policy/roles/:roleId` - Get role by ID
- `POST /api/v1/policy/roles` - Create new role
- `PUT /api/v1/policy/roles/:roleId` - Update role
- `DELETE /api/v1/policy/roles/:roleId` - Delete role
- `POST /api/v1/policy/roles/:roleId/permissions` - Assign permissions to role

### Permission Management

- `GET /api/v1/policy/permissions` - Get all permissions
- `POST /api/v1/policy/permissions` - Create new permission
- `PUT /api/v1/policy/permissions/:permissionId` - Update permission
- `DELETE /api/v1/policy/permissions/:permissionId` - Delete permission

### User Permissions

- `POST /api/v1/policy/check-permission` - Check if user has permission
- `GET /api/v1/policy/my-permissions` - Get current user's permissions

### System

- `POST /api/v1/policy/initialize` - Initialize default RBAC (admin only)

## Getting Started

### 1. Initialize RBAC System

After starting your backend server, initialize the default roles and permissions:

**Option A: Via API (Recommended)**

```bash
# Using curl (make sure you have admin token)
curl -X POST http://localhost:9001/api/v1/policy/initialize \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Option B: Via Frontend**
Navigate to the RBAC Management page and the system will prompt you to initialize if needed.

### 2. Default Roles Created

After initialization, the following roles are automatically created:

- **Super Admin** (super_admin)

  - Full system access
  - All permissions
  - Priority: 100

- **Admin** (admin)

  - Administrative access
  - All permissions except role management and deletions
  - Priority: 90

- **Manager** (manager)

  - Manager access
  - Read/view permissions and reports
  - Priority: 70

- **Operator** (operator)
  - Basic operator access
  - View-only permissions
  - Priority: 50

### 3. Default Permissions Created

Permissions are organized by resource:

**User Management**

- create_user, read_user, update_user, delete_user, manage_user

**Role Management**

- create_role, read_role, update_role, delete_role, manage_role

**Dashboard**

- view_dashboard

**Reports**

- view_reports, create_reports

**Settings**

- view_settings, update_settings

## Usage Examples

### Backend: Protect Routes with Permissions

```javascript
const { checkPermission } = require("../middlewares/rbac");

// Protect a route with specific permission
router.post(
  "/api/users",
  authenticateToken,
  checkPermission("user", "create"),
  createUserController
);

// Protect with legacy role-based authorization
const { authorizeRoles } = require("../middlewares/rbac");
router.delete(
  "/api/users/:id",
  authenticateToken,
  authorizeRoles(["admin", "super"]),
  deleteUserController
);
```

### Backend: Check Permission Programmatically

```javascript
const rbacService = require("./services/rbacService");

async function someFunction(userId) {
  const hasPermission = await rbacService.checkPermission(
    userId,
    "reports",
    "create"
  );

  if (hasPermission) {
    // User can create reports
  }
}
```

### Frontend: Using the RBAC Management UI

1. **Access the UI**

   - Navigate to "RBAC Management" from the sidebar menu
   - Requires admin authentication

2. **Manage Roles**

   - Click "Add Role" to create new custom roles
   - Edit existing roles (except system roles)
   - Set role priority and description
   - Assign permissions to roles

3. **Manage Permissions**

   - Click "Add Permission" to create new permissions
   - Define resource, action, and description
   - Edit or delete custom permissions

4. **Assign Permissions to Roles**
   - Click "Manage Permissions" on any role card
   - Check/uncheck permissions organized by resource
   - Save assignments

## User Model Integration

The User model now includes a `roleRef` field that links to the RBAC Role:

```javascript
{
  // ... existing fields
  role: String,           // Legacy role string
  roleRef: ObjectId,      // Reference to RBAC Role
  // ... other fields
}
```

To assign an RBAC role to a user:

```javascript
const user = await User.findById(userId);
const role = await Role.findOne({ name: "manager" });
user.roleRef = role._id;
await user.save();
```

## Creating Custom Permissions

When adding new features to your application:

1. **Define the Permission**

   ```javascript
   {
     name: "create_invoice",
     resource: "invoice",
     action: "create",
     description: "Allows creating new invoices"
   }
   ```

2. **Create via API or UI**

   - Use the RBAC Management UI, or
   - Call the API endpoint directly

3. **Protect Your Routes**

   ```javascript
   router.post(
     "/api/invoices",
     authenticateToken,
     checkPermission("invoice", "create"),
     createInvoiceController
   );
   ```

4. **Assign to Roles**
   - Use the UI to assign the new permission to appropriate roles

## Best Practices

1. **Use Descriptive Permission Names**

   - Follow pattern: `{action}_{resource}`
   - Example: `create_user`, `view_dashboard`, `update_settings`

2. **Organize by Resource**

   - Group related permissions under the same resource
   - Makes permission management easier

3. **Use Manage Action Sparingly**

   - The "manage" action grants full access to a resource
   - Assign only to trusted roles

4. **Don't Delete System Roles**

   - System roles are protected and cannot be deleted
   - Modify their permissions if needed

5. **Test Permissions Thoroughly**

   - Always test new permissions before deploying
   - Ensure users have appropriate access levels

6. **Document Custom Permissions**
   - Keep track of custom permissions you create
   - Document which roles need which permissions

## Troubleshooting

### Permission Not Working

1. Check if user has `roleRef` assigned
2. Verify role has the required permission
3. Ensure permission is active (`isActive: true`)
4. Check middleware is correctly applied to route

### Cannot Delete Role

- System roles cannot be deleted
- Roles assigned to users cannot be deleted
- Reassign users first, then delete role

### UI Not Loading

- Check if backend API is running
- Verify `VITE_API_URL` environment variable
- Check browser console for errors
- Ensure authentication token is valid

## Security Considerations

1. **Always Authenticate First**

   - Use `authenticateToken` middleware before RBAC checks
   - Never skip authentication

2. **Protect RBAC Endpoints**

   - Only admins should access RBAC management endpoints
   - Use `checkAdmin` middleware

3. **Audit Permission Changes**

   - Log all role and permission modifications
   - Monitor for suspicious activity

4. **Regular Permission Reviews**
   - Periodically review user permissions
   - Remove unnecessary permissions
   - Update role definitions as needed

## Future Enhancements

Potential improvements for the RBAC system:

- [ ] Permission inheritance between roles
- [ ] Time-based permissions (expiring access)
- [ ] Conditional permissions (based on resource ownership)
- [ ] Permission audit logs
- [ ] Bulk permission assignment
- [ ] Permission groups/categories
- [ ] API rate limiting per role
- [ ] Frontend permission-based UI rendering

## Support

For issues or questions about the RBAC system:

1. Check this documentation
2. Review the code comments
3. Test with default roles first
4. Check MongoDB for data consistency

## License

Same as the main project license.
