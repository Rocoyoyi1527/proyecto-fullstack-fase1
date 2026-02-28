const Task = require('../models/Task');
const { enviarNotificacionPush } = require('../services/pushNotification.service');

const crearTarea = async (req, res, next) => {
  try {
    const { titulo, descripcion, estado, prioridad, categoria, etiquetas, fechaVencimiento } = req.body;
    const tarea = await Task.create({
      titulo, descripcion, estado, prioridad, categoria,
      etiquetas: etiquetas || [],
      fechaVencimiento,
      usuario_id: req.usuario.id
    });
    res.status(201).json({ success: true, message: 'Tarea creada exitosamente', data: { tarea } });
  } catch (error) {
    next(error);
  }
};

const obtenerTareas = async (req, res, next) => {
  try {
    const tareas = await Task.find({}, { populate: true });
    res.json({ success: true, count: tareas.length, data: { tareas } });
  } catch (error) {
    next(error);
  }
};

const obtenerMisTareas = async (req, res, next) => {
  try {
    const tareas = await Task.find({ usuario_id: req.usuario.id });
    res.json({ success: true, count: tareas.length, data: { tareas } });
  } catch (error) {
    next(error);
  }
};

const obtenerTareaPorId = async (req, res, next) => {
  try {
    const tarea = await Task.findById(req.params.id, { populate: true });
    if (!tarea) return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
    res.json({ success: true, data: { tarea } });
  } catch (error) {
    next(error);
  }
};

const actualizarTarea = async (req, res, next) => {
  try {
    const tarea = await Task.findById(req.params.id);
    if (!tarea) return res.status(404).json({ success: false, message: 'Tarea no encontrada' });

    if (String(tarea.usuario) !== String(req.usuario.id)) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para modificar esta tarea' });
    }

    const { titulo, descripcion, estado, prioridad, categoria, fechaVencimiento } = req.body;
    const tareaActualizada = await Task.findByIdAndUpdate(req.params.id, {
      titulo, descripcion, estado, prioridad, categoria, fechaVencimiento
    });

    res.json({ success: true, message: 'Tarea actualizada exitosamente', data: { tarea: tareaActualizada } });
  } catch (error) {
    next(error);
  }
};

