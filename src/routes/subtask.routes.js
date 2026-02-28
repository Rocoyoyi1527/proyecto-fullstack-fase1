const express = require('express');
const router = express.Router();
const { verificarAutenticacion } = require('../middleware/auth');
const { getSubtareas, crearSubtarea, toggleSubtarea, eliminarSubtarea } = require('../controllers/subtask.controller');

router.get('/tareas/:id/subtareas', verificarAutenticacion, getSubtareas);
router.post('/tareas/:id/subtareas', verificarAutenticacion, crearSubtarea);
router.patch('/tareas/:id/subtareas/:subtareaId', verificarAutenticacion, toggleSubtarea);
router.delete('/tareas/:id/subtareas/:subtareaId', verificarAutenticacion, eliminarSubtarea);

module.exports = router;
