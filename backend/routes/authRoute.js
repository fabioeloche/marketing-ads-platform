const express = require("express");
const authController = require("../controller/authController");
const { check } = require("express-validator");

const router = express.Router();

const registerValidation = [
    check("name").notEmpty().withMessage("Name is required"),
    check("email").isEmail().withMessage("Invalid email"),
    check("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ];

// Validation middleware for login
const loginValidation = [
    check("email").isEmail().withMessage("Invalid email"),
    check("password").notEmpty().withMessage("Password is required"),
  ];

// Register route
router.post("/register", registerValidation, authController.register);

// Login route
router.post("/login", loginValidation, authController.login);


module.exports = router;