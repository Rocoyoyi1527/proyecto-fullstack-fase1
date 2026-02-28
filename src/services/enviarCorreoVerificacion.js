// AGREGAR esta función al email.service.js existente

const enviarCorreoVerificacion = async ({ emailDestino, nombre, codigo }) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
      <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:1px;">TASKFLOW</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;">Verificacion de cuenta</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#374151;font-size:16px;">Hola <strong>${nombre}</strong>,</p>
          <p style="color:#6b7280;">Ingresa el siguiente codigo para activar tu cuenta. Expira en <strong>15 minutos</strong>.</p>
          <div style="text-align:center;margin:32px 0;">
            <div style="display:inline-block;background:#f3f0ff;border:2px dashed #7c3aed;border-radius:12px;padding:20px 40px;">
              <span style="font-size:42px;font-weight:900;letter-spacing:12px;color:#7c3aed;">${codigo}</span>
            </div>
          </div>
          <p style="color:#9ca3af;font-size:13px;text-align:center;">Si no creaste esta cuenta, ignora este mensaje.</p>
        </div>
        <div style="background:#f9fafb;padding:16px;text-align:center;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">TaskFlow &copy; ${new Date().getFullYear()}</p>
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
  // ... tus exports existentes ...
  enviarCorreoVerificacion
};
