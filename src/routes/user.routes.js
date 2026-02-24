const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verificarAutenticacion } = require('../middleware/auth');

// Guardar token FCM
router.post('/guardar-token-fcm', verificarAutenticacion, async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return res.status(400).json({ success: false, message: 'Token FCM requerido' });
    }

    db.prepare(
      'INSERT OR IGNORE INTO fcm_tokens (usuario_id, token, dispositivo) VALUES (?, ?, ?)'
    ).run(req.usuario.id, fcmToken, req.headers['user-agent'] || 'unknown');

    console.log(`✅ Token FCM guardado para usuario: ${req.usuario.email}`);
    res.json({ success: true, message: 'Token FCM guardado correctamente' });
  } catch (error) {
    next(error);
  }
});

// Eliminar token FCM
router.delete('/eliminar-token-fcm', verificarAutenticacion, async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    db.prepare('DELETE FROM fcm_tokens WHERE usuario_id = ? AND token = ?').run(req.usuario.id, fcmToken);
    res.json({ success: true, message: 'Token FCM eliminado' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
