require("dotenv").config();
const mongoose = require("mongoose");
const { Permission, Role } = require("../models/policy");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const bankingPermissions = [
  // Branch permissions
  {
    name: "view_branch",
    resource: "branch",
    action: "view",
    description: "View branch details",
  },
  {
    name: "create_branch",
    resource: "branch",
    action: "create",
    description: "Create new branch",
  },
  {
    name: "update_branch",
    resource: "branch",
    action: "update",
    description: "Update branch details",
  },
  {
    name: "delete_branch",
    resource: "branch",
    action: "delete",
    description: "Delete branch",
  },
  {
    name: "manage_branch",
    resource: "branch",
    action: "manage",
    description: "Manage branch operations",
  },

  // Customer permissions
  {
    name: "view_customer",
    resource: "customer",
    action: "view",
    description: "View customer details",
  },
  {
    name: "create_customer",
    resource: "customer",
    action: "create",
    description: "Create new customer",
  },
  {
    name: "update_customer",
    resource: "customer",
    action: "update",
    description: "Update customer details",
  },
  {
    name: "delete_customer",
    resource: "customer",
    action: "delete",
    description: "Delete customer",
  },
  {
    name: "verify_kyc",
    resource: "customer",
    action: "verify_kyc",
    description: "Verify customer KYC",
  },

  // Account permissions
  {
    name: "view_account",
    resource: "account",
    action: "view",
    description: "View account details",
  },
  {
    name: "create_account",
    resource: "account",
    action: "create",
    description: "Create new account",
  },
  {
    name: "update_account",
    resource: "account",
    action: "update",
    description: "Update account details",
  },
  {
    name: "close_account",
    resource: "account",
    action: "close",
    description: "Close account",
  },
  {
    name: "freeze_account",
    resource: "account",
    action: "freeze",
    description: "Freeze account",
  },
  {
    name: "unfreeze_account",
    resource: "account",
    action: "unfreeze",
    description: "Unfreeze account",
  },

  // Transaction permissions
  {
    name: "view_transaction",
    resource: "transaction",
    action: "view",
    description: "View transactions",
  },
  {
    name: "create_transaction",
    resource: "transaction",
    action: "create",
    description: "Process transactions",
  },
  {
    name: "reverse_transaction",
    resource: "transaction",
    action: "reverse",
    description: "Reverse transactions",
  },

  // Loan permissions
  {
    name: "view_loan",
    resource: "loan",
    action: "view",
    description: "View loan details",
  },
  {
    name: "apply_loan",
    resource: "loan",
    action: "apply",
    description: "Apply for loan",
  },
  {
    name: "approve_loan",
    resource: "loan",
    action: "approve",
    description: "Approve/reject loan",
  },
  {
    name: "disburse_loan",
    resource: "loan",
    action: "disburse",
    description: "Disburse loan",
  },
  {
    name: "foreclose_loan",
    resource: "loan",
    action: "foreclose",
    description: "Foreclose loan",
  },

  // Card permissions
  {
    name: "view_card",
    resource: "card",
    action: "view",
    description: "View card details",
  },
  {
    name: "issue_card",
    resource: "card",
    action: "issue",
    description: "Issue new card",
  },
  {
    name: "block_card",
    resource: "card",
    action: "block",
    description: "Block card",
  },
  {
    name: "activate_card",
    resource: "card",
    action: "activate",
    description: "Activate card",
  },
];

