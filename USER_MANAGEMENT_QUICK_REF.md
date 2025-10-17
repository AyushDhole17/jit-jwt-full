# RBAC & User Management - Quick Reference

## 🚀 Quick Access

| Page | URL | Purpose |
|------|-----|---------|
| **Roles Management** | `/rbac-management` | Manage roles and permissions |
| **Users Management** | `/users-management` | Manage users and assign roles |

---

## 👤 Users Management

### Search & Filter
```
Search: Name, Email, Mobile, Role
Status: All / Active / Inactive
Role: All / Specific Role
```

### Actions

| Icon | Action | Description |
|------|--------|-------------|
| ✏️ Edit | Edit User | Update name, email, mobile |
| 🛡️ Shield | Assign Role | Assign RBAC role to user |
| 👤 Person | Toggle Status | Activate/Deactivate user |
| 🗑️ Delete | Delete User | Permanently remove user |

### Quick Operations

**Assign Role to User**:
1. Click 🛡️ Shield icon
2. Select role from dropdown
3. Click "Assign Role"

**Activate/Deactivate User**:
1. Click 👤 Person icon
2. Status toggles immediately

**Edit User**:
1. Click ✏️ Edit icon
2. Update fields
3. Click "Save Changes"

---

## 🛡️ Roles Management

### Role Priority Levels
- **90-100**: Super Admin / Admin
- **70-89**: Manager
- **50-69**: Supervisor
- **0-49**: Operator

### Actions

| Action | Steps |
|--------|-------|
| **Create Role** | Click "Create Role" → Fill form → Save |
| **Edit Role** | Click Edit icon → Update → Save |
| **Delete Role** | Click Delete icon → Confirm |
| **Manage Permissions** | Click "Manage Permissions" → Check/Uncheck → Save |

### Creating a Role

```
Role Name (ID): custom_manager
Display Name: Custom Manager
Description: Manages team operations
Priority: 75
```

### Assigning Permissions

1. Click "Manage Permissions" on role card
2. Browse permissions by resource:
   - User Management
   - Role Management
   - Dashboard Access
   - Reports
   - Settings
   - Devices
   - Alerts
3. Check desired permissions
4. Click "Save Permissions"

---

## 🎯 Common Tasks

### New Employee Onboarding

```
1. Create user account (Register page)
2. Go to Users Management
3. Find new user in table
4. Click Shield icon
5. Assign appropriate role
6. User can now login with role permissions
```

### Employee Role Change

```
1. Go to Users Management
2. Search for user
3. Click Shield icon
4. Select new role
5. Click "Assign Role"
6. User gets new permissions immediately
```

### Employee Offboarding

```
Option 1 (Recommended): Deactivate
1. Go to Users Management
2. Find user
3. Click Person icon
4. User is deactivated (can reactivate later)

Option 2: Delete
1. Go to Users Management
2. Find user
3. Click Delete icon
4. Confirm deletion (permanent!)
```

### Creating Custom Role

```
1. Go to Roles Management
2. Click "Create Role"
3. Enter details:
   - Name: support_agent
   - Display: Support Agent
   - Description: Handles customer support
   - Priority: 45
4. Click "Create Role"
5. Click "Manage Permissions"
6. Assign needed permissions
7. Click "Save Permissions"
```

---

## 🔐 Default Roles

| Role | Priority | Description |
|------|----------|-------------|
| **Super Admin** | 100 | Full system access |
| **Admin** | 90 | Administrative access |
| **Manager** | 70 | Management operations |
| **Supervisor** | 60 | Team supervision |
| **Operator** | 50 | Basic operations |

---

## 📊 Permission Resources

| Resource | Actions Available |
|----------|-------------------|
| **user** | create, read, update, delete, manage |
| **role** | create, read, update, delete, manage |
| **dashboard** | view, manage |
| **reports** | view, create, export |
| **settings** | view, update, manage |
| **device** | view, create, update, delete |
| **alerts** | view, manage, configure |

---

## 🔑 API Quick Reference

### Users

```http
GET    /api/v1/user/getAllUsers           # Get all users
PUT    /api/v1/user/updateUser/:userId    # Update user
PUT    /api/v1/user/assignRole/:userId    # Assign role
PUT    /api/v1/user/activateUser/:userId  # Activate
PUT    /api/v1/user/deactivateUser/:userId # Deactivate
DELETE /api/v1/user/deleteUser/:userId    # Delete
```

### Roles

```http
GET    /api/v1/policy/roles               # Get all roles
POST   /api/v1/policy/roles               # Create role
PUT    /api/v1/policy/roles/:roleId       # Update role
DELETE /api/v1/policy/roles/:roleId       # Delete role
POST   /api/v1/policy/roles/:roleId/permissions # Assign permissions
```

### Permissions

```http
GET    /api/v1/policy/permissions         # Get all permissions
POST   /api/v1/policy/check-permission    # Check user permission
GET    /api/v1/policy/my-permissions      # Get my permissions
```

---

## 💡 Pro Tips

### Searching
- Search is case-insensitive
- Search works on name, email, mobile, and role
- Combine with filters for best results

### Performance
- Use pagination for large user lists
- Filter by status/role to narrow results
- Search is instant (no need to press Enter)

### Security
- Deactivate instead of delete when unsure
- Review permissions regularly
- Limit admin role assignments
- Never modify system roles

### Workflow
- Create roles first, then assign to users
- Use descriptive role names
- Add clear descriptions
- Set appropriate priority levels

---

## 🐛 Troubleshooting

### Issue: Can't see users/roles
**Fix**: Check if logged in as admin, refresh page

### Issue: Role assignment fails
**Fix**: Verify role exists, check admin permissions

### Issue: Can't delete role
**Fix**: Unassign from users first, system roles protected

### Issue: Permissions not working
**Fix**: User may need to logout and login again

---

## 🧪 Testing

### Postman Collection
```bash
Import: RBAC_Postman_Collection.json
Run: Login → Get Users → Assign Role
```

### Browser Console
```javascript
// Check authentication
tokenTest.checkTokens()

// Test API call
tokenTest.testApiCall()
```

---

## 📱 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+F` / `Cmd+F` | Focus search box |
| `Esc` | Close dialogs |
| `Enter` | Submit forms |
| `Tab` | Navigate form fields |

---

## 📞 Quick Help

- **Full Guide**: `USER_MANAGEMENT_GUIDE.md`
- **RBAC Docs**: `RBAC_README.md`
- **Token Help**: `TOKEN_MANAGEMENT_GUIDE.md`
- **API Tests**: `RBAC_Postman_Collection.json`

---

## ✅ Pre-Deployment Checklist

- [ ] Seed default roles (`npm run seed:rbac`)
- [ ] Test user creation
- [ ] Test role assignment
- [ ] Test permission checks
- [ ] Test activate/deactivate
- [ ] Test search and filters
- [ ] Test on mobile devices
- [ ] Review all user roles
- [ ] Document custom roles
- [ ] Train administrators

---

**Status**: Production Ready ✅  
**Last Updated**: October 17, 2025  
**Version**: 1.0
