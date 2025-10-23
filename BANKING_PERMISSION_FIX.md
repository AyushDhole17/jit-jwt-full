# 🔧 Banking Permission Fix - Complete Guide

## 📌 Problem Resolved

**Issue:** User `elixir.iotproducts@gmail.com` received `403 Forbidden` when trying to create branches.

**Root Cause:** User didn't have the required banking permissions assigned to their role.

**Solution:** ✅ Assigned `bank_admin` role with all 28 banking permissions.

---

## 🎯 What Was Done

### 1. **Updated Permission Model**

Added banking-specific actions to the Permission enum in `policy.js`:

```javascript
enum: [
  "create",
  "read",
  "update",
  "delete",
  "manage",
  "view",
  "execute",
  // Banking specific actions
  "verify_kyc",
  "close",
  "freeze",
  "unfreeze",
  "reverse",
  "apply",
  "approve",
  "disburse",
  "foreclose",
  "issue",
  "block",
  "activate",
];
```

### 2. **Fixed Database Connection**

Updated seeder scripts to use correct environment variable:

```javascript
// Changed from: process.env.MONGODB_URI
// Changed to: process.env.MONGO_URI || process.env.MONGODB_URI
```

### 3. **Seeded Banking RBAC**

Created 4 banking roles with appropriate permissions:

- **Bank Administrator** (28 permissions) - Full access
- **Bank Manager** (23 permissions) - Management access
- **Bank Employee** (13 permissions) - Operational access
- **Bank Customer** (5 permissions) - Self-service access

### 4. **Assigned Role to User**

User `elixir.iotproducts@gmail.com` now has:

- **Role:** admin
- **RoleRef:** bank_admin
- **Permissions:** All 28 banking permissions

---

## 🔐 Banking Permissions Breakdown

### **Branch Permissions (5)**

1. `view_branch` - View branch details
2. `create_branch` - Create new branch ✅ (Required for the failed request)
3. `update_branch` - Update branch details
4. `delete_branch` - Delete branch
5. `manage_branch` - Manage branch operations

### **Customer Permissions (5)**

6. `view_customer` - View customer details
7. `create_customer` - Create new customer
8. `update_customer` - Update customer details
9. `delete_customer` - Delete customer
10. `verify_kyc` - Verify customer KYC

### **Account Permissions (6)**

11. `view_account` - View account details
12. `create_account` - Create new account
13. `update_account` - Update account details
14. `close_account` - Close account
15. `freeze_account` - Freeze account
16. `unfreeze_account` - Unfreeze account

### **Transaction Permissions (3)**

17. `view_transaction` - View transactions
18. `create_transaction` - Process transactions
19. `reverse_transaction` - Reverse transactions

### **Loan Permissions (5)**

20. `view_loan` - View loan details
21. `apply_loan` - Apply for loan
22. `approve_loan` - Approve/reject loan
23. `disburse_loan` - Disburse loan
24. `foreclose_loan` - Foreclose loan

### **Card Permissions (4)**

25. `view_card` - View card details
26. `issue_card` - Issue new card
27. `block_card` - Block card
28. `activate_card` - Activate card

---

## 🚀 How to Assign Banking Role to New Users

### **Option 1: Using the Script (Recommended)**

1. Edit the script to change the user email:

```bash
cd server/api-auth
nano src/scripts/assignBankingRole.js
# Change: const userEmail = "elixir.iotproducts@gmail.com";
# To: const userEmail = "newuser@example.com";
```

2. Run the script:

```bash
node src/scripts/assignBankingRole.js
```

### **Option 2: Using the UI**

1. Login as an admin
2. Navigate to **Users Management** page
3. Click **Edit** on the target user
4. Click **Assign Role** button
5. Select **Bank Administrator** role
6. Click **Assign Role**

### **Option 3: Using API**

```bash
curl -X PUT http://localhost:9001/api/v1/user/assignRole/:userId \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleId": "BANK_ADMIN_ROLE_ID"
  }'
```

---

## 🛡️ Preventing Future 403 Errors

### **Best Practices**

1. **Always Seed RBAC Before Testing Banking Features**

```bash
cd server/api-auth
node src/scripts/seedBankingRBAC.js
```

2. **Verify User Permissions**

   - Check if user has `roleRef` assigned
   - Verify role has required permissions
   - Ensure role is active (`isActive: true`)

3. **Use Proper Role Assignment**

   - For banking admins → Assign `bank_admin` role
   - For branch managers → Assign `bank_manager` role
   - For tellers/employees → Assign `bank_employee` role
   - For customers → Assign `bank_customer` role

4. **Check Middleware Stack**
   - Routes use `checkPermission(resource, action)` middleware
   - User must have matching permission in their role
   - Format: `checkPermission("branch", "create")`

---

## 🔍 Debugging 403 Errors

### **Step 1: Check User's Role**

```javascript
// In MongoDB or using API
db.users.findOne({ email: "user@example.com" })

// Should have:
{
  role: "admin",
  roleRef: ObjectId("...") // Should not be null
}
```

### **Step 2: Check Role Permissions**

```javascript
db.roles.findOne({ _id: ObjectId("...") }).populate("permissions");

// Should return array of permissions including required ones
```

### **Step 3: Verify Permission Exists**

```javascript
db.permissions.findOne({
  resource: "branch",
  action: "create",
});

// Should exist with isActive: true
```