const rolePermissions = {
  bank_admin: [
    // Full access to all banking features
    "view_branch",
    "create_branch",
    "update_branch",
    "delete_branch",
    "manage_branch",
    "view_customer",
    "create_customer",
    "update_customer",
    "delete_customer",
    "verify_kyc",
    "view_account",
    "create_account",
    "update_account",
    "close_account",
    "freeze_account",
    "unfreeze_account",
    "view_transaction",
    "create_transaction",
    "reverse_transaction",
    "view_loan",
    "apply_loan",
    "approve_loan",
    "disburse_loan",
    "foreclose_loan",
    "view_card",
    "issue_card",
    "block_card",
    "activate_card",
  ],
  bank_manager: [
    // Manager level access
    "view_branch",
    "update_branch",
    "manage_branch",
    "view_customer",
    "create_customer",
    "update_customer",
    "verify_kyc",
    "view_account",
    "create_account",
    "update_account",
    "close_account",
    "freeze_account",
    "unfreeze_account",
    "view_transaction",
    "create_transaction",
    "view_loan",
    "apply_loan",
    "approve_loan",
    "disburse_loan",
    "view_card",
    "issue_card",
    "block_card",
    "activate_card",
  ],
  bank_employee: [
    // Employee level access
    "view_branch",
    "view_customer",
    "create_customer",
    "update_customer",
    "view_account",
    "create_account",
    "update_account",
    "view_transaction",
    "create_transaction",
    "view_loan",
    "apply_loan",
    "view_card",
    "issue_card",
  ],
  bank_customer: [
    // Customer level access (view only + self-service)
    "view_account",
    "view_transaction",
    "view_loan",
    "apply_loan",
    "view_card",
  ],
};

const seedBankingRBAC = async () => {
  try {
    await connectDB();

    console.log("🌱 Starting banking RBAC seeder...\n");

    // Step 1: Create permissions
    console.log("📝 Creating banking permissions...");
    const createdPermissions = {};

    for (const perm of bankingPermissions) {
      const existingPerm = await Permission.findOne({ name: perm.name });
      if (existingPerm) {
        console.log(`   ✓ Permission already exists: ${perm.name}`);
        createdPermissions[perm.name] = existingPerm._id;
      } else {
        const newPerm = await Permission.create(perm);
        createdPermissions[perm.name] = newPerm._id;
        console.log(`   ✓ Created permission: ${perm.name}`);
      }
    }

    console.log(
      `\n✅ ${Object.keys(createdPermissions).length} permissions ready\n`
    );

    // Step 2: Create/Update banking roles
    console.log("👥 Creating/Updating banking roles...\n");

    const rolesToCreate = [
      {
        name: "bank_admin",
        displayName: "Bank Administrator",
        description: "Full access to all banking operations",
        priority: 100,
        isSystem: false,
      },
      {
        name: "bank_manager",
        displayName: "Bank Manager",
        description: "Branch management and loan approval authority",
        priority: 80,
        isSystem: false,
      },
      {
        name: "bank_employee",
        displayName: "Bank Employee",
        description: "Day-to-day banking operations",
        priority: 60,
        isSystem: false,
      },
      {
        name: "bank_customer",
        displayName: "Bank Customer",
        description: "Customer self-service access",
        priority: 40,
        isSystem: false,
      },
    ];

    for (const roleData of rolesToCreate) {
      const permissionIds = rolePermissions[roleData.name]
        .map((permName) => createdPermissions[permName])
        .filter(Boolean);

      const existingRole = await Role.findOne({ name: roleData.name });
      if (existingRole) {
        existingRole.permissions = permissionIds;
        existingRole.displayName = roleData.displayName;
        existingRole.description = roleData.description;
        existingRole.priority = roleData.priority;
        await existingRole.save();
        console.log(
          `   ✓ Updated role: ${roleData.displayName} (${permissionIds.length} permissions)`
        );
      } else {
        roleData.permissions = permissionIds;
        await Role.create(roleData);
        console.log(
          `   ✓ Created role: ${roleData.displayName} (${permissionIds.length} permissions)`
        );
      }
    }

    console.log("\n✅ Banking RBAC seeding completed successfully!\n");
    console.log("📊 Summary:");
    console.log(`   • ${bankingPermissions.length} permissions`);
    console.log(`   • ${rolesToCreate.length} roles`);
    console.log("\n🚀 Banking system is ready to use!\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding banking RBAC:", error);
    process.exit(1);
  }
};

// Run seeder
seedBankingRBAC();
