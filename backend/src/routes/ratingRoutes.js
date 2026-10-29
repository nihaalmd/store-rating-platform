const express = require("express");
const {
  verifyToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  submitRating,
  getMyRatings,
} = require("../controllers/ratingController");

const router = express.Router();

router.post(
  "/",
  verifyToken,
  authorizeRoles("USER"),
  submitRating
);

router.get(
  "/mine",
  verifyToken,
  authorizeRoles("USER"),
  getMyRatings
);

module.exports = router;
