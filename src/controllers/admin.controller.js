const db = require('../config/database');
const jwt = require('jsonwebtoken');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'contraseñaadminsegura1527';
const ADMIN_SECRET = process.env.JWT_SECRET + '_admin';

const adminLogin = (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
  }
  const token = jwt.sign({ admin: true }, ADMIN_SECRET, { expiresIn: '4h' });
  res.json({ success: true, data: { token } });
};

const verificarAdmin = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'No autorizado' });
  try {
    const payload = jwt.verify(auth.slice(7), ADMIN_SECRET);
    if (!payload.admin) throw new Error();
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token inválido' });
  }
};

const getUsuarios = (req, res) => {
  const usuarios = db.prepare(`
    SELECT u.id, u.nombre, u.email, u.rol, u.verificado, u.created_at, u.last_seen,
      COUNT(DISTINCT t.id) as total_tareas,
      SUM(CASE WHEN t.estado = 'completada' THEN 1 ELSE 0 END) as completadas,
      SUM(CASE WHEN t.estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
      SUM(CASE WHEN t.estado = 'en_progreso' THEN 1 ELSE 0 END) as en_progreso
    FROM users u
    LEFT JOIN tasks t ON t.usuario_id = u.id
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `).all();

  const ahora = Date.now();
  const result = usuarios.map(u => {
    let estado = 'offline';
    if (u.last_seen) {
      const diff = ahora - new Date(u.last_seen).getTime();
      if (diff < 60000) estado = 'online';
      else if (diff < 300000) estado = 'idle';
    }
    return { ...u, estado };
  });

  res.json({ success: true, data: { usuarios: result } });
};


const getTareasUsuario = (req, res) => {
  const { id } = req.params;
  const usuario = db.prepare('SELECT id, nombre, email, rol, verificado, created_at FROM users WHERE id = ?').get(id);
  if (!usuario) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

  const tareas = db.prepare(`
    SELECT t.*, 
      COUNT(DISTINCT tc.usuario_id) as num_colaboradores,
      COUNT(DISTINCT cm.id) as num_comentarios,
      COUNT(DISTINCT st.id) as num_subtareas
    FROM tasks t
    LEFT JOIN task_collaborators tc ON tc.task_id = t.id
    LEFT JOIN task_comments cm ON cm.task_id = t.id
    LEFT JOIN subtasks st ON st.task_id = t.id
    WHERE t.usuario_id = ?
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `).all(id);

  res.json({ success: true, data: { usuario, tareas } });
};

const getStats = (req, res) => {
  const totalUsuarios = db.prepare('SELECT COUNT(*) as n FROM users').get().n;
  const verificados = db.prepare('SELECT COUNT(*) as n FROM users WHERE verificado = 1').get().n;
  const totalTareas = db.prepare('SELECT COUNT(*) as n FROM tasks').get().n;
  const completadas = db.prepare("SELECT COUNT(*) as n FROM tasks WHERE estado = 'completada'").get().n;
  const pendientes = db.prepare("SELECT COUNT(*) as n FROM tasks WHERE estado = 'pendiente'").get().n;
  const colaboraciones = db.prepare('SELECT COUNT(*) as n FROM task_collaborators').get().n;
  const comentarios = db.prepare('SELECT COUNT(*) as n FROM task_comments').get().n;

  res.json({
    success: true,
    data: { totalUsuarios, verificados, totalTareas, completadas, pendientes, colaboraciones, comentarios }
  });
};

module.exports = { adminLogin, verificarAdmin, getUsuarios, getTareasUsuario, getStats };
