const express = require('express');

const adminController = require('../controller/adminControllers');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Admin routes
router.get('/users', authMiddleware.protect, adminController.getAllUsers);


module.exports = router;
