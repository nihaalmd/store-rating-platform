
const express = require("express");
const {
  verifyToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  createStore,
  getStores,
} = require("../controllers/storeController");

const router = express.Router();

// Only administrators can create stores.
router.post(
  "/",
  verifyToken,
  authorizeRoles("ADMIN"),
  createStore
);

// Administrators and normal users can view stores.
router.get(
  "/",
  verifyToken,
  authorizeRoles("ADMIN", "USER"),
  getStores
);
module.exports = router;
