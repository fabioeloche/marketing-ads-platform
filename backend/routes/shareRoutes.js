const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const shareController = require('../controller/shareController');

const router = express.Router();

router.put('/update-general-access/:fileId', authMiddleware.protect, shareController.updateGeneralAccess);

module.exports = router;