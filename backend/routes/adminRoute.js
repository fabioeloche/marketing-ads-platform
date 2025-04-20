const express = require('express');

const adminController = require('../controller/adminControllers');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Admin routes
router.get('/users', authMiddleware.protect, adminController.getAllUsers);
router.get('/users/:userId/files',authMiddleware.protect,  adminController.getUserFiles);
router.delete('/users/:userId',authMiddleware.protect,  adminController.deleteUser);


module.exports = router;
