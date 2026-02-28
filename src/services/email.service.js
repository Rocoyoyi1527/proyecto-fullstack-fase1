const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM || 'TaskFlow <noreply@lobelisque.space>';

const transporter = {
  sendMail: async (opts) => {
    return resend.emails.send({
      from: opts.from || EMAIL_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html
    });
  }
};

const BASE_URL = process.env.BASE_URL || 'https://lobelisque.space';

// Invitación a colaborar
const enviarInvitacionColaboracion = async ({ emailDestino, nombreInvitado, nombrePropietario, tarea, invitacionId }) => {
  const aceptarUrl = `${BASE_URL}/api/invitaciones/${invitacionId}/aceptar`;
  const rechazarUrl = `${BASE_URL}/api/invitaciones/${invitacionId}/rechazar`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `TaskFlow <${process.env.EMAIL_USER}>`,
    to: emailDestino,
    subject: `${nombrePropietario} te invitó a colaborar en una tarea`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f8f9fa; padding: 24px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #9333ea; margin: 0;">TASKFLOW</h1>
          <p style="color: #6b7280; margin: 4px 0 0;">Gestión de tareas colaborativa</p>
        </div>

        <div style="background: white; border-radius: 8px; padding: 24px; margin-bottom: 16px;">
          <h2 style="color: #1f2937; margin-top: 0;">¡Nueva invitación! 🤝</h2>
          <p style="color: #4b5563;">Hola <strong>${nombreInvitado}</strong>,</p>
          <p style="color: #4b5563;"><strong>${nombrePropietario}</strong> te ha invitado a colaborar en la siguiente tarea:</p>

          <div style="background: #f3f4f6; border-left: 4px solid #9333ea; padding: 16px; border-radius: 4px; margin: 16px 0;">
            <h3 style="color: #1f2937; margin: 0 0 8px;">${tarea.titulo}</h3>
            <p style="color: #6b7280; margin: 0;">${tarea.descripcion}</p>
            <div style="margin-top: 8px;">
              <span style="background: #e9d5ff; color: #7e22ce; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${tarea.prioridad}</span>
              <span style="background: #e9d5ff; color: #7e22ce; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 8px;">${tarea.categoria}</span>
            </div>
          </div>

          <p style="color: #4b5563;">¿Deseas aceptar la invitación?</p>

          <div style="text-align: center; margin-top: 24px;">
            <a href="${aceptarUrl}" style="background: #9333ea; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-right: 12px;">
              ✅ Aceptar
            </a>
            <a href="${rechazarUrl}" style="background: #ef4444; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              ❌ Rechazar
            </a>
          </div>
        </div>

        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          Este enlace expira en 7 días. Si no esperabas este email, ignóralo.
        </p>
      </div>
    `
  });
};

// Notificación al propietario de la decisión
const enviarRespuestaInvitacion = async ({ emailPropietario, nombrePropietario, nombreColaborador, tarea, acepto }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `TaskFlow <${process.env.EMAIL_USER}>`,
    to: emailPropietario,
    subject: `${nombreColaborador} ${acepto ? 'aceptó' : 'rechazó'} tu invitación`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f8f9fa; padding: 24px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #9333ea; margin: 0;">TASKFLOW</h1>
        </div>

        <div style="background: white; border-radius: 8px; padding: 24px;">
          <h2 style="color: #1f2937; margin-top: 0;">
            ${acepto ? '✅ Invitación aceptada' : '❌ Invitación rechazada'}
          </h2>
          <p style="color: #4b5563;">Hola <strong>${nombrePropietario}</strong>,</p>
          <p style="color: #4b5563;">
            <strong>${nombreColaborador}</strong> ha <strong>${acepto ? 'aceptado' : 'rechazado'}</strong> 
            tu invitación para colaborar en:
          </p>
          <div style="background: #f3f4f6; border-left: 4px solid #9333ea; padding: 16px; border-radius: 4px;">
            <h3 style="color: #1f2937; margin: 0;">${tarea.titulo}</h3>
          </div>
        </div>
      </div>
    `
  });
};

// Notificación de tarea vencida
const enviarNotificacionVencimiento = async ({ emailDestino, nombre, tareas }) => {
  const listaTareas = tareas.map(t => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${t.titulo}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #ef4444;">
        ${new Date(t.fechaVencimiento).toLocaleDateString('es-MX')}
      </td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">
        <span style="background: ${t.prioridad === 'alta' ? '#fee2e2' : t.prioridad === 'media' ? '#fef3c7' : '#d1fae5'}; 
          color: ${t.prioridad === 'alta' ? '#dc2626' : t.prioridad === 'media' ? '#d97706' : '#059669'};
          padding: 2px 8px; border-radius: 12px; font-size: 12px;">
          ${t.prioridad}
        </span>
      </td>
    </tr>
  `).join('');

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `TaskFlow <${process.env.EMAIL_USER}>`,
    to: emailDestino,
    subject: `⚠️ Tienes ${tareas.length} tarea(s) por vencer`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f8f9fa; padding: 24px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #9333ea; margin: 0;">TASKFLOW</h1>
        </div>

        <div style="background: white; border-radius: 8px; padding: 24px;">
          <h2 style="color: #1f2937; margin-top: 0;">⚠️ Tareas por vencer</h2>
          <p style="color: #4b5563;">Hola <strong>${nombre}</strong>,</p>
          <p style="color: #4b5563;">Las siguientes tareas vencen en las próximas 24 horas:</p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 8px 12px; text-align: left; color: #374151;">Tarea</th>
                <th style="padding: 8px 12px; text-align: left; color: #374151;">Vence</th>
                <th style="padding: 8px 12px; text-align: left; color: #374151;">Prioridad</th>
              </tr>
            </thead>
            <tbody>${listaTareas}</tbody>
          </table>

          <div style="text-align: center; margin-top: 24px;">
            <a href="${BASE_URL}" style="background: #9333ea; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Ver mis tareas
            </a>
          </div>
        </div>
      </div>
    `
  });
};


const enviarCorreoVerificacion = async ({ emailDestino, nombre, codigo }) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
      <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;">TASKFLOW</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;">Verificacion de cuenta</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#374151;">Hola <strong>${nombre}</strong>,</p>
          <p style="color:#6b7280;">Tu codigo de verificacion es:</p>
          <div style="text-align:center;margin:32px 0;">
            <div style="display:inline-block;background:#f3f0ff;border:2px dashed #7c3aed;border-radius:12px;padding:20px 40px;">
              <span style="font-size:42px;font-weight:900;letter-spacing:12px;color:#7c3aed;">${codigo}</span>
            </div>
          </div>
          <p style="color:#9ca3af;font-size:13px;text-align:center;">Expira en 15 minutos. Si no creaste esta cuenta, ignora este mensaje.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: emailDestino,
    subject: `${codigo} es tu codigo de verificacion - TaskFlow`,
    html
  });
};



module.exports = {
  enviarInvitacionColaboracion,
  enviarRespuestaInvitacion,
  enviarNotificacionVencimiento,
  enviarCorreoVerificacion
};