const express = require('express');
const router = express.Router();
const { verificarAutenticacion } = require('../middleware/auth');
const chatController = require('../controllers/chat.controller');

router.post('/chat', verificarAutenticacion, chatController.chat);

module.exports = router;
