const express = require('express');
const router = express.Router();
const { registrar, verificarEmail, login, obtenerPerfil } = require('../controllers/auth.controller');
const { verificarAutenticacion } = require('../middleware/auth');

router.post('/registrar', registrar);
router.post('/verificar-email', verificarEmail);
router.post('/login', login);
router.get('/perfil', verificarAutenticacion, obtenerPerfil);

module.exports = router;
