const express = require('express');
const csvController = require('../controller/csvController');

const router = express.Router();
router.post(
  '/upload',
  express.raw({ type: 'text/csv', limit: '5mb' }),
  authMiddleware.protect,
  csvController.uploadCsv
);

module.exports = router;