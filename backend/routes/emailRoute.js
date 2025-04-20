const express = require("express");
const emailController = require("../controller/emailController");
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Define the route to share files via email
router.post("/share", authMiddleware.protect, emailController.shareFileByEmail);

module.exports = router;

