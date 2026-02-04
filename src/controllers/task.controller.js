const Task = require('../models/Task');

// Crear nueva tarea
const crearTarea = async (req, res, next) => {
  try {
    const { titulo, descripcion, estado, prioridad, fechaVencimiento } = req.body;

    const tarea = await Task.create({
      titulo,
      descripcion,
      estado,
      prioridad,
      fechaVencimiento,
      usuario: req.usuario._id
    });

    res.status(201).json({
      success: true,
      message: 'Tarea creada exitosamente',
      data: { tarea }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todas las tareas (públicas para lectura)
const obtenerTareas = async (req, res, next) => {
  try {
    const tareas = await Task.find()
      .populate('usuario', 'nombre email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tareas.length,
      data: { tareas }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener tareas del usuario autenticado
const obtenerMisTareas = async (req, res, next) => {
  try {
    const tareas = await Task.find({ usuario: req.usuario._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tareas.length,
      data: { tareas }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener una tarea por ID
const obtenerTareaPorId = async (req, res, next) => {
  try {
    const tarea = await Task.findById(req.params.id)
      .populate('usuario', 'nombre email');

    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    res.json({
      success: true,
      data: { tarea }
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar tarea
const actualizarTarea = async (req, res, next) => {
  try {
    const tarea = await Task.findById(req.params.id);

    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    // Verificar que la tarea pertenezca al usuario
    if (tarea.usuario.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para modificar esta tarea'
      });
    }

    const { titulo, descripcion, estado, prioridad, fechaVencimiento } = req.body;

    const tareaActualizada = await Task.findByIdAndUpdate(
      req.params.id,
      { titulo, descripcion, estado, prioridad, fechaVencimiento },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Tarea actualizada exitosamente',
      data: { tarea: tareaActualizada }
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar tarea
const eliminarTarea = async (req, res, next) => {
  try {
    const tarea = await Task.findById(req.params.id);

    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    // Verificar que la tarea pertenezca al usuario
    if (tarea.usuario.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar esta tarea'
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Tarea eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Obtener estadísticas del usuario
const obtenerEstadisticas = async (req, res, next) => {
  try {
    const usuarioId = req.usuario._id;

    // Obtener todas las tareas del usuario
    const todasLasTareas = await Task.find({ usuario: usuarioId });

    // Contar por estado
    const porEstado = {
      pendiente: todasLasTareas.filter(t => t.estado === 'pendiente').length,
      en_progreso: todasLasTareas.filter(t => t.estado === 'en_progreso').length,
      completada: todasLasTareas.filter(t => t.estado === 'completada').length
    };

    // Contar por prioridad
    const porPrioridad = {
      baja: todasLasTareas.filter(t => t.prioridad === 'baja').length,
      media: todasLasTareas.filter(t => t.prioridad === 'media').length,
      alta: todasLasTareas.filter(t => t.prioridad === 'alta').length
    };

    // Tareas vencidas (fecha de vencimiento pasada y no completadas)
    const hoy = new Date();
    const tareasVencidas = todasLasTareas.filter(t => 
      t.fechaVencimiento && 
      new Date(t.fechaVencimiento) < hoy && 
      t.estado !== 'completada'
    ).length;

    // Tareas por vencer (próximos 7 días)
    const enUnaSemana = new Date();
    enUnaSemana.setDate(enUnaSemana.getDate() + 7);
    const tareasPorVencer = todasLasTareas.filter(t =>
      t.fechaVencimiento &&
      new Date(t.fechaVencimiento) >= hoy &&
      new Date(t.fechaVencimiento) <= enUnaSemana &&
      t.estado !== 'completada'
    ).length;

    // Productividad por día de la semana (últimos 30 días)
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    
    const tareasRecientes = todasLasTareas.filter(t => 
      new Date(t.createdAt) >= hace30Dias
    );

    const porDiaSemana = {
      Lunes: 0,
      Martes: 0,
      Miércoles: 0,
      Jueves: 0,
      Viernes: 0,
      Sábado: 0,
      Domingo: 0
    };

    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    tareasRecientes.forEach(tarea => {
      const dia = diasSemana[new Date(tarea.createdAt).getDay()];
      porDiaSemana[dia]++;
    });

    // Tareas completadas por semana (últimas 4 semanas)
    const tareasCompletadasPorSemana = [];
    for (let i = 3; i >= 0; i--) {
      const inicioSemana = new Date();
      inicioSemana.setDate(inicioSemana.getDate() - (i * 7 + 7));
      const finSemana = new Date();
      finSemana.setDate(finSemana.getDate() - (i * 7));

      const completadasEnSemana = todasLasTareas.filter(t =>
        t.estado === 'completada' &&
        new Date(t.updatedAt) >= inicioSemana &&
        new Date(t.updatedAt) < finSemana
      ).length;

      tareasCompletadasPorSemana.push({
        semana: `Semana ${4 - i}`,
        completadas: completadasEnSemana
      });
    }

    // Tasa de completado
    const totalTareas = todasLasTareas.length;
    const tasaCompletado = totalTareas > 0 
      ? Math.round((porEstado.completada / totalTareas) * 100)
      : 0;

    // Contar por categoría
    const porCategoria = {
      trabajo: todasLasTareas.filter(t => t.categoria === 'trabajo').length,
      estudio: todasLasTareas.filter(t => t.categoria === 'estudio').length,
      personal: todasLasTareas.filter(t => t.categoria === 'personal').length,
      hogar: todasLasTareas.filter(t => t.categoria === 'hogar').length,
      salud: todasLasTareas.filter(t => t.categoria === 'salud').length,
      otro: todasLasTareas.filter(t => t.categoria === 'otro').length
    };

    res.json({
      success: true,
      data: {
        resumen: {
          total: totalTareas,
          completadas: porEstado.completada,
          pendientes: porEstado.pendiente,
          enProgreso: porEstado.en_progreso,
          vencidas: tareasVencidas,
          porVencer: tareasPorVencer,
          tasaCompletado
        },
        porEstado,
        porPrioridad,
        porCategoria,
        porDiaSemana,
        tareasCompletadasPorSemana
      }
    });
  } catch (error) {
    next(error);
  }
};

const { enviarNotificacionPush } = require('../services/pushNotification.service');

// Compartir tarea con otro usuario
const compartirTarea = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { emailColaborador, permisos } = req.body;

    // Buscar tarea
    const tarea = await Task.findById(id);
    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    // Verificar que el usuario es el propietario
    if (tarea.usuario.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Solo el propietario puede compartir esta tarea'
      });
    }

    // Buscar colaborador por email
    const User = require('../models/User');
    const colaborador = await User.findOne({ email: emailColaborador });
    
    if (!colaborador) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado con ese email'
      });
    }

    // No permitir compartir consigo mismo
    if (colaborador._id.toString() === req.usuario._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'No puedes compartir una tarea contigo mismo'
      });
    }

    // Verificar si ya está compartida con este usuario
    const yaCompartida = tarea.colaboradores.some(
      col => col.usuario.toString() === colaborador._id.toString()
    );

    if (yaCompartida) {
      return res.status(400).json({
        success: false,
        message: 'Esta tarea ya está compartida con este usuario'
      });
    }

    // Agregar colaborador
    tarea.colaboradores.push({
      usuario: colaborador._id,
      permisos: permisos || 'leer'
    });
    tarea.esCompartida = true;
    await tarea.save();

    // Enviar notificación push al colaborador
    await enviarNotificacionPush(
      colaborador._id,
      '🤝 Nueva Tarea Compartida',
      `${req.usuario.nombre} compartió la tarea "${tarea.titulo}" contigo`,
      {
        tipo: 'tarea_compartida',
        tareaId: tarea._id.toString(),
        url: '/'
      }
    );

    res.json({
      success: true,
      message: `Tarea compartida con ${colaborador.nombre}`,
      data: { tarea }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener tareas compartidas conmigo
const obtenerTareasCompartidas = async (req, res, next) => {
  try {
    const tareas = await Task.find({
      'colaboradores.usuario': req.usuario._id
    })
    .populate('usuario', 'nombre email')
    .populate('colaboradores.usuario', 'nombre email')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tareas.length,
      data: { tareas }
    });
  } catch (error) {
    next(error);
  }
};

// Agregar comentario a una tarea
const agregarComentario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { texto } = req.body;

    if (!texto || texto.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El comentario no puede estar vacío'
      });
    }

    // Buscar tarea
    const tarea = await Task.findById(id);
    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    // Verificar que el usuario es propietario o colaborador
    const esPropietario = tarea.usuario.toString() === req.usuario._id.toString();
    const esColaborador = tarea.colaboradores.some(
      col => col.usuario.toString() === req.usuario._id.toString()
    );

    if (!esPropietario && !esColaborador) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para comentar en esta tarea'
      });
    }

    // Agregar comentario
    tarea.comentarios.push({
      usuario: req.usuario._id,
      texto: texto.trim()
    });
    await tarea.save();

    // Populate para devolver con datos del usuario
    await tarea.populate('comentarios.usuario', 'nombre email');

    // Enviar notificación al propietario (si no es el que comenta)
    if (tarea.usuario.toString() !== req.usuario._id.toString()) {
      await enviarNotificacionPush(
        tarea.usuario,
        '💬 Nuevo Comentario',
        `${req.usuario.nombre} comentó en "${tarea.titulo}"`,
        {
          tipo: 'nuevo_comentario',
          tareaId: tarea._id.toString(),
          url: '/'
        }
      );
    }

    // Enviar notificación a otros colaboradores
    for (const col of tarea.colaboradores) {
      if (col.usuario.toString() !== req.usuario._id.toString()) {
        await enviarNotificacionPush(
          col.usuario,
          '💬 Nuevo Comentario',
          `${req.usuario.nombre} comentó en "${tarea.titulo}"`,
          {
            tipo: 'nuevo_comentario',
            tareaId: tarea._id.toString(),
            url: '/'
          }
        );
      }
    }

    res.json({
      success: true,
      message: 'Comentario agregado',
      data: { 
        comentario: tarea.comentarios[tarea.comentarios.length - 1]
      }
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar colaborador
const eliminarColaborador = async (req, res, next) => {
  try {
    const { id, colaboradorId } = req.params;

    const tarea = await Task.findById(id);
    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    // Solo el propietario puede eliminar colaboradores
    if (tarea.usuario.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Solo el propietario puede eliminar colaboradores'
      });
    }

    // Eliminar colaborador
    tarea.colaboradores = tarea.colaboradores.filter(
      col => col.usuario.toString() !== colaboradorId
    );

    // Si no quedan colaboradores, marcar como no compartida
    if (tarea.colaboradores.length === 0) {
      tarea.esCompartida = false;
    }

    await tarea.save();

    res.json({
      success: true,
      message: 'Colaborador eliminado',
      data: { tarea }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  crearTarea,
  obtenerTareas,
  obtenerMisTareas,
  obtenerTareaPorId,
  actualizarTarea,
  eliminarTarea,
  obtenerEstadisticas,
  compartirTarea,
  obtenerTareasCompartidas,
  agregarComentario,
  eliminarColaborador
};
