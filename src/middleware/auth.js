const { verifyToken } = require('../config/jwt');
const User = require('../models/User');

const verificarAutenticacion = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No se proporcionó token de autenticación' });
    }

    const decoded = verifyToken(token);
    const usuario = await User.findById(decoded.id);
    if (!usuario) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token inválido o expirado', error: error.message });
  }
};

const verificarAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acceso denegado. Se requieren permisos de administrador' });
  }
  next();
};

module.exports = { verificarAutenticacion, verificarAdmin };
