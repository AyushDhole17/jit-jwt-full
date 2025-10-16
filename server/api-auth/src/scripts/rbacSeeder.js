/**
 * RBAC Seeder Script
 * Run this script to initialize the RBAC system with default roles and permissions
 *
 * Usage: node src/scripts/rbacSeeder.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const { Role, Permission } = require("../models/policy");
const User = require("../models/User");

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

// Seed RBAC data
const seedRBAC = async () => {
  try {
    console.log("\n🌱 Starting RBAC Seeding...\n");

    // Check if already seeded
    const existingRoles = await Role.countDocuments();
    if (existingRoles > 0) {
      console.log("⚠️  RBAC data already exists!");
      const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      return new Promise((resolve) => {
        readline.question(
          "Do you want to reset and reseed? (yes/no): ",
          async (answer) => {
            readline.close();
            if (answer.toLowerCase() === "yes") {
              console.log("\n🗑️  Clearing existing RBAC data...");
              await Permission.deleteMany({});
              await Role.deleteMany({});
              await performSeeding();
              resolve();
            } else {
              console.log("\n❌ Seeding cancelled");
              resolve();
            }
          }
        );
      });
    } else {
      await performSeeding();
    }
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    throw error;
  }
};

const performSeeding = async () => {
  console.log("\n📝 Creating Permissions...");

  // Create permissions
  const permissions = [
    // User Management
    {
      name: "create_user",
      resource: "user",
      action: "create",
      description: "Create new users",
    },
    {
      name: "read_user",
      resource: "user",
      action: "read",
      description: "View user details",
    },
    {
      name: "update_user",
      resource: "user",
      action: "update",
      description: "Update user information",
    },
    {
      name: "delete_user",
      resource: "user",
      action: "delete",
      description: "Delete users",
    },
    {
      name: "manage_user",
      resource: "user",
      action: "manage",
      description: "Full user management",
    },

    // Role Management
    {
      name: "create_role",
      resource: "role",
      action: "create",
      description: "Create new roles",
    },
    {
      name: "read_role",
      resource: "role",
      action: "read",
      description: "View role details",
    },
    {
      name: "update_role",
      resource: "role",
      action: "update",
      description: "Update roles",
    },
    {
      name: "delete_role",
      resource: "role",
      action: "delete",
      description: "Delete roles",
    },
    {
      name: "manage_role",
      resource: "role",
      action: "manage",
      description: "Full role management",
    },

    // Dashboard
    {
      name: "view_dashboard",
      resource: "dashboard",
      action: "view",
      description: "View dashboard",
    },

    // Reports
    {
      name: "view_reports",
      resource: "reports",
      action: "view",
      description: "View reports",
    },
    {
      name: "create_reports",
      resource: "reports",
      action: "create",
      description: "Create reports",
    },

    // Settings
    {
      name: "view_settings",
      resource: "settings",
      action: "view",
      description: "View settings",
    },
    {
      name: "update_settings",
      resource: "settings",
      action: "update",
      description: "Update settings",
    },

    // Device Properties
    {
      name: "view_device",
      resource: "device",
      action: "view",
      description: "View device properties",
    },
    {
      name: "update_device",
      resource: "device",
      action: "update",
      description: "Update device properties",
    },

    // Alerts
    {
      name: "view_alerts",
      resource: "alerts",
      action: "view",
      description: "View alerts",
    },
    {
      name: "manage_alerts",
      resource: "alerts",
      action: "manage",
      description: "Manage alerts",
    },
  ];

  const createdPermissions = await Permission.insertMany(permissions);
  console.log(`✅ Created ${createdPermissions.length} permissions`);

  // Create permission map for easy access
  const permissionMap = {};
  createdPermissions.forEach((p) => {
    permissionMap[p.name] = p._id;
  });

  console.log("\n👥 Creating Roles...");

  // Create Super Admin Role
  const superAdminRole = await Role.create({
    name: "super_admin",
    displayName: "Super Admin",
    description: "Full system access with all permissions",
    permissions: createdPermissions.map((p) => p._id),
    isSystem: true,
    priority: 100,
    isActive: true,
  });
  console.log("✅ Created Super Admin role");

  // Create Admin Role
  const adminPermissions = createdPermissions
    .filter((p) => !p.name.includes("role") && !p.name.includes("delete"))
    .map((p) => p._id);

  const adminRole = await Role.create({
    name: "admin",
    displayName: "Admin",
    description: "Administrative access without role management",
    permissions: adminPermissions,
    isSystem: true,
    priority: 90,
    isActive: true,
  });
  console.log("✅ Created Admin role");

  // Create Manager Role
  const managerPermissions = createdPermissions
    .filter(
      (p) =>
        p.action === "read" ||
        p.action === "view" ||
        p.resource === "reports" ||
        p.resource === "dashboard"
    )
    .map((p) => p._id);

  const managerRole = await Role.create({
    name: "manager",
    displayName: "Manager",
    description: "Manager access with read/view permissions",
    permissions: managerPermissions,
    isSystem: true,
    priority: 70,
    isActive: true,
  });
  console.log("✅ Created Manager role");

  // Create Operator Role
  const operatorPermissions = createdPermissions
    .filter(
      (p) =>
        p.action === "view" &&
        (p.resource === "dashboard" ||
          p.resource === "device" ||
          p.resource === "alerts")
    )
    .map((p) => p._id);

  const operatorRole = await Role.create({
    name: "operator",
    displayName: "Operator",
    description: "Basic operator access with view-only permissions",
    permissions: operatorPermissions,
    isSystem: true,
    priority: 50,
    isActive: true,
  });
  console.log("✅ Created Operator role");

  // Create Supervisor Role
  const supervisorPermissions = createdPermissions
    .filter(
      (p) =>
        p.action === "view" ||
        (p.resource === "device" && p.action === "update") ||
        (p.resource === "alerts" && p.action === "manage")
    )
    .map((p) => p._id);

  const supervisorRole = await Role.create({
    name: "supervisor",
    displayName: "Supervisor",
    description: "Supervisor with device and alert management",
    permissions: supervisorPermissions,
    isSystem: true,
    priority: 60,
    isActive: true,
  });
  console.log("✅ Created Supervisor role");

  console.log("\n📊 RBAC Summary:");
  console.log(`   Permissions: ${createdPermissions.length}`);
  console.log(`   Roles: 5`);
  console.log("\n✨ RBAC seeding completed successfully!\n");

  // Optional: Update existing users with roleRef
  console.log("🔄 Updating existing users with role references...");
  const roleMapping = {
    super: superAdminRole._id,
    admin: adminRole._id,
    manager: managerRole._id,
    supervisor: supervisorRole._id,
    operator: operatorRole._id,
  };

  for (const [roleName, roleId] of Object.entries(roleMapping)) {
    const result = await User.updateMany(
      { role: roleName, roleRef: { $exists: false } },
      { $set: { roleRef: roleId } }
    );
    if (result.modifiedCount > 0) {
      console.log(`✅ Updated ${result.modifiedCount} ${roleName} users`);
    }
  }

  console.log("\n🎉 All done!\n");
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await seedRBAC();
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Fatal Error:", error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { seedRBAC };
