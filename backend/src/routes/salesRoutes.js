const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const {
  uploadSales,
  getAllSales,
  getSalesSummary
} = require('../controllers/salesController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }
});

router.post('/upload', authMiddleware, upload.single('file'), uploadSales);
router.get('/all', authMiddleware, getAllSales);
router.get('/summary', authMiddleware, getSalesSummary);

module.exports = router;