### **Step 4: Check Middleware Logic**

```javascript
// server/api-auth/src/middlewares/rbac.js
// Logs permission check results

// server/api-auth/src/services/rbacService.js
// checkPermission() method handles the verification
```

---

## 📋 Quick Reference Commands

### **Seed Banking RBAC**

```bash
cd server/api-auth
node src/scripts/seedBankingRBAC.js
```

### **Assign Bank Admin Role**

```bash
cd server/api-auth
# Edit src/scripts/assignBankingRole.js to set correct email
node src/scripts/assignBankingRole.js
```

### **Check User's Current Role**

```bash
# Using MongoDB shell
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/spp"
db.users.findOne({ email: "user@example.com" }, { role: 1, roleRef: 1 })
```

### **List All Banking Roles**

```bash
# Using MongoDB shell
db.roles.find({ name: /^bank_/ })
```

### **List All Banking Permissions**

```bash
# Using MongoDB shell
db.permissions.find({ resource: { $in: ["branch", "customer", "account", "transaction", "loan", "card"] } })
```

---

## 🎓 Understanding RBAC Flow

### **Request Flow**

```
1. User makes request → POST /api/v1/banking/branches
   ↓
2. authenticateToken middleware
   - Verifies JWT token
   - Attaches user to req.user
   ↓
3. checkPermission("branch", "create") middleware
   - Gets user from req.user
   - Loads user's roleRef with permissions
   - Checks if any permission matches:
     * resource === "branch"
     * action === "create" OR action === "manage"
   ↓
4. If permission exists → next() → controller
   If permission missing → 403 Forbidden
```

### **Permission Matching Logic**

```javascript
// From rbacService.js
const hasPermission = role.permissions.some(
  (permission) =>
    permission.isActive &&
    permission.resource === resource &&
    (permission.action === action || permission.action === "manage")
);
```

**Note:** `manage` action grants all permissions for a resource.

---

## 📊 Role Comparison Matrix

| Permission          | Bank Admin | Bank Manager | Bank Employee | Bank Customer |
| ------------------- | ---------- | ------------ | ------------- | ------------- |
| create_branch       | ✅         | ❌           | ❌            | ❌            |
| update_branch       | ✅         | ✅           | ❌            | ❌            |
| view_branch         | ✅         | ✅           | ✅            | ❌            |
| create_customer     | ✅         | ✅           | ✅            | ❌            |
| verify_kyc          | ✅         | ✅           | ❌            | ❌            |
| create_account      | ✅         | ✅           | ✅            | ❌            |
| freeze_account      | ✅         | ✅           | ❌            | ❌            |
| create_transaction  | ✅         | ✅           | ✅            | ❌            |
| reverse_transaction | ✅         | ❌           | ❌            | ❌            |
| approve_loan        | ✅         | ✅           | ❌            | ❌            |
| apply_loan          | ✅         | ✅           | ✅            | ✅            |
| issue_card          | ✅         | ✅           | ✅            | ❌            |
| view_account        | ✅         | ✅           | ✅            | ✅            |

---

## 🎯 Testing After Fix

### **1. Test Branch Creation**

```bash
# Login first to get token
curl -X POST http://localhost:9001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "elixir.iotproducts@gmail.com",
    "password": "YOUR_PASSWORD"
  }'

# Use the token to create branch
curl -X POST http://localhost:9001/api/v1/banking/branches \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "branchCode": "BR001",
    "branchName": "Main Branch",
    "ifscCode": "BANK0000001",
    "micrCode": "123456789",
    "phone": "9876543210",
    "email": "branch@bank.com",
    "address": {
      "line1": "123 Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    }
  }'
```

### **2. Expected Response**

```json
{
  "success": true,
  "message": "Branch created successfully",
  "data": {
    "_id": "...",
    "branchCode": "BR001",
    "branchName": "Main Branch",
    ...
  }
}
```

---

## ✅ Verification Checklist

After applying the fix, verify:

- [ ] User has `roleRef` field populated
- [ ] Role name is `bank_admin`
- [ ] Role has 28 permissions
- [ ] All banking endpoints return 200/201 (not 403)
- [ ] User can create branches ✅
- [ ] User can create customers
- [ ] User can create accounts
- [ ] User can create transactions
- [ ] User can see banking dashboard

---

## 📝 Summary

**Problem:** 403 Forbidden on `POST /api/v1/banking/branches`

**Root Cause:** Missing `create_branch` permission

**Solution:**

1. ✅ Updated Permission model with banking actions
2. ✅ Seeded banking RBAC (4 roles, 28 permissions)
3. ✅ Assigned `bank_admin` role to user

**Result:** User can now access all banking features! 🎉

---

## 🆘 Still Getting 403?

If you still face issues:

1. **Clear browser cache and logout/login** - Token needs to be refreshed
2. **Verify .env file** - Check MONGO_URI is correct
3. **Check MongoDB connection** - Ensure database is accessible
4. **Run seeder again** - `node src/scripts/seedBankingRBAC.js`
5. **Verify user assignment** - `node src/scripts/assignBankingRole.js`

**Contact:** Check logs in `server/api-auth/` terminal for detailed error messages.

---

**Last Updated:** October 19, 2025  
**Status:** ✅ Resolved  
**User Affected:** elixir.iotproducts@gmail.com  
**Fix Applied:** Bank Administrator role with full permissions
