const User = require('../models/User');
const { generateToken } = require('../config/jwt');

const registrar = async (req, res, next) => {
  try {
    const { nombre, email, password, rol } = req.body;

    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }

    const usuario = await User.create({ nombre, email, password, rol: rol || 'usuario' });
    const token = generateToken(usuario.id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const usuario = await User.findOne({ email }, { includePassword: true });
    if (!usuario) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const passwordValido = await usuario.compararPassword(password);
    if (!passwordValido) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const token = generateToken(usuario.id);

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

const obtenerPerfil = async (req, res, next) => {
  try {
    res.json({ success: true, data: { usuario: req.usuario } });
  } catch (error) {
    next(error);
  }
};

module.exports = { registrar, login, obtenerPerfil };
