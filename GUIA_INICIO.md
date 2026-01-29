# 🚀 GUÍA RÁPIDA DE INICIO

## ⚡ Inicio Rápido (5 minutos)

### Paso 1: Instalar Dependencias
```bash
npm install
```

### Paso 2: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/proyecto_fullstack
JWT_SECRET=mi_super_clave_secreta_123456
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000
```

### Paso 3: Iniciar MongoDB

**Opción A - MongoDB Local:**
```bash
mongod
```

**Opción B - MongoDB Atlas (Recomendado):**
1. Crear cuenta en https://www.mongodb.com/cloud/atlas
2. Crear un cluster gratuito
3. Obtener la cadena de conexión
4. Actualizar `MONGODB_URI` en `.env`

Ejemplo de URI de Atlas:
```
mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/proyecto_fullstack?retryWrites=true&w=majority
```

### Paso 4: Iniciar el Servidor
```bash
npm start
```

O para desarrollo con auto-recarga:
```bash
npm run dev
```

### Paso 5: Acceder a la Aplicación

Abre tu navegador en:
- **Frontend**: http://localhost:3000/login.html
- **API**: http://localhost:3000/api

---

## 🧪 Pruebas Rápidas

### 1. Probar el Backend con Postman

#### a) Registrar un Usuario
```http
POST http://localhost:3000/api/auth/registro
Content-Type: application/json

{
  "nombre": "Test User",
  "email": "test@example.com",
  "password": "123456"
}
```

#### b) Iniciar Sesión
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "123456"
}
```

**Importante**: Guarda el `token` que recibes en la respuesta.

#### c) Crear una Tarea (usa el token del paso anterior)
```http
POST http://localhost:3000/api/tareas
Authorization: Bearer TU_TOKEN_AQUI
Content-Type: application/json

{
  "titulo": "Mi primera tarea",
  "descripcion": "Esta es una tarea de prueba",
  "estado": "pendiente",
  "prioridad": "alta"
}
```

#### d) Obtener Todas las Tareas
```http
GET http://localhost:3000/api/tareas
```

### 2. Probar el Frontend

1. Abre http://localhost:3000/login.html
2. Haz clic en "Registrarse"
3. Completa el formulario
4. Serás redirigido al panel principal
5. Crea una nueva tarea
6. Observa cómo aparece en la lista

---

## 📦 Comandos Útiles

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo (auto-recarga)
npm run dev

# Iniciar en modo producción
npm start

# Ver estructura del proyecto
tree /F

# Limpiar node_modules
rmdir /s /q node_modules
npm install
```

---

## 🔍 Verificación de Instalación

### Verificar Node.js
```bash
node --version
# Debe mostrar v14 o superior
```

### Verificar npm
```bash
npm --version
# Debe mostrar 6 o superior
```

### Verificar MongoDB
```bash
mongod --version
# Debe mostrar la versión de MongoDB
```

---

## ❗ Solución de Problemas Comunes

### Problema: "Cannot find module 'express'"
**Solución**: Ejecuta `npm install`

### Problema: "MongoDB connection failed"
**Soluciones**:
1. Verifica que MongoDB esté corriendo: `mongod`
2. Verifica la URI en `.env`
3. Si usas MongoDB Atlas, verifica:
   - Las credenciales sean correctas
   - Tu IP esté en la whitelist
   - El cluster esté activo

### Problema: "Port 3000 already in use"
**Soluciones**:
1. Cambiar el puerto en `.env`: `PORT=3001`
2. O terminar el proceso que usa el puerto:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill
```

### Problema: "Token inválido o expirado"
**Solución**: 
1. Vuelve a iniciar sesión
2. Verifica que el token esté en el formato: `Bearer TOKEN`
3. Verifica que JWT_SECRET sea el mismo en `.env`

### Problema: CORS Error
**Solución**: Verifica que `CORS_ORIGIN` en `.env` coincida con la URL de tu frontend

---

## 📱 Probar en Diferentes Dispositivos

### Desktop
```
http://localhost:3000
```

### Móvil (en la misma red)
```
http://TU_IP_LOCAL:3000
```

Para obtener tu IP local:
```bash
# Windows
ipconfig

# Linux/Mac
ifconfig
```

---

## 🎯 Checklist de Verificación

- [ ] Node.js instalado
- [ ] MongoDB corriendo o Atlas configurado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env` creado y configurado
- [ ] Servidor inicia sin errores
- [ ] Puedes acceder a http://localhost:3000
- [ ] Puedes registrar un usuario
- [ ] Puedes crear una tarea
- [ ] Las operaciones CRUD funcionan

---

## 🎓 Próximos Pasos

1. ✅ Probar todas las funcionalidades
2. 📸 Grabar video demostrativo
3. 📝 Revisar documentación técnica
4. 🌐 Preparar para despliegue en la nube
5. 📦 Subir código a GitHub
6. 🚀 Desplegar en Render/Heroku

---

## 💡 Tips

- Usa `npm run dev` durante el desarrollo para auto-recarga
- Revisa la consola del navegador para errores en el frontend
- Revisa la terminal del servidor para errores en el backend
- Usa Postman para probar endpoints antes de integrar con frontend
- Guarda tus tokens para no tener que hacer login constantemente

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs del servidor
2. Verifica la consola del navegador
3. Consulta la sección de Solución de Problemas
4. Revisa el README.md completo

---

¡Listo! Tu aplicación Full Stack está corriendo 🎉
