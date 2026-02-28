const cron = require('node-cron');
const db = require('../config/database');
const { enviarNotificacionVencimiento } = require('./email.service');

function iniciarCronJobs() {
  // Corre todos los días a las 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('🕐 Revisando tareas por vencer...');

    try {
      const ahora = new Date();
      const en24h = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);

      // Buscar tareas que vencen en las próximas 24 horas y no están completadas
      const tareasPorVencer = db.prepare(`
        SELECT t.*, u.email, u.nombre
        FROM tasks t
        JOIN users u ON u.id = t.usuario_id
        WHERE t.fecha_vencimiento IS NOT NULL
          AND t.estado != 'completada'
          AND datetime(t.fecha_vencimiento) >= datetime(?)
          AND datetime(t.fecha_vencimiento) <= datetime(?)
      `).all(ahora.toISOString(), en24h.toISOString());

      if (tareasPorVencer.length === 0) {
        console.log('✅ No hay tareas por vencer en las próximas 24h');
        return;
      }

      // Agrupar por usuario
      const porUsuario = {};
      for (const t of tareasPorVencer) {
        if (!porUsuario[t.usuario_id]) {
          porUsuario[t.usuario_id] = { email: t.email, nombre: t.nombre, tareas: [] };
        }
        porUsuario[t.usuario_id].tareas.push({
          titulo: t.titulo,
          fechaVencimiento: t.fecha_vencimiento,
          prioridad: t.prioridad
        });
      }

      // Enviar un email por usuario con todas sus tareas por vencer
      for (const [userId, data] of Object.entries(porUsuario)) {
        try {
          await enviarNotificacionVencimiento({
            emailDestino: data.email,
            nombre: data.nombre,
            tareas: data.tareas
          });
          console.log(`📧 Email de vencimiento enviado a ${data.email} (${data.tareas.length} tareas)`);
        } catch (err) {
          console.error(`Error enviando email a ${data.email}:`, err.message);
        }
      }
    } catch (err) {
      console.error('Error en cron de vencimientos:', err.message);
    }
  });

  console.log('✅ Cron jobs iniciados (revisión diaria a las 8:00 AM)');
}

module.exports = { iniciarCronJobs };
