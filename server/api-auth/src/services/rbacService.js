const { Role, Permission, RolePermission } = require("../models/policy");
const User = require("../models/User");

class RBACService {
  /**
   * Check if a user has a specific permission
   * @param {String} userId - User ID
   * @param {String} resource - Resource name
   * @param {String} action - Action type
   * @returns {Boolean}
   */
  async checkPermission(userId, resource, action) {
    try {
      const user = await User.findById(userId).populate({
        path: "roleRef",
        populate: {
          path: "permissions",
        },
      });

      if (!user || !user.roleRef) {
        return false;
      }

      const role = user.roleRef;
      if (!role.isActive) {
        return false;
      }

      // Check if any permission matches
      const hasPermission = role.permissions.some(
        (permission) =>
          permission.isActive &&
          permission.resource === resource &&
          (permission.action === action || permission.action === "manage")
      );

      return hasPermission;
    } catch (error) {
      console.error("Error checking permission:", error);
      return false;
    }
  }

  /**
   * Get all permissions for a user
   * @param {String} userId - User ID
   * @returns {Array} - Array of permissions
   */
  async getUserPermissions(userId) {
    try {
      const user = await User.findById(userId).populate({
        path: "roleRef",
        populate: {
          path: "permissions",
        },
      });

      if (!user || !user.roleRef) {
        return [];
      }

      return user.roleRef.permissions.filter((p) => p.isActive);
    } catch (error) {
      console.error("Error getting user permissions:", error);
      return [];
    }
  }

  /**
   * Create a new role
   * @param {Object} roleData - Role data
   * @returns {Object} - Created role
   */
  async createRole(roleData) {
    try {
      const role = new Role(roleData);
      await role.save();
      return role;
    } catch (error) {
      throw new Error(`Error creating role: ${error.message}`);
    }
  }

  /**
   * Update a role
   * @param {String} roleId - Role ID
   * @param {Object} updateData - Update data
   * @returns {Object} - Updated role
   */
  async updateRole(roleId, updateData) {
    try {
      const role = await Role.findByIdAndUpdate(roleId, updateData, {
        new: true,
      }).populate("permissions");
      return role;
    } catch (error) {
      throw new Error(`Error updating role: ${error.message}`);
    }
  }

  /**
   * Delete a role
   * @param {String} roleId - Role ID
   * @returns {Boolean}
   */
  async deleteRole(roleId) {
    try {
      const role = await Role.findById(roleId);

      if (!role) {
        throw new Error("Role not found");
      }

      if (role.isSystem) {
        throw new Error("Cannot delete system role");
      }

      // Check if any users have this role
      const usersWithRole = await User.countDocuments({ roleRef: roleId });
      if (usersWithRole > 0) {
        throw new Error(
          "Cannot delete role that is assigned to users. Please reassign users first."
        );
      }

      await Role.findByIdAndDelete(roleId);
      return true;
    } catch (error) {
      throw new Error(`Error deleting role: ${error.message}`);
    }
  }

  /**
   * Get all roles
   * @returns {Array} - Array of roles
   */
  async getAllRoles() {
    try {
      const roles = await Role.find()
        .populate("permissions")
        .sort({ priority: -1 });
      return roles;
    } catch (error) {
      throw new Error(`Error getting roles: ${error.message}`);
    }
  }

  /**
   * Get role by ID
   * @param {String} roleId - Role ID
   * @returns {Object} - Role
   */
  async getRoleById(roleId) {
    try {
      const role = await Role.findById(roleId).populate("permissions");
      return role;
    } catch (error) {
      throw new Error(`Error getting role: ${error.message}`);
    }
  }

  /**
   * Create a new permission
   * @param {Object} permissionData - Permission data
   * @returns {Object} - Created permission
   */
  async createPermission(permissionData) {
    try {
      const permission = new Permission(permissionData);
      await permission.save();
      return permission;
    } catch (error) {
      throw new Error(`Error creating permission: ${error.message}`);
    }
  }

  /**
   * Update a permission
   * @param {String} permissionId - Permission ID
   * @param {Object} updateData - Update data
   * @returns {Object} - Updated permission
   */
  async updatePermission(permissionId, updateData) {
    try {
      const permission = await Permission.findByIdAndUpdate(
        permissionId,
        updateData,
        { new: true }
      );
      return permission;
    } catch (error) {
      throw new Error(`Error updating permission: ${error.message}`);
    }
  }

  /**
   * Delete a permission
   * @param {String} permissionId - Permission ID
   * @returns {Boolean}
   */
  async deletePermission(permissionId) {
    try {
      // Remove permission from all roles
      await Role.updateMany(
        { permissions: permissionId },
        { $pull: { permissions: permissionId } }
      );

      await Permission.findByIdAndDelete(permissionId);
      return true;
    } catch (error) {
      throw new Error(`Error deleting permission: ${error.message}`);
    }
  }

  /**
   * Get all permissions
   * @returns {Array} - Array of permissions
   */
  async getAllPermissions() {
    try {
      const permissions = await Permission.find().sort({
        resource: 1,
        action: 1,
      });
      return permissions;
    } catch (error) {
      throw new Error(`Error getting permissions: ${error.message}`);
    }
  }

  /**
   * Assign permissions to a role
   * @param {String} roleId - Role ID
   * @param {Array} permissionIds - Array of permission IDs
   * @returns {Object} - Updated role
   */
  async assignPermissionsToRole(roleId, permissionIds) {
    try {
      const role = await Role.findByIdAndUpdate(
        roleId,
        { permissions: permissionIds },
        { new: true }
      ).populate("permissions");
      return role;
    } catch (error) {
      throw new Error(`Error assigning permissions: ${error.message}`);
    }
  }

  /**
   * Initialize default roles and permissions
   */
  async initializeDefaultRBAC() {
    try {
      // Check if already initialized
      const existingRoles = await Role.countDocuments();
      if (existingRoles > 0) {
        console.log("RBAC already initialized");
        return;
      }

      // Create default permissions
      const permissions = await Permission.insertMany([
        // User management
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

        // Role management
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
      ]);

      // Create default roles
      const superAdminRole = await Role.create({
        name: "super_admin",
        displayName: "Super Admin",
        description: "Full system access",
        permissions: permissions.map((p) => p._id),
        isSystem: true,
        priority: 100,
      });

      const adminRole = await Role.create({
        name: "admin",
        displayName: "Admin",
        description: "Administrative access",
        permissions: permissions
          .filter((p) => !p.name.includes("role") && !p.name.includes("delete"))
          .map((p) => p._id),
        isSystem: true,
        priority: 90,
      });

      const managerRole = await Role.create({
        name: "manager",
        displayName: "Manager",
        description: "Manager access",
        permissions: permissions
          .filter(
            (p) =>
              p.action === "read" ||
              p.action === "view" ||
              p.resource === "reports"
          )
          .map((p) => p._id),
        isSystem: true,
        priority: 70,
      });

      const operatorRole = await Role.create({
        name: "operator",
        displayName: "Operator",
        description: "Basic operator access",
        permissions: permissions
          .filter(
            (p) =>
              p.action === "view" ||
              (p.resource === "dashboard" && p.action === "view")
          )
          .map((p) => p._id),
        isSystem: true,
        priority: 50,
      });

      console.log("Default RBAC initialized successfully");
    } catch (error) {
      console.error("Error initializing RBAC:", error);
      throw error;
    }
  }
}

module.exports = new RBACService();
