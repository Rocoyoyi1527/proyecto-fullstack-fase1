const express = require('express');
const router = express.Router();
const { heartbeat, getEstadoUsuarios } = require('../controllers/heartbeat.controller');
const { verificarAutenticacion } = require('../middleware/auth');

router.post('/heartbeat', verificarAutenticacion, heartbeat);

module.exports = router;
