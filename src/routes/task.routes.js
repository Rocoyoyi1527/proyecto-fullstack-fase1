const express = require('express');
const router = express.Router();
const {
  crearTarea,
  obtenerTareas,
  obtenerMisTareas,
  obtenerTareaPorId,
  actualizarTarea,
  eliminarTarea,
  obtenerEstadisticas,
  compartirTarea,
  obtenerTareasCompartidas,
  agregarComentario,
  eliminarColaborador
} = require('../controllers/task.controller');
const { validarTarea } = require('../middleware/validation');
const { verificarAutenticacion } = require('../middleware/auth');

// Rutas públicas (solo lectura)
router.get('/', obtenerTareas);

// Rutas protegidas (requieren autenticación)
// IMPORTANTE: Las rutas específicas van ANTES de las rutas con parámetros dinámicos
router.get('/mis-tareas/todas', verificarAutenticacion, obtenerMisTareas);
router.get('/estadisticas/resumen', verificarAutenticacion, obtenerEstadisticas);
router.get('/compartidas/conmigo', verificarAutenticacion, obtenerTareasCompartidas);

// Rutas con parámetros dinámicos
router.get('/:id', obtenerTareaPorId);
router.post('/', verificarAutenticacion, validarTarea, crearTarea);
router.put('/:id', verificarAutenticacion, validarTarea, actualizarTarea);
router.delete('/:id', verificarAutenticacion, eliminarTarea);

// Rutas de colaboración
router.post('/:id/compartir', verificarAutenticacion, compartirTarea);
router.post('/:id/comentarios', verificarAutenticacion, agregarComentario);
router.delete('/:id/colaboradores/:colaboradorId', verificarAutenticacion, eliminarColaborador);

module.exports = router;
