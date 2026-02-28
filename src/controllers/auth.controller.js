const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const { enviarCorreoVerificacion } = require('../services/email.service');
const db = require('../config/database');
const crypto = require('crypto');

function generarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const registrar = async (req, res, next) => {
  try {
    const { nombre, email, password, rol } = req.body;

    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      // Si existe pero no está verificado, reenviar código
      if (!usuarioExistente.verificado) {
        const codigo = generarCodigo();
        const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min

        db.prepare('DELETE FROM email_verifications WHERE usuario_id = ?').run(usuarioExistente.id);
        db.prepare(
          'INSERT INTO email_verifications (usuario_id, codigo, expires_at) VALUES (?, ?, ?)'
        ).run(usuarioExistente.id, codigo, expires);

        await enviarCorreoVerificacion({ emailDestino: email, nombre: usuarioExistente.nombre, codigo });

        return res.status(200).json({
          success: true,
          pendingVerification: true,
          message: 'Cuenta pendiente de verificacion. Se reenvio el codigo.',
          data: { usuarioId: usuarioExistente.id, email }
        });
      }
      return res.status(400).json({ success: false, message: 'El email ya esta registrado' });
    }

    // Crear usuario con verificado=0
    const usuario = await User.create({ nombre, email, password, rol: rol || 'usuario', verificado: 0 });

    // Generar y guardar código
    const codigo = generarCodigo();
    const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    db.prepare(
      'INSERT INTO email_verifications (usuario_id, codigo, expires_at) VALUES (?, ?, ?)'
    ).run(usuario.id, codigo, expires);

    // Enviar correo
    await enviarCorreoVerificacion({ emailDestino: email, nombre, codigo });

    res.status(201).json({
      success: true,
      pendingVerification: true,
      message: 'Usuario registrado. Revisa tu correo para activar tu cuenta.',
      data: { usuarioId: usuario.id, email }
    });
  } catch (error) {
    next(error);
  }
};

const verificarEmail = async (req, res, next) => {
  try {
    const { usuarioId, codigo } = req.body;

    const registro = db.prepare(
      'SELECT * FROM email_verifications WHERE usuario_id = ? AND usado = 0 ORDER BY created_at DESC LIMIT 1'
    ).get(usuarioId);

    if (!registro) {
      return res.status(400).json({ success: false, message: 'Codigo invalido o expirado' });
    }

    if (new Date(registro.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'El codigo expiro. Registrate de nuevo para obtener uno nuevo.' });
    }

    if (registro.codigo !== String(codigo)) {
      return res.status(400).json({ success: false, message: 'Codigo incorrecto' });
    }

    // Marcar como verificado
    db.prepare('UPDATE users SET verificado = 1 WHERE id = ?').run(usuarioId);
    db.prepare('UPDATE email_verifications SET usado = 1 WHERE id = ?').run(registro.id);

    const usuario = await User.findById(usuarioId);
    const token = generateToken(usuario.id);

    res.json({
      success: true,
      message: 'Cuenta verificada exitosamente',
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
      return res.status(401).json({ success: false, message: 'Credenciales invalidas' });
    }

    // Bloquear login si no está verificado
    if (!usuario.verificado) {
      return res.status(403).json({
        success: false,
        pendingVerification: true,
        message: 'Debes verificar tu correo antes de iniciar sesion.',
        data: { usuarioId: usuario.id, email }
      });
    }

    const passwordValido = await usuario.compararPassword(password);
    if (!passwordValido) {
      return res.status(401).json({ success: false, message: 'Credenciales invalidas' });
    }
    const token = generateToken(usuario.id);
    res.json({
      success: true,
      message: 'Inicio de sesion exitoso',
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

module.exports = { registrar, verificarEmail, login, obtenerPerfil };
