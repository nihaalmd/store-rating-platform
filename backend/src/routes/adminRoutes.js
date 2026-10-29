const express = require("express");
const {
  verifyToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const {
  getDashboardStats,
} = require("../controllers/adminController");

const router = express.Router();

router.get(
  "/dashboard",
  verifyToken,
  authorizeRoles("ADMIN"),
  getDashboardStats
);

module.exports = router;
