const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const {
  uploadWeeklyReportController,
  getWeeklyReportsController,
  getMonthlyReportsController,
  deleteWeeklyReportController
} = require('../controllers/reportController');

const router = express.Router();
const upload = multer();

router.post(
  '/upload-weekly',
  authMiddleware,
  upload.single('file'),
  uploadWeeklyReportController
);
router.get('/weekly', authMiddleware, getWeeklyReportsController);
router.get('/monthly', authMiddleware, getMonthlyReportsController);
router.delete('/weekly/:id', authMiddleware, deleteWeeklyReportController);

module.exports = router;


