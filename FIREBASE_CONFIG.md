# 🔥 Configuración de Firebase Cloud Messaging

## ✅ Estado Actual

**Las notificaciones YA FUNCIONAN** pero solo cuando el navegador está abierto (notificaciones web nativas).

Para recibir notificaciones **en el celular con la app cerrada**, necesitas completar la configuración de Firebase Admin en el backend.

---

## 📱 ¿Cómo Funcionan las Notificaciones?

### 1. **Notificaciones Web (✅ YA FUNCIONAN)**
- Funcionan cuando el navegador está abierto
- Aparecen en la esquina superior derecha
- Se activan con: crear tarea, editar, eliminar, compartir, comentar

### 2. **Notificaciones Push (⏳ REQUIERE CONFIGURACIÓN)**
- Funcionan con la app/navegador cerrado
- Llegan al dispositivo móvil
- Requieren Firebase Admin configurado

---

## 🔧 Configuración de Firebase Admin (Backend)

### Paso 1: Obtener Credenciales de Firebase

1. Ve a: https://console.firebase.google.com/
2. Selecciona tu proyecto: **notis-3fb7b**
3. Click en ⚙️ (Configuración) → **Configuración del proyecto**
4. Pestaña **Cuentas de servicio**
5. Click en **Generar nueva clave privada**
6. Se descargará un archivo JSON con tus credenciales

### Paso 2: Agregar Credenciales al Proyecto

Tienes 2 opciones:

#### Opción A: Variables de Entorno (RECOMENDADO para producción)

Edita tu archivo `.env`:

```env
# Firebase Admin
FIREBASE_PROJECT_ID=notis-3fb7b
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@notis-3fb7b.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_PRIVATE_KEY_AQUI\n-----END PRIVATE KEY-----\n"
```

> ⚠️ La `FIREBASE_PRIVATE_KEY` debe estar entre comillas y mantener los `\n`

#### Opción B: Archivo de Credenciales (Para desarrollo local)

1. Coloca el archivo JSON descargado en: `src/config/firebase-adminsdk.json`
2. Agrega al `.env`:
```env
GOOGLE_APPLICATION_CREDENTIALS=./src/config/firebase-adminsdk.json
```

---

## 🚀 Verificar que Funciona

### En el Backend:

Al iniciar el servidor, deberías ver:
```
✅ Firebase Admin inicializado correctamente
```

Si ves:
```
⚠️ Firebase Admin no configurado (variables de entorno faltantes)
```
Significa que falta la configuración del Paso 2.

### En el Frontend:

1. Abre la app en tu navegador
2. Acepta las notificaciones cuando te pregunte
3. Abre la consola del navegador (F12)
4. Deberías ver:
```
✅ Service Worker registrado
✅ Permiso de notificaciones concedido
✅ Token FCM obtenido: [tu-token]
✅ Token FCM guardado en servidor
```

---

## 📱 Probar Notificaciones Push

### Test 1: Navegador Abierto
1. Crea una tarea
2. Deberías ver notificación web inmediatamente

### Test 2: Navegador Cerrado (Requiere Firebase Admin configurado)
1. Abre la app en el navegador
2. Acepta notificaciones
3. **CIERRA el navegador** (o minimiza)
4. Desde OTRO dispositivo/usuario, comparte una tarea contigo
5. Deberías recibir notificación push en tu dispositivo

---

## 🔥 Eventos que Envían Notificaciones

| Evento | Notificación Navegador Abierto | Notificación Push (cerrado) |
|--------|-------------------------------|----------------------------|
| Crear tarea | ✅ | ❌ (solo para ti) |
| Editar tarea | ✅ | ❌ (solo para ti) |
| Eliminar tarea | ✅ | ❌ (solo para ti) |
| **Compartir tarea** | ✅ | ✅ (al colaborador) |
| **Agregar comentario** | ✅ | ✅ (a propietario y colaboradores) |
| Tareas vencidas | ✅ | ✅ |

---

## 🐛 Troubleshooting

### Error: "Service Worker registration failed"
- Verifica que `firebase-messaging-sw.js` esté en `/public`
- Asegúrate de estar usando HTTPS (o localhost)

### Error: "Error al obtener token FCM"
- Verifica las claves VAPID en `firebase-config.js`
- Revisa la consola del navegador para más detalles

### No llegan notificaciones push con navegador cerrado
- Verifica que Firebase Admin esté configurado (ver consola del servidor)
- Confirma que el token FCM se guardó correctamente en la base de datos

### Notificaciones duplicadas
- Limpia los tokens antiguos en MongoDB:
```javascript
db.users.updateMany({}, { $set: { fcmTokens: [] } })
```

---

## 📊 Base de Datos

Los tokens FCM se guardan en el modelo `User`:

```javascript
fcmTokens: [{
  token: String,        // Token FCM único
  dispositivo: String,  // User agent del navegador
  fechaRegistro: Date   // Cuándo se registró
}]
```

---

## 🎯 Resumen

✅ **YA FUNCIONA:**
- Notificaciones web (navegador abierto)
- UI completa de tareas compartidas
- Sistema de comentarios
- Registro de tokens FCM

⏳ **FALTA:**
- Configurar Firebase Admin en backend (Paso 2)
- Probar notificaciones con navegador cerrado

---

## 🆘 Ayuda

Si tienes problemas:
1. Revisa los logs del servidor
2. Revisa la consola del navegador (F12)
3. Verifica que las credenciales de Firebase sean correctas
