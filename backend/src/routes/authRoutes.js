const express = require("express");
const { body, validationResult } = require("express-validator");
const { register, login, } = require("../controllers/authController");

const router = express.Router();

function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  next();
}

router.post(
  "/register",
  [
    body("name")
      .trim()
      .isLength({ min: 20, max: 60 })
      .withMessage("Name must be between 20 and 60 characters"),

    body("email")
      .trim()
      .isEmail()
      .withMessage("Enter a valid email address")
      .normalizeEmail(),

    body("password")
      .isLength({ min: 8, max: 16 })
      .withMessage("Password must be 8-16 characters")
      .matches(/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/)
      .withMessage(
        "Password must contain an uppercase letter and a special character"
      ),

    body("address")
      .trim()
      .notEmpty()
      .withMessage("Address is required")
      .isLength({ max: 400 })
      .withMessage("Address cannot exceed 400 characters"),
  ],
  validateRequest,
  register
);

router.post(
  "/login",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Enter a valid email address")
      .normalizeEmail(),

    body("password")
      .notEmpty()
      .withMessage("Password is required"),
  ],
  validateRequest,
  login
);

module.exports = router;