const eliminarTarea = async (req, res, next) => {
  try {
    const tarea = await Task.findById(req.params.id);
    if (!tarea) return res.status(404).json({ success: false, message: 'Tarea no encontrada' });

    if (String(tarea.usuario) !== String(req.usuario.id)) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para eliminar esta tarea' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Tarea eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
};

const obtenerEstadisticas = async (req, res, next) => {
  try {
    // Tareas propias
    const propias = await Task.find({ usuario_id: req.usuario.id });

    // Tareas en las que es colaborador
    const colaborativas = await Task.find({ collaborator_id: req.usuario.id });
    // Unir sin duplicados
    const ids = new Set(propias.map(t => t.id));
    const todasLasTareas = [...propias, ...colaborativas.filter(t => !ids.has(t.id))];

    const porEstado = {
      pendiente: todasLasTareas.filter(t => t.estado === 'pendiente').length,
      en_progreso: todasLasTareas.filter(t => t.estado === 'en_progreso').length,
      completada: todasLasTareas.filter(t => t.estado === 'completada').length
    };
    const porPrioridad = {
      baja: todasLasTareas.filter(t => t.prioridad === 'baja').length,
      media: todasLasTareas.filter(t => t.prioridad === 'media').length,
      alta: todasLasTareas.filter(t => t.prioridad === 'alta').length
    };
    const porCategoria = {
      trabajo: todasLasTareas.filter(t => t.categoria === 'trabajo').length,
      estudio: todasLasTareas.filter(t => t.categoria === 'estudio').length,
      personal: todasLasTareas.filter(t => t.categoria === 'personal').length,
      hogar: todasLasTareas.filter(t => t.categoria === 'hogar').length,
      salud: todasLasTareas.filter(t => t.categoria === 'salud').length,
      otro: todasLasTareas.filter(t => t.categoria === 'otro').length
    };

    const hoy = new Date();
    const tareasVencidas = todasLasTareas.filter(t =>
      t.fechaVencimiento && new Date(t.fechaVencimiento) < hoy && t.estado !== 'completada'
    ).length;

    const enUnaSemana = new Date();
    enUnaSemana.setDate(enUnaSemana.getDate() + 7);
    const tareasPorVencer = todasLasTareas.filter(t =>
      t.fechaVencimiento &&
      new Date(t.fechaVencimiento) >= hoy &&
      new Date(t.fechaVencimiento) <= enUnaSemana &&
      t.estado !== 'completada'
    ).length;

    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    const tareasRecientes = todasLasTareas.filter(t => new Date(t.createdAt) >= hace30Dias);
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    const porDiaSemana = { Lunes: 0, Martes: 0, Miercoles: 0, Jueves: 0, Viernes: 0, Sabado: 0, Domingo: 0 };
    tareasRecientes.forEach(t => { porDiaSemana[diasSemana[new Date(t.createdAt).getDay()]]++; });

    const tareasCompletadasPorSemana = [];
    for (let i = 3; i >= 0; i--) {
      const ini = new Date(); ini.setDate(ini.getDate() - (i * 7 + 7));
      const fin = new Date(); fin.setDate(fin.getDate() - (i * 7));
      tareasCompletadasPorSemana.push({
        semana: `S${4 - i}`,
        completadas: todasLasTareas.filter(t =>
          t.estado === 'completada' &&
          new Date(t.updatedAt) >= ini && new Date(t.updatedAt) < fin
        ).length
      });
    }

    const totalTareas = todasLasTareas.length;
    const tasaCompletado = totalTareas > 0 ? Math.round((porEstado.completada / totalTareas) * 100) : 0;

    res.json({
      success: true,
      data: {
        resumen: {
          total: totalTareas,
          propias: propias.length,
          colaborativas: colaborativas.length,
          completadas: porEstado.completada,
          pendientes: porEstado.pendiente,
          enProgreso: porEstado.en_progreso,
          vencidas: tareasVencidas,
          porVencer: tareasPorVencer,
          tasaCompletado
        },
        porEstado, porPrioridad, porCategoria, porDiaSemana, tareasCompletadasPorSemana
      }
    });
  } catch (error) {
    next(error);
  }
};

const compartirTarea = async (req, res, next) => {
  try {
    const { emailColaborador, permisos } = req.body;
    const tarea = await Task.findById(req.params.id);
    if (!tarea) return res.status(404).json({ success: false, message: 'Tarea no encontrada' });

    if (String(tarea.usuario) !== String(req.usuario.id)) {
      return res.status(403).json({ success: false, message: 'Solo el propietario puede compartir esta tarea' });
    }

    const User = require('../models/User');
    const colaborador = await User.findOne({ email: emailColaborador });
    if (!colaborador) return res.status(404).json({ success: false, message: 'Usuario no encontrado con ese email' });

    if (String(colaborador.id) === String(req.usuario.id)) {
      return res.status(400).json({ success: false, message: 'No puedes compartir una tarea contigo mismo' });
    }

    const yaCompartida = tarea.colaboradores.some(col => String(col.usuario.id) === String(colaborador.id));
    if (yaCompartida) {
      return res.status(400).json({ success: false, message: 'Esta tarea ya está compartida con este usuario' });
    }

    tarea.colaboradores.push({ usuario: { id: colaborador.id }, permisos: permisos || 'leer' });
    tarea.esCompartida = true;
    await tarea.save();

    await enviarNotificacionPush(
      colaborador.id,
      '🤝 Nueva Tarea Compartida',
      `${req.usuario.nombre} compartió la tarea "${tarea.titulo}" contigo`,
      { tipo: 'tarea_compartida', tareaId: String(tarea.id), url: '/' }
    );

    res.json({ success: true, message: `Tarea compartida con ${colaborador.nombre}`, data: { tarea } });
  } catch (error) {
    next(error);
  }
};

const obtenerTareasCompartidas = async (req, res, next) => {
  try {
    const tareas = await Task.find({ collaborator_id: req.usuario.id }, { populate: true });
    res.json({ success: true, count: tareas.length, data: { tareas } });
  } catch (error) {
    next(error);
  }
};

const agregarComentario = async (req, res, next) => {
  try {
    const { texto } = req.body;
    if (!texto || texto.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'El comentario no puede estar vacío' });
    }

    const tarea = await Task.findById(req.params.id);
    if (!tarea) return res.status(404).json({ success: false, message: 'Tarea no encontrada' });

    const esPropietario = String(tarea.usuario) === String(req.usuario.id);
    const esColaborador = tarea.colaboradores.some(col => String(col.usuario.id) === String(req.usuario.id));

    if (!esPropietario && !esColaborador) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para comentar en esta tarea' });
    }

    tarea.comentarios.push({ usuario: { id: req.usuario.id }, texto: texto.trim() });
    await tarea.save();

    const nuevoComentario = tarea.comentarios[tarea.comentarios.length - 1];

    if (String(tarea.usuario) !== String(req.usuario.id)) {
      await enviarNotificacionPush(tarea.usuario, '💬 Nuevo Comentario',
        `${req.usuario.nombre} comentó en "${tarea.titulo}"`,
        { tipo: 'nuevo_comentario', tareaId: String(tarea.id), url: '/' });
    }

    for (const col of tarea.colaboradores) {
      if (String(col.usuario.id) !== String(req.usuario.id)) {
        await enviarNotificacionPush(col.usuario.id, '💬 Nuevo Comentario',
          `${req.usuario.nombre} comentó en "${tarea.titulo}"`,
          { tipo: 'nuevo_comentario', tareaId: String(tarea.id), url: '/' });
      }
    }

    const comentarioPopulado = {
    	...nuevoComentario,
     	usuario: { id: req.usuario.id, nombre: req.usuario.nombre, email: req.usuario.email },
    	fecha: new Date().toISOString()
    };
    res.json({ success: true, message: 'Comentario agregado', data: { comentario: comentarioPopulado } });
  } catch (error) {
    next(error);
  }
};

const eliminarColaborador = async (req, res, next) => {
  try {
    const { colaboradorId } = req.params;
    const tarea = await Task.findById(req.params.id);
    if (!tarea) return res.status(404).json({ success: false, message: 'Tarea no encontrada' });

    if (String(tarea.usuario) !== String(req.usuario.id)) {
      return res.status(403).json({ success: false, message: 'Solo el propietario puede eliminar colaboradores' });
    }

    tarea.colaboradores = tarea.colaboradores.filter(col => String(col.usuario.id) !== String(colaboradorId));
    if (tarea.colaboradores.length === 0) tarea.esCompartida = false;
    await tarea.save();

    res.json({ success: true, message: 'Colaborador eliminado', data: { tarea } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  crearTarea, obtenerTareas, obtenerMisTareas, obtenerTareaPorId,
  actualizarTarea, eliminarTarea, obtenerEstadisticas, compartirTarea,
  obtenerTareasCompartidas, agregarComentario, eliminarColaborador
};
