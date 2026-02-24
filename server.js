require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize SQLite (runs synchronously on require)
require('./src/config/database');

const { errorHandler, notFound } = require('./src/middleware/errorHandler');
const authRoutes = require('./src/routes/auth.routes');
const taskRoutes = require('./src/routes/task.routes');
const userRoutes = require('./src/routes/user.routes');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API de Gestión de Tareas Educativas',
    version: '1.0.0',
    endpoints: { auth: '/api/auth', tasks: '/api/tareas' }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/tareas', taskRoutes);
app.use('/api/usuarios', userRoutes);

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📝 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api\n`);
});

module.exports = app;
