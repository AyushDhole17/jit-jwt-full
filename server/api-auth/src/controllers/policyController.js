const rbacService = require("../services/rbacService");

// Role Controllers

/**
 * Get all roles
 */
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await rbacService.getAllRoles();
    res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get role by ID
 */
exports.getRoleById = async (req, res) => {
  try {
    const { roleId } = req.params;
    const role = await rbacService.getRoleById(roleId);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Create a new role
 */
exports.createRole = async (req, res) => {
  try {
    const { name, displayName, description, permissions, priority } = req.body;

    if (!name || !displayName) {
      return res.status(400).json({
        success: false,
        message: "Name and displayName are required",
      });
    }

    const roleData = {
      name,
      displayName,
      description,
      permissions: permissions || [],
      priority: priority || 0,
      isSystem: false,
    };

    const role = await rbacService.createRole(roleData);

    res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: role,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update a role
 */
exports.updateRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const updateData = req.body;

    // Prevent updating system flag
    delete updateData.isSystem;

    const role = await rbacService.updateRole(roleId, updateData);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: role,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete a role
 */
exports.deleteRole = async (req, res) => {
  try {
    const { roleId } = req.params;

    await rbacService.deleteRole(roleId);

    res.status(200).json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Assign permissions to a role
 */
exports.assignPermissionsToRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { permissionIds } = req.body;

    if (!Array.isArray(permissionIds)) {
      return res.status(400).json({
        success: false,
        message: "permissionIds must be an array",
      });
    }

    const role = await rbacService.assignPermissionsToRole(
      roleId,
      permissionIds
    );

    res.status(200).json({
      success: true,
      message: "Permissions assigned successfully",
      data: role,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Permission Controllers

/**
 * Get all permissions
 */
exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await rbacService.getAllPermissions();
    res.status(200).json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Create a new permission
 */
exports.createPermission = async (req, res) => {
  try {
    const { name, resource, action, description } = req.body;

    if (!name || !resource || !action) {
      return res.status(400).json({
        success: false,
        message: "Name, resource, and action are required",
      });
    }

    const permissionData = {
      name,
      resource,
      action,
      description,
    };

    const permission = await rbacService.createPermission(permissionData);

    res.status(201).json({
      success: true,
      message: "Permission created successfully",
      data: permission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update a permission
 */
exports.updatePermission = async (req, res) => {
  try {
    const { permissionId } = req.params;
    const updateData = req.body;

    const permission = await rbacService.updatePermission(
      permissionId,
      updateData
    );

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: "Permission not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Permission updated successfully",
      data: permission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete a permission
 */
exports.deletePermission = async (req, res) => {
  try {
    const { permissionId } = req.params;

    await rbacService.deletePermission(permissionId);

    res.status(200).json({
      success: true,
      message: "Permission deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Check user permission
 */
exports.checkUserPermission = async (req, res) => {
  try {
    const { resource, action } = req.body;
    const userId = req.user._id;

    if (!resource || !action) {
      return res.status(400).json({
        success: false,
        message: "Resource and action are required",
      });
    }

    const hasPermission = await rbacService.checkPermission(
      userId,
      resource,
      action
    );

    res.status(200).json({
      success: true,
      hasPermission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get user permissions
 */
exports.getUserPermissions = async (req, res) => {
  try {
    const userId = req.user._id;
    const permissions = await rbacService.getUserPermissions(userId);

    res.status(200).json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Initialize default RBAC
 */
exports.initializeRBAC = async (req, res) => {
  try {
    await rbacService.initializeDefaultRBAC();

    res.status(200).json({
      success: true,
      message: "RBAC initialized successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
