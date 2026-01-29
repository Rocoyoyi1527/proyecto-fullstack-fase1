const express = require('express');
const router = express.Router();
const {
  crearTarea,
  obtenerTareas,
  obtenerMisTareas,
  obtenerTareaPorId,
  actualizarTarea,
  eliminarTarea
} = require('../controllers/task.controller');
const { validarTarea } = require('../middleware/validation');
const { verificarAutenticacion } = require('../middleware/auth');

// Rutas públicas (solo lectura)
router.get('/', obtenerTareas);
router.get('/:id', obtenerTareaPorId);

// Rutas protegidas (requieren autenticación)
router.get('/mis-tareas/todas', verificarAutenticacion, obtenerMisTareas);
router.post('/', verificarAutenticacion, validarTarea, crearTarea);
router.put('/:id', verificarAutenticacion, validarTarea, actualizarTarea);
router.delete('/:id', verificarAutenticacion, eliminarTarea);

module.exports = router;
