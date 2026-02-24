const db = require('../config/database');

function getCollaborators(taskId) {
  return db.prepare(`
    SELECT tc.*, u.nombre, u.email 
    FROM task_collaborators tc
    JOIN users u ON u.id = tc.usuario_id
    WHERE tc.task_id = ?
  `).all(taskId).map(r => ({
    id: r.id,
    usuario: { id: r.usuario_id, nombre: r.nombre, email: r.email },
    permisos: r.permisos,
    agregadoEn: r.agregado_en
  }));
}

function getComments(taskId) {
  return db.prepare(`
    SELECT tc.*, u.nombre, u.email 
    FROM task_comments tc
    JOIN users u ON u.id = tc.usuario_id
    WHERE tc.task_id = ?
    ORDER BY tc.fecha ASC
  `).all(taskId).map(r => ({
    id: r.id,
    usuario: { id: r.usuario_id, nombre: r.nombre, email: r.email },
    texto: r.texto,
    fecha: r.fecha
  }));
}

function getTags(taskId) {
  return db.prepare('SELECT tag FROM task_tags WHERE task_id = ?').all(taskId).map(r => r.tag);
}

function formatTask(row, populateUsuario = false) {
  if (!row) return null;
  let usuario = row.usuario_id;
  if (populateUsuario && row.u_nombre) {
    usuario = { id: row.usuario_id, nombre: row.u_nombre, email: row.u_email };
  }
  const task = {
    id: row.id,
    titulo: row.titulo,
    descripcion: row.descripcion,
    estado: row.estado,
    prioridad: row.prioridad,
    categoria: row.categoria,
    etiquetas: getTags(row.id),
    fechaVencimiento: row.fecha_vencimiento || null,
    usuario,
    esCompartida: !!row.es_compartida,
    colaboradores: getCollaborators(row.id),
    comentarios: getComments(row.id),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };

  task.save = async function() {
    // Update es_compartida
    db.prepare('UPDATE tasks SET es_compartida = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run(this.esCompartida ? 1 : 0, this.id);
    // Sync collaborators
    const existing = db.prepare('SELECT usuario_id FROM task_collaborators WHERE task_id = ?')
      .all(this.id).map(r => r.usuario_id);
    const current = this.colaboradores.map(c => c.usuario.id || c.usuario);
    for (const uid of existing) {
      if (!current.includes(uid)) {
        db.prepare('DELETE FROM task_collaborators WHERE task_id = ? AND usuario_id = ?').run(this.id, uid);
      }
    }
    const ins = db.prepare('INSERT OR IGNORE INTO task_collaborators (task_id, usuario_id, permisos) VALUES (?, ?, ?)');
    for (const col of this.colaboradores) {
      const uid = col.usuario.id || col.usuario;
      if (!existing.includes(uid)) {
        ins.run(this.id, uid, col.permisos || 'leer');
      }
    }
    // Sync comments (append only — find new ones without id)
    const ins2 = db.prepare('INSERT INTO task_comments (task_id, usuario_id, texto) VALUES (?, ?, ?)');
    for (const c of this.comentarios) {
      if (!c.id) {
        const uid = c.usuario.id || c.usuario;
        const r = ins2.run(this.id, uid, c.texto);
        c.id = r.lastInsertRowid;
      }
    }
    // Re-fetch comments with populated user data
    this.comentarios = getComments(this.id);
  };

  return task;
}

const Task = {
  async create({ titulo, descripcion, estado = 'pendiente', prioridad = 'media', categoria = 'otro', etiquetas = [], fechaVencimiento, usuario_id }) {
    const result = db.prepare(`
      INSERT INTO tasks (titulo, descripcion, estado, prioridad, categoria, fecha_vencimiento, usuario_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(titulo, descripcion, estado, prioridad, categoria, fechaVencimiento || null, usuario_id);
    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    if (etiquetas.length > 0) {
      const ins = db.prepare('INSERT INTO task_tags (task_id, tag) VALUES (?, ?)');
      etiquetas.forEach(tag => ins.run(row.id, tag));
    }
    return formatTask(row);
  },

  async find(where = {}, opts = {}) {
    let sql = 'SELECT t.*';
    let join = ' FROM tasks t';
    const params = [];

    if (opts.populate) {
      sql += ', u.nombre as u_nombre, u.email as u_email';
      join += ' LEFT JOIN users u ON u.id = t.usuario_id';
    }

    const conditions = [];
    if (where.usuario_id !== undefined) {
      conditions.push('t.usuario_id = ?');
      params.push(where.usuario_id);
    }
    if (where.collaborator_id !== undefined) {
      join += ' LEFT JOIN task_collaborators tc ON tc.task_id = t.id';
      conditions.push('tc.usuario_id = ?');
      params.push(where.collaborator_id);
    }

    sql += join;
    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY t.created_at DESC';

    const rows = db.prepare(sql).all(...params);
    return rows.map(r => formatTask(r, !!opts.populate));
  },

  async findById(id, opts = {}) {
    let sql = 'SELECT t.*';
    let join = ' FROM tasks t';
    if (opts.populate) {
      sql += ', u.nombre as u_nombre, u.email as u_email';
      join += ' LEFT JOIN users u ON u.id = t.usuario_id';
    }
    sql += join + ' WHERE t.id = ?';
    const row = db.prepare(sql).get(id);
    return formatTask(row, !!opts.populate);
  },

  async findByIdAndUpdate(id, data) {
    const fields = [];
    const params = [];
    if (data.titulo !== undefined) { fields.push('titulo = ?'); params.push(data.titulo); }
    if (data.descripcion !== undefined) { fields.push('descripcion = ?'); params.push(data.descripcion); }
    if (data.estado !== undefined) { fields.push('estado = ?'); params.push(data.estado); }
    if (data.prioridad !== undefined) { fields.push('prioridad = ?'); params.push(data.prioridad); }
    if (data.categoria !== undefined) { fields.push('categoria = ?'); params.push(data.categoria); }
    if (data.fechaVencimiento !== undefined) { fields.push('fecha_vencimiento = ?'); params.push(data.fechaVencimiento); }
    fields.push("updated_at = datetime('now')");
    params.push(id);
    db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    return Task.findById(id, { populate: true });
  },

  async findByIdAndDelete(id) {
    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  }
};

module.exports = Task;
