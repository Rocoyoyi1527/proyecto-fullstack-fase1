const express = require('express');
const router = express.Router();
const { verificarAutenticacion } = require('../middleware/auth');
const User = require('../models/User');

// Guardar token FCM
router.post('/guardar-token-fcm', verificarAutenticacion, async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    
    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'Token FCM requerido'
      });
    }

    const usuario = await User.findById(req.usuario._id);
    
    // Verificar si el token ya existe
    const tokenExiste = usuario.fcmTokens.some(t => t.token === fcmToken);
    
    if (!tokenExiste) {
      // Agregar nuevo token
      usuario.fcmTokens.push({
        token: fcmToken,
        dispositivo: req.headers['user-agent'] || 'unknown',
        fechaRegistro: new Date()
      });
      
      await usuario.save();
      
      console.log(`✅ Token FCM guardado para usuario: ${usuario.email}`);
    }

    res.json({
      success: true,
      message: 'Token FCM guardado correctamente'
    });
  } catch (error) {
    console.error('Error al guardar token FCM:', error);
    next(error);
  }
});

// Eliminar token FCM
router.delete('/eliminar-token-fcm', verificarAutenticacion, async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    
    const usuario = await User.findById(req.usuario._id);
    usuario.fcmTokens = usuario.fcmTokens.filter(t => t.token !== fcmToken);
    await usuario.save();

    res.json({
      success: true,
      message: 'Token FCM eliminado'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
