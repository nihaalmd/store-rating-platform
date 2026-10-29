const express = require("express");
const {
  verifyToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  createUser,
  getUsers,
  getUserById,
} = require("../controllers/userController");

const router = express.Router();

router.use(verifyToken, authorizeRoles("ADMIN"));

router.post("/", createUser);
router.get("/", getUsers);
router.get("/:id", getUserById);

module.exports = router;