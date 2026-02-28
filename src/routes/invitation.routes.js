const express = require('express');
const router = express.Router();
const { verificarAutenticacion } = require('../middleware/auth');
const { invitarColaborador, aceptarInvitacion, rechazarInvitacion } = require('../controllers/invitation.controller');

// Enviar invitación (autenticado)
router.post('/tareas/:id/invitar', verificarAutenticacion, invitarColaborador);

// Aceptar/rechazar via link del email (sin auth, usa token)
router.get('/invitaciones/:token/aceptar', aceptarInvitacion);
router.get('/invitaciones/:token/rechazar', rechazarInvitacion);

module.exports = router;
