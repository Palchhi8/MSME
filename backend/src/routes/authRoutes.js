const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getProfile } = require('../controllers/authController');

const router = express.Router();

router.get('/me', authMiddleware, getProfile);

module.exports = router;
