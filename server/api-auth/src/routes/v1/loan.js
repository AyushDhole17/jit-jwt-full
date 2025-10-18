const express = require("express");
const router = express.Router();
const loanController = require("../../controllers/loanController");
const authenticateToken = require("../../middlewares/auth");
const { checkPermission } = require("../../middlewares/rbac");

// Get all loans
router.get("/", authenticateToken, loanController.getAllLoans);

// Get loan stats for customer (must be before :loanNumber to avoid conflict)
router.get("/stats/:customerId", authenticateToken, loanController.getLoanStats);

// Apply for loan (must be before :loanNumber to avoid conflict)
router.post(
  "/apply",
  authenticateToken,
  checkPermission("loan", "apply"),
  loanController.applyLoan
);

// Get loan by loan number
router.get("/:loanNumber", authenticateToken, loanController.getLoanByNumber);

// Approve loan (Manager/Admin only)
router.post(
  "/:loanNumber/approve",
  authenticateToken,
  checkPermission("loan", "approve"),
  loanController.approveLoan
);

// Reject loan (Manager/Admin only)
router.post(
  "/:loanNumber/reject",
  authenticateToken,
  checkPermission("loan", "approve"),
  loanController.rejectLoan
);

// Disburse loan (Manager/Admin only)
router.post(
  "/:loanNumber/disburse",
  authenticateToken,
  checkPermission("loan", "disburse"),
  loanController.disburseLoan
);

// Repay EMI
router.post(
  "/:loanNumber/repay",
  authenticateToken,
  loanController.repayEMI
);

// Foreclose loan
router.post(
  "/:loanNumber/foreclose",
  authenticateToken,
  checkPermission("loan", "foreclose"),
  loanController.foreclose
);

module.exports = router;
