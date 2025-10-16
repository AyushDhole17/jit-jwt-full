const express = require("express");
const {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignPermissionsToRole,
  getAllPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  checkUserPermission,
  getUserPermissions,
  initializeRBAC,
} = require("../../controllers/policyController");
const authenticateToken = require("../../middlewares/auth");
const checkAdmin = require("../../middlewares/checkAdmin");

const router = express.Router();

// Initialize RBAC (one-time setup)
router.post("/initialize", authenticateToken, checkAdmin, initializeRBAC);

// Role routes
router.get("/roles", authenticateToken, checkAdmin, getAllRoles);
router.get("/roles/:roleId", authenticateToken, checkAdmin, getRoleById);
router.post("/roles", authenticateToken, checkAdmin, createRole);
router.put("/roles/:roleId", authenticateToken, checkAdmin, updateRole);
router.delete("/roles/:roleId", authenticateToken, checkAdmin, deleteRole);
router.post(
  "/roles/:roleId/permissions",
  authenticateToken,
  checkAdmin,
  assignPermissionsToRole
);

// Permission routes
router.get("/permissions", authenticateToken, checkAdmin, getAllPermissions);
router.post("/permissions", authenticateToken, checkAdmin, createPermission);
router.put(
  "/permissions/:permissionId",
  authenticateToken,
  checkAdmin,
  updatePermission
);
router.delete(
  "/permissions/:permissionId",
  authenticateToken,
  checkAdmin,
  deletePermission
);

// User permission check routes
router.post("/check-permission", authenticateToken, checkUserPermission);
router.get("/my-permissions", authenticateToken, getUserPermissions);

module.exports = router;
