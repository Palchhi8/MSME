const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { chatWithAi } = require('../controllers/aiController');

const router = express.Router();

router.post('/chat', authMiddleware, chatWithAi);

module.exports = router;
