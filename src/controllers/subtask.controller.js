const db = require('../config/database');
const Task = require('../models/Task');

// GET /api/tareas/:id/subtareas
const getSubtareas = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tarea = await Task.findById(id);
    if (!tarea) return res.status(404).json({ success: false, message: 'Tarea no encontrada' });

    const subtareas = db.prepare('SELECT * FROM subtasks WHERE task_id = ? ORDER BY created_at ASC').all(id);
    res.json({ success: true, data: { subtareas } });
  } catch (err) { next(err); }
};

// POST /api/tareas/:id/subtareas
const crearSubtarea = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titulo } = req.body;
    if (!titulo?.trim()) return res.status(400).json({ success: false, message: 'El título es requerido' });

    const tarea = await Task.findById(id);
    if (!tarea) return res.status(404).json({ success: false, message: 'Tarea no encontrada' });

    // Solo propietario o colaborador puede agregar subtareas
    const esColaborador = db.prepare(
      'SELECT id FROM task_collaborators WHERE task_id = ? AND usuario_id = ?'
    ).get(id, req.usuario.id);
    const esPropietario = String(tarea.usuario?.id || tarea.usuario) === String(req.usuario.id);

    if (!esPropietario && !esColaborador) {
      return res.status(403).json({ success: false, message: 'Sin permiso para modificar esta tarea' });
    }

    const result = db.prepare(
      'INSERT INTO subtasks (task_id, titulo) VALUES (?, ?)'
    ).run(id, titulo.trim());

    const subtarea = db.prepare('SELECT * FROM subtasks WHERE id = ?').get(result.lastInsertRowid);
    res.json({ success: true, data: { subtarea } });
  } catch (err) { next(err); }
};

// PATCH /api/tareas/:id/subtareas/:subtareaId
const toggleSubtarea = async (req, res, next) => {
  try {
    const { id, subtareaId } = req.params;
    const subtarea = db.prepare('SELECT * FROM subtasks WHERE id = ? AND task_id = ?').get(subtareaId, id);
    if (!subtarea) return res.status(404).json({ success: false, message: 'Subtarea no encontrada' });

    const nuevaCompletada = subtarea.completada ? 0 : 1;
    db.prepare('UPDATE subtasks SET completada = ? WHERE id = ?').run(nuevaCompletada, subtareaId);
    const actualizada = db.prepare('SELECT * FROM subtasks WHERE id = ?').get(subtareaId);

    res.json({ success: true, data: { subtarea: actualizada } });
  } catch (err) { next(err); }
};

// DELETE /api/tareas/:id/subtareas/:subtareaId
const eliminarSubtarea = async (req, res, next) => {
  try {
    const { id, subtareaId } = req.params;
    const tarea = await Task.findById(id);
    if (!tarea) return res.status(404).json({ success: false, message: 'Tarea no encontrada' });

    const esPropietario = String(tarea.usuario?.id || tarea.usuario) === String(req.usuario.id);
    if (!esPropietario) return res.status(403).json({ success: false, message: 'Solo el propietario puede eliminar subtareas' });

    db.prepare('DELETE FROM subtasks WHERE id = ? AND task_id = ?').run(subtareaId, id);
    res.json({ success: true, message: 'Subtarea eliminada' });
  } catch (err) { next(err); }
};

module.exports = { getSubtareas, crearSubtarea, toggleSubtarea, eliminarSubtarea };
