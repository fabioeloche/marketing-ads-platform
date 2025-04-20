const express = require('express');
const csvController = require('../controller/csvController');
const authMiddleware = require('../middleware/authMiddleware');
const uploadCsvMiddleware = require('../middleware/multerMiddleware');

const router = express.Router();
router.post(
  '/upload',
  express.raw({ type: 'text/csv', limit: '5mb' }),
  authMiddleware.protect,
  csvController.uploadCsv
);

router.put(
    '/update/:fileId',
    express.raw({ type: 'text/csv', limit: '5mb' }),
   
    uploadCsvMiddleware,
    authMiddleware.protect,
    csvController.updateCsvFile
  );

  router.delete(
    '/delete/:fileId',
    authMiddleware.protect,
    csvController.deleteCsvFile
  );

  router.get(
    '/download/:fileId',
    authMiddleware.protect,
    csvController.downloadCsvFile
  );

module.exports = router;