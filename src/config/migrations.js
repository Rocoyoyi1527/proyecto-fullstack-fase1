const db = require('../config/database');

// Add verificado column to users if not exists
try {
  db.exec(`ALTER TABLE users ADD COLUMN verificado INTEGER NOT NULL DEFAULT 1`);
  console.log('✅ Columna verificado agregada a users');
} catch (e) {
  // Already exists, ignore
}

db.exec(`
  CREATE TABLE IF NOT EXISTS task_invitations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    propietario_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    colaborador_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permisos TEXT NOT NULL DEFAULT 'leer',
    estado TEXT NOT NULL DEFAULT 'pendiente',
    token TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    UNIQUE(task_id, colaborador_id)
  );

  CREATE TABLE IF NOT EXISTS subtasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    completada INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS email_verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    codigo TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    usado INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Marcar usuarios existentes como verificados
db.prepare(`UPDATE users SET verificado = 1 WHERE verificado = 1`).run();

try {
  db.exec(`ALTER TABLE users ADD COLUMN last_seen TEXT`);
} catch (e) {}

console.log('✅ Tablas verificadas (invitaciones, subtareas, verificacion email)');
