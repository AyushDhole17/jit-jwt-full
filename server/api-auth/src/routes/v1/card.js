const express = require("express");
const router = express.Router();
const cardController = require("../../controllers/cardController");
const authenticateToken = require("../../middlewares/auth");
const { checkPermission } = require("../../middlewares/rbac");

// Get all cards
router.get("/", authenticateToken, cardController.getAllCards);

// Issue a new card
router.post(
  "/",
  authenticateToken,
  checkPermission("card", "issue"),
  cardController.issueCard
);

// Activate card
router.post(
  "/:id/activate",
  authenticateToken,
  checkPermission("card", "activate"),
  cardController.activateCard
);

// Block card
router.post(
  "/:id/block",
  authenticateToken,
  checkPermission("card", "block"),
  cardController.blockCard
);

// Unblock card
router.post(
  "/:id/unblock",
  authenticateToken,
  checkPermission("card", "block"),
  cardController.unblockCard
);

module.exports = router;
