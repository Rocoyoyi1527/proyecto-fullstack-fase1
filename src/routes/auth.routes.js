const express = require('express');
const router = express.Router();
const { registrar, login, obtenerPerfil } = require('../controllers/auth.controller');
const { validarRegistro, validarLogin } = require('../middleware/validation');
const { verificarAutenticacion } = require('../middleware/auth');

// Rutas públicas
router.post('/registro', validarRegistro, registrar);
router.post('/login', validarLogin, login);

// Rutas protegidas
router.get('/perfil', verificarAutenticacion, obtenerPerfil);

module.exports = router;
