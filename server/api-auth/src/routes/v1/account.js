const express = require("express");
const router = express.Router();
const accountController = require("../../controllers/accountController");
const authenticateToken = require("../../middlewares/auth");
const { checkPermission } = require("../../middlewares/rbac");

// Get all accounts
router.get("/", authenticateToken, accountController.getAllAccounts);

// Get accounts by customer (must be before :accountNumber to avoid conflict)
router.get("/customer/:customerId", authenticateToken, accountController.getAccountsByCustomer);

// Check balance (must be before :accountNumber to avoid conflict)
router.get("/:accountNumber/balance", authenticateToken, accountController.checkBalance);

// Get account by account number
router.get("/:accountNumber", authenticateToken, accountController.getAccountByNumber);

// Create new account
router.post(
  "/",
  authenticateToken,
  checkPermission("account", "create"),
  accountController.createAccount
);

// Update account
router.put(
  "/:id",
  authenticateToken,
  checkPermission("account", "update"),
  accountController.updateAccount
);

// Close account
router.post(
  "/:accountNumber/close",
  authenticateToken,
  checkPermission("account", "close"),
  accountController.closeAccount
);

// Freeze account
router.post(
  "/:accountNumber/freeze",
  authenticateToken,
  checkPermission("account", "freeze"),
  accountController.freezeAccount
);

// Unfreeze account
router.post(
  "/:accountNumber/unfreeze",
  authenticateToken,
  checkPermission("account", "unfreeze"),
  accountController.unfreezeAccount
);

// Enable UPI
router.post(
  "/:accountNumber/enable-upi",
  authenticateToken,
  accountController.enableUPI
);

module.exports = router;
