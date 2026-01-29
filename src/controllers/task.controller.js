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

module.exports = {
  crearTarea,
  obtenerTareas,
  obtenerMisTareas,
  obtenerTareaPorId,
  actualizarTarea,
  eliminarTarea
};
