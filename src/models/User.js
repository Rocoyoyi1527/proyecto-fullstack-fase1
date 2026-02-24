const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Helper: format user row for output
function formatUser(row, includeFcmTokens = false) {
  if (!row) return null;
  const user = {
    id: row.id,
    nombre: row.nombre,
    email: row.email,
    rol: row.rol,
    createdAt: row.created_at,
    fcmTokens: []
  };
  if (row._include_password) user.password = row.password;
  if (includeFcmTokens) {
    user.fcmTokens = db.prepare(
      'SELECT * FROM fcm_tokens WHERE usuario_id = ?'
    ).all(row.id).map(t => ({
      id: t.id,
      token: t.token,
      dispositivo: t.dispositivo,
      fechaRegistro: t.fecha_registro
    }));
  }
  user.compararPassword = async function(passwordIngresado) {
    const pwRow = db.prepare('SELECT password FROM users WHERE id = ?').get(this.id);
    return bcrypt.compare(passwordIngresado, pwRow.password);
  };
  user.save = async function() {
    // Save fcmTokens changes
    const existing = db.prepare('SELECT token FROM fcm_tokens WHERE usuario_id = ?').all(this.id).map(t => t.token);
    const current = this.fcmTokens.map(t => t.token);
    // Remove deleted tokens
    for (const tok of existing) {
      if (!current.includes(tok)) {
        db.prepare('DELETE FROM fcm_tokens WHERE usuario_id = ? AND token = ?').run(this.id, tok);
      }
    }
    // Add new tokens
    const insert = db.prepare('INSERT OR IGNORE INTO fcm_tokens (usuario_id, token, dispositivo) VALUES (?, ?, ?)');
    for (const t of this.fcmTokens) {
      if (!existing.includes(t.token)) {
        insert.run(this.id, t.token, t.dispositivo || 'unknown');
      }
    }
  };
  return user;
}

const User = {
  async findOne({ email }, opts = {}) {
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!row) return null;
    if (opts.includePassword) row._include_password = true;
    return formatUser(row, true);
  },

  async findById(id, opts = {}) {
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!row) return null;
    if (opts.includePassword) row._include_password = true;
    return formatUser(row, true);
  },

  // Chainable select for password (mimics mongoose .select('+password'))
  findByIdWithPassword(id) {
    return {
      _id: id,
      async exec() {
        const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        if (!row) return null;
        row._include_password = true;
        return formatUser(row, true);
      }
    };
  },

  async create({ nombre, email, password, rol = 'usuario' }) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const result = db.prepare(
      'INSERT INTO users (nombre, email, password, rol) VALUES (?, ?, ?, ?)'
    ).run(nombre, email.toLowerCase().trim(), hashed, rol);
    return formatUser(db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid), false);
  }
};

module.exports = User;
