# Complete RBAC & User Management System - User Guide

## 🎯 Overview

This comprehensive guide covers the complete Role-Based Access Control (RBAC) and User Management system. The system provides enterprise-grade user and permission management with an intuitive, professional UI.

## 📋 Table of Contents

1. [Features](#features)
2. [Getting Started](#getting-started)
3. [Roles Management](#roles-management)
4. [Users Management](#users-management)
5. [Permissions System](#permissions-system)
6. [API Reference](#api-reference)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## ✨ Features

### Roles Management
- ✅ Create, edit, and delete custom roles
- ✅ Assign permissions to roles
- ✅ System roles protection (cannot delete/edit critical roles)
- ✅ Priority-based role hierarchy
- ✅ Visual role cards with statistics
- ✅ Search and filter roles
- ✅ Real-time permission assignment

### Users Management
- ✅ View all users in a searchable, sortable table
- ✅ Filter users by status (Active/Inactive) and role
- ✅ Edit user information (name, email, mobile)
- ✅ Assign RBAC roles to users
- ✅ Activate/Deactivate users
- ✅ Delete users with confirmation
- ✅ Real-time statistics dashboard
- ✅ Pagination for large user lists

### UI/UX Enhancements
- ✅ Professional Material-UI design
- ✅ Loading skeletons for better UX
- ✅ Toast notifications for all actions
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Intuitive iconography
- ✅ Color-coded status indicators
- ✅ Confirmation dialogs for destructive actions

---

## 🚀 Getting Started

### Access the Management Pages

1. **Roles Management**: Navigate to "Roles Management" from the sidebar
2. **Users Management**: Navigate to "Users Management" from the sidebar

### Initial Setup

1. **Seed Default Roles** (if not already done):
   ```bash
   cd server/api-auth
   npm run seed:rbac
   ```

2. **Login as Admin**: Only admins can access management pages

3. **Verify Setup**: Check that default roles and permissions exist

---

## 🛡️ Roles Management

### Overview

The Roles Management page provides a comprehensive interface for managing system roles and their associated permissions.

### Key Components

#### Summary Dashboard
- **Total Roles**: Shows count of all roles
- **Active Roles**: Count of currently active roles
- **System Roles**: Protected, pre-configured roles
- **Custom Roles**: User-created roles

#### Search and Filter
- Search by role name, display name, or description
- Real-time filtering as you type
- Case-insensitive search

### Creating a Role

1. Click **"Create Role"** button
2. Fill in the form:
   - **Role Name** (Identifier): Unique, lowercase, underscores only (e.g., `custom_manager`)
   - **Display Name**: Human-readable name (e.g., `Custom Manager`)
   - **Description**: Purpose and responsibilities
   - **Priority Level**: 0-100, higher = more authority
3. Click **"Create Role"**
4. Success toast confirms creation

### Editing a Role

1. Click the **Edit icon** on any role card
2. Update the form fields (Role Name cannot be changed)
3. Click **"Update Role"**
4. Success toast confirms update

**Note**: System roles cannot be edited

### Deleting a Role

1. Click the **Delete icon** on any role card
2. Confirm deletion in the dialog
3. Success toast confirms deletion

**Restrictions**:
- System roles cannot be deleted
- Roles assigned to users cannot be deleted

### Managing Permissions

1. Click **"Manage Permissions"** on any role card
2. Permissions are grouped by resource (user, role, dashboard, etc.)
3. **Check/uncheck** individual permissions
4. Use **"Select All"** to select all permissions in a resource group
5. Click **"Save Permissions"** to apply changes

**Features**:
- Selected permission count displayed in real-time
- Visual indicators for selected permissions
- Grouped by resource for easy management
- Permission descriptions shown

---

## 👥 Users Management

### Overview

The Users Management page provides complete control over system users, their roles, and access status.

### Key Components

#### Summary Dashboard
- **Total Users**: All users in the system
- **Active Users**: Currently active users
- **Inactive Users**: Deactivated users
- **Administrators**: Users with admin privileges

#### Search and Filters

**Search Bar**: Search by:
- Name
- Email
- Mobile number
- Role

**Status Filter**:
- All Status
- Active Only
- Inactive Only

**Role Filter**:
- All Roles
- Specific role (dynamically populated)

### User Table

**Columns**:
- User (with avatar and name)
- Email
- Mobile
- Role (with color-coded chips)
- Status (Active/Inactive)
- Actions

### User Actions

#### 1. Edit User Information

1. Click **Edit icon** in the actions column
2. Update fields:
   - Full Name
   - Email Address
   - Mobile Number
3. Click **"Save Changes"**

#### 2. Assign RBAC Role

1. Click **Shield icon** in the actions column
2. Select a role from the dropdown
3. View role details (permissions count, priority)
4. Click **"Assign Role"**

**Benefits**:
- User inherits all permissions from the role
- Dynamic permission management
- Easy to change roles as needed

#### 3. Activate/Deactivate User

1. Click the **Person/PersonOff icon** in actions
2. Status toggles immediately
3. Inactive users cannot log in

**Use Cases**:
- Temporarily suspend access
- Offboarding process
- Security incidents

#### 4. Delete User

1. Click **Delete icon** in actions
2. Confirm deletion (this cannot be undone!)
3. User is permanently removed

**Warning**: Use carefully! Consider deactivating instead.

### Pagination

- Default: 10 users per page
- Options: 5, 10, 25, 50 per page
- Navigate with page controls

---

## 🔐 Permissions System

### Permission Structure

Each permission has:
- **Name**: Unique identifier (e.g., `create_user`)
- **Resource**: What it controls (e.g., `user`, `role`, `dashboard`)
- **Action**: Type of operation (e.g., `create`, `read`, `update`, `delete`)
- **Description**: Human-readable explanation

### Default Resources

1. **user**: User management operations
2. **role**: Role management operations
3. **dashboard**: Dashboard access and viewing
4. **reports**: Report generation and viewing
5. **settings**: System settings management
6. **device**: Device management
7. **alerts**: Alert management

### Default Actions

- `create`: Create new resources
- `read`: View resources
- `update`: Modify resources
- `delete`: Remove resources
- `manage`: Full control
- `view`: Read-only access
- `execute`: Run operations

### Permission Hierarchy

Roles have priority levels (0-100):
- **90-100**: Super Admin/Admin level
- **70-89**: Manager level
- **50-69**: Supervisor level
- **0-49**: Operator level

Higher priority roles typically have more permissions.

---

## 📡 API Reference

### User API Endpoints

#### Get All Users
```http
GET /api/v1/user/getAllUsers
Authorization: Bearer <token>
```

**Response**:
```json
[
  {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "1234567890",
    "role": "operator",
    "roleRef": {
      "_id": "role_id",
      "name": "operator",
      "displayName": "Operator",
      "permissions": [...]
    },
    "isActive": true
  }
]
```

#### Assign Role to User
```http
PUT /api/v1/user/assignRole/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "roleId": "role_id_here"
}
```

#### Activate User
```http
PUT /api/v1/user/activateUser/:userId
Authorization: Bearer <token>
```

#### Deactivate User
```http
PUT /api/v1/user/deactivateUser/:userId
Authorization: Bearer <token>
```

### Role API Endpoints

#### Get All Roles
```http
GET /api/v1/policy/roles
Authorization: Bearer <token>
```

#### Create Role
```http
POST /api/v1/policy/roles
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "custom_manager",
  "displayName": "Custom Manager",
  "description": "Custom manager role",
  "priority": 75
}
```

#### Assign Permissions to Role
```http
POST /api/v1/policy/roles/:roleId/permissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "permissionIds": ["perm_id_1", "perm_id_2", "perm_id_3"]
}
```

---

## 💡 Best Practices

### Role Design

1. **Principle of Least Privilege**: Give only necessary permissions
2. **Role Naming**: Use clear, descriptive names
3. **Documentation**: Always add meaningful descriptions
4. **Priority Levels**: Maintain consistent hierarchy
5. **Regular Review**: Periodically audit roles and permissions

### User Management

1. **Onboarding**: Assign appropriate roles immediately
2. **Offboarding**: Deactivate first, delete later if needed
3. **Role Changes**: Use role assignment instead of direct permissions
4. **Monitoring**: Regularly review active users
5. **Security**: Deactivate suspicious accounts immediately

### Security

1. **Admin Access**: Limit admin role assignments
2. **System Roles**: Never modify system-critical roles
3. **Audit Logs**: Monitor user and role changes
4. **Token Management**: Ensure tokens refresh properly
5. **Access Review**: Quarterly access review recommended

---

## 🔧 Troubleshooting

### Common Issues

#### Can't See Roles/Users

**Symptoms**: Empty list, no data showing

**Solutions**:
1. Check if you're logged in as admin
2. Verify backend is running
3. Check browser console for errors
4. Verify seed data exists (`npm run seed:rbac`)
5. Check network tab for API errors

#### Role Assignment Fails

**Symptoms**: Error when assigning role to user

**Solutions**:
1. Verify role ID is valid
2. Check if user exists
3. Ensure you have admin privileges
4. Check backend logs for errors

#### Can't Delete Role

**Symptoms**: Delete button disabled or fails

**Possible Causes**:
- Role is a system role (protected)
- Role is assigned to users
- Insufficient permissions

**Solutions**:
- Unassign role from all users first
- Cannot delete system roles

#### Permissions Not Working

**Symptoms**: User can't access features after role assignment

**Solutions**:
1. Verify permissions are assigned to the role
2. User may need to log out and log back in
3. Check token refresh is working
4. Verify roleRef is populated in user object

#### Search Not Working

**Symptoms**: Search doesn't filter results

**Solutions**:
1. Clear search box and try again
2. Refresh the page
3. Check if data is loaded
4. Try different search terms

### Getting Help

1. **Console Logs**: Check browser console for errors
2. **Network Tab**: Verify API calls are successful
3. **Backend Logs**: Check server logs for errors
4. **Documentation**: Review this guide and API docs
5. **Token Status**: Use `tokenTest.checkTokens()` in console

---

## 📱 Screenshots & Visual Guide

### Roles Management Page

**Key Elements**:
- Search bar at top
- Summary cards showing statistics
- Grid layout of role cards
- Color-coded status indicators
- Action buttons on each card

### Users Management Page

**Key Elements**:
- Summary dashboard with 4 metrics
- Search and filter controls
- Data table with pagination
- Action buttons for each user
- Color-coded status chips

### Permission Assignment Dialog

**Key Elements**:
- Grouped by resource
- Checkboxes for each permission
- "Select All" per resource group
- Permission descriptions
- Count of selected permissions

---

## 🎓 Training Guide

### For Administrators

1. **Week 1**: Learn roles and permissions concepts
2. **Week 2**: Practice creating and modifying roles
3. **Week 3**: User management operations
4. **Week 4**: Advanced scenarios and troubleshooting

### Quick Start Checklist

- [ ] Seed default roles and permissions
- [ ] Review all system roles
- [ ] Create custom role if needed
- [ ] Assign roles to existing users
- [ ] Test user access with different roles
- [ ] Document your custom roles
- [ ] Set up regular access review process

---

## 📞 Support

### Documentation
- RBAC Architecture: `RBAC_ARCHITECTURE.md`
- API Reference: `RBAC_README.md`
- Quick Start: `RBAC_QUICK_START.md`
- Token Management: `TOKEN_MANAGEMENT_GUIDE.md`

### Testing
- Postman Collection: `RBAC_Postman_Collection.json`
- Token Test Utils: `tokenTest` in browser console

---

## 🔄 Updates & Maintenance

### Version History
- **v1.0** (Current): Complete RBAC and User Management system

### Upcoming Features
- Bulk user operations
- Export users/roles to CSV
- Role templates
- Permission presets
- Audit log viewer
- Advanced filtering

---

**Last Updated**: October 17, 2025  
**Status**: Production Ready ✅  
**Confidence Level**: High - Ready for deployment

This system is production-ready with enterprise-grade features, comprehensive error handling, and professional UI/UX. Feel confident deploying this to your users!
