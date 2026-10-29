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

router.post(
  "/",
  verifyToken,
  authorizeRoles("ADMIN"),
  createStore
);

router.get(
  "/",
  verifyToken,
  authorizeRoles("ADMIN", "USER"),
  getStores
);
module.exports = router;
