const express = require("express");
const router = express.Router();
const transactionController = require("../../controllers/transactionController");
const authenticateToken = require("../../middlewares/auth");
const { checkPermission } = require("../../middlewares/rbac");

// Get all transactions
router.get("/", authenticateToken, transactionController.getAllTransactions);

// Get account statement (must be before :transactionId to avoid conflict)
router.get(
  "/statement/:accountNumber",
  authenticateToken,
  transactionController.getAccountStatement
);

// Get transaction by ID
router.get("/:transactionId", authenticateToken, transactionController.getTransactionById);

// Deposit
router.post(
  "/deposit",
  authenticateToken,
  checkPermission("transaction", "create"),
  transactionController.deposit
);

// Withdrawal
router.post(
  "/withdrawal",
  authenticateToken,
  checkPermission("transaction", "create"),
  transactionController.withdrawal
);

// Transfer
router.post(
  "/transfer",
  authenticateToken,
  checkPermission("transaction", "create"),
  transactionController.transfer
);

// UPI Transfer
router.post(
  "/upi-transfer",
  authenticateToken,
  transactionController.upiTransfer
);

// Reverse transaction
router.post(
  "/:transactionId/reverse",
  authenticateToken,
  checkPermission("transaction", "reverse"),
  transactionController.reverseTransaction
);

module.exports = router;
