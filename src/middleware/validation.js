// Middleware de validación de datos

const validarRegistro = (req, res, next) => {
  const { nombre, email, password } = req.body;
  const errors = [];

  if (!nombre || nombre.trim().length === 0) {
    errors.push('El nombre es obligatorio');
  }

  if (!email || email.trim().length === 0) {
    errors.push('El email es obligatorio');
  } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.push('El email no es válido');
  }

  if (!password || password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors
    });
  }

  next();
};

const validarLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || email.trim().length === 0) {
    errors.push('El email es obligatorio');
  }

  if (!password || password.trim().length === 0) {
    errors.push('La contraseña es obligatoria');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors
    });
  }

  next();
};

const validarTarea = (req, res, next) => {
  const { titulo, descripcion } = req.body;
  const errors = [];

  if (!titulo || titulo.trim().length === 0) {
    errors.push('El título es obligatorio');
  } else if (titulo.length > 100) {
    errors.push('El título no puede exceder 100 caracteres');
  }

  if (!descripcion || descripcion.trim().length === 0) {
    errors.push('La descripción es obligatoria');
  } else if (descripcion.length > 500) {
    errors.push('La descripción no puede exceder 500 caracteres');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors
    });
  }

  next();
};

module.exports = {
  validarRegistro,
  validarLogin,
  validarTarea
};
