const admin = require('firebase-admin');
const db = require('../config/database');

let firebaseInitialized = false;

try {
  if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin inicializado correctamente');
  } else {
    console.log('⚠️ Firebase Admin no configurado (variables de entorno faltantes)');
    console.log('   Las notificaciones push funcionarán solo en el navegador abierto');
  }
} catch (error) {
  console.log('⚠️ Error al inicializar Firebase Admin:', error.message);
}

const enviarNotificacionPush = async (usuarioId, titulo, cuerpo, datos = {}) => {
  if (!firebaseInitialized) {
    return { success: false, message: 'Firebase no configurado' };
  }

  try {
    const tokens = db.prepare('SELECT token FROM fcm_tokens WHERE usuario_id = ?').all(usuarioId);
    if (!tokens.length) return { success: false, message: 'Usuario sin tokens FCM' };

    const message = {
      notification: { title: titulo, body: cuerpo },
      data: { ...datos, click_action: 'FLUTTER_NOTIFICATION_CLICK' },
      webpush: { fcm_options: { link: datos.url || '/' } }
    };

    const tokensInvalidos = [];
    const resultados = [];

    for (const { token } of tokens) {
      try {
        const response = await admin.messaging().send({ ...message, token });
        resultados.push({ token, success: true, messageId: response });
      } catch (error) {
        if (
          error.code === 'messaging/invalid-registration-token' ||
          error.code === 'messaging/registration-token-not-registered'
        ) {
          tokensInvalidos.push(token);
        }
        resultados.push({ token, success: false, error: error.code });
      }
    }

    if (tokensInvalidos.length > 0) {
      const del = db.prepare('DELETE FROM fcm_tokens WHERE usuario_id = ? AND token = ?');
      tokensInvalidos.forEach(t => del.run(usuarioId, t));
    }

    return { success: true, resultados, tokensEliminados: tokensInvalidos.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const enviarNotificacionMasiva = async (usuarioIds, titulo, cuerpo, datos = {}) => {
  const resultados = [];
  for (const id of usuarioIds) {
    resultados.push({ usuarioId: id, ...await enviarNotificacionPush(id, titulo, cuerpo, datos) });
  }
  return resultados;
};

module.exports = { enviarNotificacionPush, enviarNotificacionMasiva, firebaseInitialized };
