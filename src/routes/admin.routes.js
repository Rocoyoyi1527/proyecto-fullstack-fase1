const express = require('express');
const router = express.Router();
const { adminLogin, verificarAdmin, getUsuarios, getTareasUsuario, getStats } = require('../controllers/admin.controller');

router.post('/admin/login', adminLogin);
router.get('/admin/stats', verificarAdmin, getStats);
router.get('/admin/usuarios', verificarAdmin, getUsuarios);
router.get('/admin/usuarios/:id/tareas', verificarAdmin, getTareasUsuario);

module.exports = router;
