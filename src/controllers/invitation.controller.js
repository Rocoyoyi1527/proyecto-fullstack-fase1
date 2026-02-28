const crypto = require('crypto');
const db = require('../config/database');
const User = require('../models/User');
const Task = require('../models/Task');
const { enviarInvitacionColaboracion, enviarRespuestaInvitacion } = require('../services/email.service');

// Compartir tarea con invitación por email
const invitarColaborador = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { emailColaborador, permisos = 'leer' } = req.body;

    const tarea = await Task.findById(id);
    if (!tarea) return res.status(404).json({ success: false, message: 'Tarea no encontrada' });

    if (String(tarea.usuario) !== String(req.usuario.id)) {
      return res.status(403).json({ success: false, message: 'Solo el propietario puede compartir esta tarea' });
    }

    const colaborador = await User.findOne({ email: emailColaborador });
    if (!colaborador) return res.status(404).json({ success: false, message: 'Usuario no encontrado con ese email' });

    if (String(colaborador.id) === String(req.usuario.id)) {
      return res.status(400).json({ success: false, message: 'No puedes invitarte a ti mismo' });
    }

    // Verificar si ya es colaborador activo
    const yaColaborador = db.prepare(
      'SELECT id FROM task_collaborators WHERE task_id = ? AND usuario_id = ?'
    ).get(id, colaborador.id);
    if (yaColaborador) {
      return res.status(400).json({ success: false, message: 'Este usuario ya es colaborador de esta tarea' });
    }

    // Verificar si ya hay invitación pendiente
    const invExistente = db.prepare(
      'SELECT id FROM task_invitations WHERE task_id = ? AND colaborador_id = ? AND estado = ?'
    ).get(id, colaborador.id, 'pendiente');
    if (invExistente) {
      return res.status(400).json({ success: false, message: 'Ya existe una invitación pendiente para este usuario' });
    }

    // Crear invitación
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const result = db.prepare(`
      INSERT INTO task_invitations (task_id, propietario_id, colaborador_id, permisos, token, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, req.usuario.id, colaborador.id, permisos, token, expiresAt);

    // Enviar email
    await enviarInvitacionColaboracion({
      emailDestino: colaborador.email,
      nombreInvitado: colaborador.nombre,
      nombrePropietario: req.usuario.nombre,
      tarea,
      invitacionId: token
    });

    res.json({
      success: true,
      message: `Invitación enviada a ${colaborador.email}`
    });
  } catch (error) {
    next(error);
  }
};

// Aceptar invitación (vía link del email)
const aceptarInvitacion = async (req, res, next) => {
  try {
    const { token } = req.params;

    const inv = db.prepare('SELECT * FROM task_invitations WHERE token = ?').get(token);
    if (!inv) return res.status(404).send('<h2>Invitación no encontrada</h2>');
    if (inv.estado !== 'pendiente') return res.status(400).send(`<h2>Esta invitación ya fue ${inv.estado}</h2>`);
    if (new Date(inv.expires_at) < new Date()) return res.status(400).send('<h2>Esta invitación ha expirado</h2>');

    // Agregar colaborador
    db.prepare(
      'INSERT OR IGNORE INTO task_collaborators (task_id, usuario_id, permisos) VALUES (?, ?, ?)'
    ).run(inv.task_id, inv.colaborador_id, inv.permisos);

    // Actualizar tarea como compartida
    db.prepare('UPDATE tasks SET es_compartida = 1 WHERE id = ?').run(inv.task_id);

    // Marcar invitación como aceptada
    db.prepare('UPDATE task_invitations SET estado = ? WHERE token = ?').run('aceptada', token);

    // Notificar al propietario
    const propietario = await User.findById(inv.propietario_id);
    const colaborador = await User.findById(inv.colaborador_id);
    const tarea = await Task.findById(inv.task_id);

    await enviarRespuestaInvitacion({
      emailPropietario: propietario.email,
      nombrePropietario: propietario.nombre,
      nombreColaborador: colaborador.nombre,
      tarea,
      acepto: true
    });

    res.send(`
      <html>
        <head><style>body{font-family:Arial;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f8f9fa;}
        .card{background:white;padding:40px;border-radius:12px;text-align:center;max-width:400px;box-shadow:0 4px 20px rgba(0,0,0,0.1);}
        h2{color:#059669;}a{color:#9333ea;}</style></head>
        <body><div class="card">
          <h2>✅ ¡Invitación aceptada!</h2>
          <p>Ya eres colaborador de <strong>${tarea.titulo}</strong></p>
          <p><a href="${process.env.BASE_URL || 'http://192.168.1.100:3000'}">Ir a TaskFlow →</a></p>
        </div></body>
      </html>
    `);
  } catch (error) {
    next(error);
  }
};

// Rechazar invitación (vía link del email)
const rechazarInvitacion = async (req, res, next) => {
  try {
    const { token } = req.params;

    const inv = db.prepare('SELECT * FROM task_invitations WHERE token = ?').get(token);
    if (!inv) return res.status(404).send('<h2>Invitación no encontrada</h2>');
    if (inv.estado !== 'pendiente') return res.status(400).send(`<h2>Esta invitación ya fue ${inv.estado}</h2>`);

    db.prepare('UPDATE task_invitations SET estado = ? WHERE token = ?').run('rechazada', token);

    const propietario = await User.findById(inv.propietario_id);
    const colaborador = await User.findById(inv.colaborador_id);
    const tarea = await Task.findById(inv.task_id);

    await enviarRespuestaInvitacion({
      emailPropietario: propietario.email,
      nombrePropietario: propietario.nombre,
      nombreColaborador: colaborador.nombre,
      tarea,
      acepto: false
    });

    res.send(`
      <html>
        <head><style>body{font-family:Arial;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f8f9fa;}
        .card{background:white;padding:40px;border-radius:12px;text-align:center;max-width:400px;box-shadow:0 4px 20px rgba(0,0,0,0.1);}
        h2{color:#dc2626;}a{color:#9333ea;}</style></head>
        <body><div class="card">
          <h2>❌ Invitación rechazada</h2>
          <p>Has rechazado la invitación para <strong>${tarea.titulo}</strong></p>
          <p><a href="${process.env.BASE_URL || 'http://192.168.1.100:3000'}">Ir a TaskFlow →</a></p>
        </div></body>
      </html>
    `);
  } catch (error) {
    next(error);
  }
};

module.exports = { invitarColaborador, aceptarInvitacion, rechazarInvitacion };
