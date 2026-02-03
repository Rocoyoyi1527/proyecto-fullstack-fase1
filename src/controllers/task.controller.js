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

module.exports = {
  crearTarea,
  obtenerTareas,
  obtenerMisTareas,
  obtenerTareaPorId,
  actualizarTarea,
  eliminarTarea,
  obtenerEstadisticas
};
