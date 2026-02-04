const admin = require('firebase-admin');

// Inicializar Firebase Admin
// NOTA: Firebase Admin requiere credenciales. Por ahora lo dejamos sin inicializar
// y las notificaciones solo funcionarán con las notificaciones web del navegador

let firebaseInitialized = false;

// Intentar inicializar Firebase
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
  console.log('   Las notificaciones push funcionarán solo en el navegador abierto');
}

// Enviar notificación push a un usuario específico
const enviarNotificacionPush = async (usuarioId, titulo, cuerpo, datos = {}) => {
  try {
    // Si Firebase no está inicializado, retornar sin error
    if (!firebaseInitialized) {
      console.log('⚠️ Firebase no configurado, usando solo notificaciones web');
      return { success: false, message: 'Firebase no configurado - notificaciones web activas' };
    }

    const User = require('../models/User');
    const usuario = await User.findById(usuarioId);
    
    if (!usuario || !usuario.fcmTokens || usuario.fcmTokens.length === 0) {
      console.log(`ℹ️ Usuario ${usuarioId} no tiene tokens FCM registrados`);
      return { success: false, message: 'Usuario sin tokens FCM' };
    }

    // Preparar mensaje
    const message = {
      notification: {
        title: titulo,
        body: cuerpo
      },
      data: {
        ...datos,
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      webpush: {
        fcm_options: {
          link: datos.url || '/'
        }
      }
    };

    // Enviar a todos los tokens del usuario
    const resultados = [];
    const tokensInvalidos = [];

    for (const tokenObj of usuario.fcmTokens) {
      try {
        const response = await admin.messaging().send({
          ...message,
          token: tokenObj.token
        });
        
        resultados.push({
          token: tokenObj.token,
          success: true,
          messageId: response
        });
        
        console.log(`✅ Notificación push enviada a ${usuario.email}`);
      } catch (error) {
        console.error(`Error al enviar a token:`, error.code);
        
        // Si el token es inválido, marcarlo para eliminación
        if (error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered') {
          tokensInvalidos.push(tokenObj.token);
        }
        
        resultados.push({
          token: tokenObj.token,
          success: false,
          error: error.code
        });
      }
    }

    // Eliminar tokens inválidos
    if (tokensInvalidos.length > 0) {
      usuario.fcmTokens = usuario.fcmTokens.filter(
        t => !tokensInvalidos.includes(t.token)
      );
      await usuario.save();
      console.log(`🗑️ Eliminados ${tokensInvalidos.length} tokens inválidos`);
    }

    return {
      success: true,
      resultados,
      tokensEliminados: tokensInvalidos.length
    };

  } catch (error) {
    console.error('Error en enviarNotificacionPush:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Enviar notificación a múltiples usuarios
const enviarNotificacionMasiva = async (usuarioIds, titulo, cuerpo, datos = {}) => {
  const resultados = [];
  
  for (const usuarioId of usuarioIds) {
    const resultado = await enviarNotificacionPush(usuarioId, titulo, cuerpo, datos);
    resultados.push({ usuarioId, ...resultado });
  }
  
  return resultados;
};

module.exports = {
  enviarNotificacionPush,
  enviarNotificacionMasiva,
  firebaseInitialized
};
