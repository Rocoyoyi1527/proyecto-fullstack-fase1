const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/app.db');

// Ensure data directory exists
const fs = require('fs');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'usuario',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS fcm_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    dispositivo TEXT DEFAULT 'unknown',
    fecha_registro TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'pendiente',
    prioridad TEXT NOT NULL DEFAULT 'media',
    categoria TEXT NOT NULL DEFAULT 'otro',
    fecha_vencimiento TEXT,
    usuario_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    es_compartida INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS task_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tag TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS task_collaborators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permisos TEXT NOT NULL DEFAULT 'leer',
    agregado_en TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(task_id, usuario_id)
  );

  CREATE TABLE IF NOT EXISTS task_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    fecha TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

console.log(`✅ SQLite conectado: ${DB_PATH}`);

module.exports = db;
