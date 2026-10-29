const express = require("express");
const {
  verifyToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  getDashboard,
} = require("../controllers/storeOwnerController");

const router = express.Router();

router.get(
  "/dashboard",
  verifyToken,
  authorizeRoles("STORE_OWNER"),
  getDashboard
);

module.exports = router;
