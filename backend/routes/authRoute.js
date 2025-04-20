const express = require("express");
const authController = require("../controller/authController");
const { check } = require("express-validator");

const router = express.Router();

const registerValidation = [
    check("name").notEmpty().withMessage("Name is required"),
    check("email").isEmail().withMessage("Invalid email"),
    check("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ];

// Register route
router.post("/register", registerValidation, authController.register);


module.exports = router;