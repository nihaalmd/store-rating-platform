
const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const {
  updatePassword,
} = require("../controllers/passwordController");

const router = express.Router();

router.patch("/", verifyToken, updatePassword);

module.exports = router;