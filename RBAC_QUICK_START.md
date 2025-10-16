# RBAC Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Initialize RBAC (Backend)

Navigate to the backend directory and run the seeder:

```bash
cd server/api-auth
npm run seed:rbac
```

This will create:

- 5 default roles (Super Admin, Admin, Manager, Supervisor, Operator)
- 19 default permissions (user, role, dashboard, reports, settings, device, alerts)
- Assign permissions to each role appropriately

### Step 2: Start Your Servers

**Backend:**

```bash
cd server/api-auth
npm run dev
```

**Frontend:**

```bash
cd client
npm run dev
```

### Step 3: Access RBAC Management

1. Open your browser and navigate to your app
2. Login with an admin account
3. Look for "RBAC Management" in the sidebar menu (🛡️ icon)
4. Start managing roles and permissions!

## 📋 What You Can Do Now

### In the UI:

**Roles Tab:**

- View all existing roles
- Create new custom roles
- Edit role details (name, description, priority)
- Delete custom roles (system roles are protected)
- Manage permissions for each role

**Permissions Tab:**

- View all permissions in a table
- Create new permissions for your features
- Edit permission details
- Delete unused permissions
- Filter and search permissions

### In Your Code:

**Protect a Route:**

```javascript
const { checkPermission } = require("../middlewares/rbac");

router.post(
  "/api/invoices",
  authenticateToken,
  checkPermission("invoice", "create"),
  createInvoiceController
);
```

**Check Permission Programmatically:**

```javascript
const rbacService = require("./services/rbacService");

if (await rbacService.checkPermission(userId, "reports", "create")) {
  // User can create reports
}
```

**Assign Role to User:**

```javascript
const role = await Role.findOne({ name: "manager" });
await User.findByIdAndUpdate(userId, { roleRef: role._id });
```

## 🎯 Common Tasks

### Create a New Permission

**Via UI:**

1. Go to RBAC Management → Permissions tab
2. Click "Add Permission"
3. Fill in: name (e.g., `create_invoice`), resource (`invoice`), action (`create`)
4. Save

**Via API:**

```bash
curl -X POST http://localhost:9001/api/v1/policy/permissions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "create_invoice",
    "resource": "invoice",
    "action": "create",
    "description": "Create new invoices"
  }'
```

### Create a Custom Role

**Via UI:**

1. Go to RBAC Management → Roles tab
2. Click "Add Role"
3. Fill in details (name, display name, description, priority)
4. Save
5. Click "Manage Permissions" to assign permissions

### Assign Permissions to Role

**Via UI:**

1. Find the role card
2. Click "Manage Permissions"
3. Check the permissions you want to assign
4. Click "Save Assignments"

## 📚 API Endpoints Reference

Base URL: `http://localhost:9001/api/v1/policy`

| Method | Endpoint                 | Description                  |
| ------ | ------------------------ | ---------------------------- |
| GET    | `/roles`                 | Get all roles                |
| POST   | `/roles`                 | Create new role              |
| PUT    | `/roles/:id`             | Update role                  |
| DELETE | `/roles/:id`             | Delete role                  |
| POST   | `/roles/:id/permissions` | Assign permissions           |
| GET    | `/permissions`           | Get all permissions          |
| POST   | `/permissions`           | Create permission            |
| PUT    | `/permissions/:id`       | Update permission            |
| DELETE | `/permissions/:id`       | Delete permission            |
| POST   | `/check-permission`      | Check user permission        |
| GET    | `/my-permissions`        | Get current user permissions |

## 🔐 Default Roles & Permissions

### Super Admin (super_admin)

- **Priority:** 100
- **Permissions:** ALL (19 permissions)
- **Use Case:** System administrator with full access

### Admin (admin)

- **Priority:** 90
- **Permissions:** All except role management and deletions
- **Use Case:** Administrative staff

### Manager (manager)

- **Priority:** 70
- **Permissions:** Read/view access, create reports
- **Use Case:** Department managers

### Supervisor (supervisor)

- **Priority:** 60
- **Permissions:** View access + device/alert management
- **Use Case:** Team supervisors

### Operator (operator)

- **Priority:** 50
- **Permissions:** View-only access
- **Use Case:** Basic operators

## 💡 Tips

1. **Start with defaults**: Use the seeded roles and permissions as a starting point
2. **Name consistently**: Use format `action_resource` (e.g., `create_invoice`, `view_dashboard`)
3. **Test thoroughly**: Always test new permissions before deploying
4. **Document custom permissions**: Keep track of what you create
5. **Review regularly**: Periodically audit user permissions

## 🐛 Troubleshooting

**Seeder fails:**

- Check MongoDB connection string in `.env`
- Ensure MongoDB is running
- Check for existing data (seeder will ask to reset)

**UI not showing:**

- Verify backend is running on correct port
- Check `VITE_API_URL` in frontend `.env`
- Check browser console for errors

**Permission not working:**

- Ensure user has `roleRef` assigned
- Verify role has the permission
- Check permission is active
- Confirm middleware is applied to route

**Cannot delete role:**

- System roles cannot be deleted
- Roles assigned to users cannot be deleted
- Reassign users first

## 📖 Learn More

For detailed documentation, see:

- `/RBAC_README.md` - Complete documentation
- `/RBAC_IMPLEMENTATION_SUMMARY.md` - Implementation details

## 🎉 You're Ready!

Your RBAC system is now fully set up and ready to use. Start by:

1. Exploring the UI
2. Creating custom roles for your organization
3. Adding permissions for your specific features
4. Protecting your routes with the middleware

Happy coding! 🚀
