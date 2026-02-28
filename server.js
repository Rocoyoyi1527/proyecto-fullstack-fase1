require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

require('./src/config/database');
require('./src/config/migrations');

const { errorHandler, notFound } = require('./src/middleware/errorHandler');
const authRoutes = require('./src/routes/auth.routes');
const taskRoutes = require('./src/routes/task.routes');
const userRoutes = require('./src/routes/user.routes');
const chatRoutes = require('./src/routes/chat.routes');
const invitationRoutes = require('./src/routes/invitation.routes');
const subtaskRoutes = require('./src/routes/subtask.routes');
const heartbeatRoutes = require('./src/routes/heartbeat.routes');

const { iniciarCronJobs } = require('./src/services/cron.service');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api', (req, res) => res.json({ success: true, message: 'TaskFlow API v1.0' }));

app.use('/api/auth', authRoutes);
app.use('/api/tareas', taskRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api', chatRoutes);
app.use('/api', invitationRoutes);
app.use('/api', subtaskRoutes);
app.use('/api', heartbeatRoutes);

const adminRoutes = require('./src/routes/admin.routes');
app.use('/api', adminRoutes);


app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

app.use(notFound);
app.use(errorHandler);

iniciarCronJobs();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📝 Entorno: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
