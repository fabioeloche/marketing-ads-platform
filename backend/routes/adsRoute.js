const express = require('express');
const adsController = require('../controller/adsController');
const authMiddleware = require('../middleware/authMiddleware');
const { check } = require('express-validator');


const router = express.Router();

router.get('/allfile',authMiddleware.protect, adsController.getAllAds);

module.exports = router;