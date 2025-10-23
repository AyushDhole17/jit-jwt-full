const express = require("express");
const router = express.Router();

// Import all banking routes
const branchRoutes = require("./branch");
const customerRoutes = require("./customer");
const accountRoutes = require("./account");
const transactionRoutes = require("./transaction");
const loanRoutes = require("./loan");
const bankingController = require("../../controllers/bankingController");
const authenticateToken = require("../../middlewares/auth");
const cardRoutes = require("./card");

// Mount routes
router.use("/branches", branchRoutes);
router.use("/customers", customerRoutes);
router.use("/accounts", accountRoutes);
router.use("/transactions", transactionRoutes);
router.use("/loans", loanRoutes);
router.use("/cards", cardRoutes);

// Summary endpoint for dashboard
router.get("/summary", authenticateToken, bankingController.getSummary);

// Banking index route
router.get("/", (req, res) => {
  res.status(200).json({
    message: "Banking API v1",
    endpoints: {
      branches: "/api/v1/banking/branches",
      customers: "/api/v1/banking/customers",
      accounts: "/api/v1/banking/accounts",
      transactions: "/api/v1/banking/transactions",
      loans: "/api/v1/banking/loans",
    },
  });
});

module.exports = router;
