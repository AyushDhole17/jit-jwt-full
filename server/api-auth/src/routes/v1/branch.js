const express = require("express");
const router = express.Router();
const branchController = require("../../controllers/branchController");
const authenticateToken = require("../../middlewares/auth");
const { checkPermission } = require("../../middlewares/rbac");

// Get all branches
router.get("/", authenticateToken, branchController.getAllBranches);

// Get branch statistics (must be before /:id to avoid conflict)
router.get("/:id/stats", authenticateToken, branchController.getBranchStats);

// Get branch by ID
router.get("/:id", authenticateToken, branchController.getBranchById);

// Create new branch (Admin only)
router.post(
  "/",
  authenticateToken,
  checkPermission("branch", "create"),
  branchController.createBranch
);

// Update branch (Admin/Manager)
router.put(
  "/:id",
  authenticateToken,
  checkPermission("branch", "update"),
  branchController.updateBranch
);

// Delete branch (Admin only)
router.delete(
  "/:id",
  authenticateToken,
  checkPermission("branch", "delete"),
  branchController.deleteBranch
);

// Assign manager to branch
router.post(
  "/:id/assign-manager",
  authenticateToken,
  checkPermission("branch", "manage"),
  branchController.assignManager
);

module.exports = router;
