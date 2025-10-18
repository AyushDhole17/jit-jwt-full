const express = require("express");
const router = express.Router();
const customerController = require("../../controllers/customerController");
const authenticateToken = require("../../middlewares/auth");
const { checkPermission } = require("../../middlewares/rbac");

// Get all customers
router.get("/", authenticateToken, customerController.getAllCustomers);

// Search customers
router.get("/search", authenticateToken, customerController.searchCustomers);

// Get customer by ID
router.get("/:id", authenticateToken, customerController.getCustomerById);

// Get customer accounts
router.get("/:id/accounts", authenticateToken, customerController.getCustomerAccounts);

// Create new customer
router.post(
  "/",
  authenticateToken,
  checkPermission("customer", "create"),
  customerController.createCustomer
);

// Update customer
router.put(
  "/:id",
  authenticateToken,
  checkPermission("customer", "update"),
  customerController.updateCustomer
);

// Verify KYC
router.post(
  "/:id/verify-kyc",
  authenticateToken,
  checkPermission("customer", "verify_kyc"),
  customerController.verifyKYC
);

// Upload KYC document
router.post(
  "/:id/upload-kyc",
  authenticateToken,
  customerController.uploadKYCDocument
);

module.exports = router;
