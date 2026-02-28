const db = require('../config/database');

const heartbeat = (req, res) => {
  const ahora = new Date().toISOString();
  db.prepare('UPDATE users SET last_seen = ? WHERE id = ?').run(ahora, req.usuario.id);
  res.json({ success: true });
};

const getEstadoUsuarios = (req, res) => {
  const usuarios = db.prepare('SELECT id, last_seen FROM users').all();
  const ahora = Date.now();
  const estados = {};
  usuarios.forEach(u => {
    if (!u.last_seen) { estados[u.id] = 'offline'; return; }
    const diff = ahora - new Date(u.last_seen).getTime();
    if (diff < 60000) estados[u.id] = 'online';
    else if (diff < 300000) estados[u.id] = 'idle';
    else estados[u.id] = 'offline';
  });
  res.json({ success: true, data: { estados } });
};

module.exports = { heartbeat, getEstadoUsuarios };
