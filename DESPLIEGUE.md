# 🚀 GUÍA DE DESPLIEGUE EN LA NUBE

## 📋 Opciones de Despliegue

### Opción 1: Render (Recomendado - Gratis)

#### A. Preparar el Proyecto

1. **Crear repositorio en GitHub**
```bash
git init
git add .
git commit -m "Proyecto Full Stack completo"
git remote add origin https://github.com/TU_USUARIO/proyecto-fullstack.git
git push -u origin main
```

2. **Crear archivo de configuración para Render**
Ya está incluido en `package.json`:
```json
"scripts": {
  "start": "node server.js"
}
```

#### B. Configurar MongoDB Atlas

1. **Crear cuenta gratuita**: https://www.mongodb.com/cloud/atlas
2. **Crear un nuevo cluster** (M0 Free tier)
3. **Configurar acceso a red**:
   - IP Address: `0.0.0.0/0` (permitir todo)
4. **Crear usuario de base de datos**:
   - Username: `admin`
   - Password: Genera una contraseña segura
5. **Obtener cadena de conexión**:
   - Click en "Connect" → "Connect your application"
   - Copiar la URI (ejemplo):
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/proyecto_fullstack?retryWrites=true&w=majority
   ```

#### C. Desplegar Backend en Render

1. **Ir a**: https://render.com
2. **Crear cuenta** con GitHub
3. **Nuevo Web Service**:
   - Click en "New +" → "Web Service"
   - Conectar con tu repositorio de GitHub
4. **Configuración**:
   - Name: `proyecto-fullstack`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: `Free`

5. **Variables de Entorno** (click en "Environment"):
```
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://admin:TU_PASSWORD@cluster0.xxxxx.mongodb.net/proyecto_fullstack
JWT_SECRET=tu_clave_super_secreta_cambiar_esto
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://tu-app.onrender.com
```

6. **Deploy**:
   - Click en "Create Web Service"
   - Esperar 5-10 minutos
   - Tu API estará en: `https://tu-app.onrender.com`

#### D. Actualizar Frontend

Editar `public/js/auth.js` y `public/js/app.js`:
```javascript
// Cambiar:
const API_URL = 'http://localhost:3000/api';

// Por:
const API_URL = 'https://tu-app.onrender.com/api';
```

#### E. Probar Despliegue

1. **Acceder a**: `https://tu-app.onrender.com`
2. **Registrarse** en la aplicación
3. **Crear tareas**
4. **Verificar que todo funciona**

---

### Opción 2: Heroku

#### A. Preparar Proyecto

1. **Instalar Heroku CLI**:
```bash
# Windows
choco install heroku-cli

# Mac
brew install heroku/brew/heroku
```

2. **Login**:
```bash
heroku login
```

3. **Crear aplicación**:
```bash
heroku create nombre-app-fullstack
```

#### B. Configurar MongoDB Atlas
(Mismo proceso que en Render - Opción 1B)

#### C. Configurar Variables de Entorno
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="mongodb+srv://admin:PASSWORD@cluster0.xxxxx.mongodb.net/proyecto_fullstack"
heroku config:set JWT_SECRET="tu_clave_secreta"
heroku config:set JWT_EXPIRES_IN="24h"
```

#### D. Desplegar
```bash
git push heroku main
```

#### E. Abrir Aplicación
```bash
heroku open
```

---

### Opción 3: Railway

#### A. Preparar Proyecto
1. **Ir a**: https://railway.app
2. **Crear cuenta** con GitHub
3. **New Project** → "Deploy from GitHub repo"
4. **Seleccionar repositorio**

#### B. Configurar Variables
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=24h
PORT=3000
```

#### C. Deploy
- Railway despliega automáticamente
- URL estará disponible en el dashboard

---

## 🔧 Configuraciones Adicionales

### Archivo `package.json` - Verificar

```json
{
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### Archivo `.gitignore`

Asegurarse de que incluye:
```
node_modules/
.env
*.log
.DS_Store
```

### Variables de Entorno en Producción

```env
# NO usar valores de desarrollo en producción
PORT=3000
NODE_ENV=production

# MongoDB Atlas (no MongoDB local)
MONGODB_URI=mongodb+srv://...

# JWT Secret (generar uno nuevo y seguro)
JWT_SECRET=clave_super_segura_de_32_caracteres_minimo

# JWT Expiración
JWT_EXPIRES_IN=24h

# CORS (URL de tu app desplegada)
CORS_ORIGIN=https://tu-app.onrender.com
```

---

## 📝 Checklist de Pre-Despliegue

- [ ] Código subido a GitHub
- [ ] `.env` en `.gitignore`
- [ ] MongoDB Atlas configurado
- [ ] Variables de entorno definidas
- [ ] `package.json` tiene `start` script
- [ ] Frontend apunta a URL de producción
- [ ] Pruebas locales exitosas
- [ ] README actualizado con URL de despliegue

---

## 🧪 Probar Despliegue

### 1. Verificar Backend
```bash
curl https://tu-app.onrender.com/api
```

Debe responder:
```json
{
  "success": true,
  "message": "API de Gestión de Tareas Educativas",
  "version": "1.0.0"
}
```

### 2. Registrar Usuario
```bash
curl -X POST https://tu-app.onrender.com/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test","email":"test@example.com","password":"123456"}'
```

### 3. Crear Tarea (con token)
```bash
curl -X POST https://tu-app.onrender.com/api/tareas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{"titulo":"Tarea Test","descripcion":"Descripción"}'
```

---

## 🔍 Monitoreo y Logs

### Render
- Dashboard → Tu servicio → "Logs"
- Ver logs en tiempo real

### Heroku
```bash
heroku logs --tail
```

### Railway
- Dashboard → Tu servicio → "Deployments" → Ver logs

---

## ⚡ Optimizaciones para Producción

### 1. Comprimir Respuestas
```bash
npm install compression
```

```javascript
// server.js
const compression = require('compression');
app.use(compression());
```

### 2. Helmet (Seguridad)
```bash
npm install helmet
```

```javascript
// server.js
const helmet = require('helmet');
app.use(helmet());
```

### 3. Rate Limiting
```bash
npm install express-rate-limit
```

```javascript
// server.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de requests
});

app.use('/api/', limiter);
```

---

## 📊 Métricas de Éxito

✅ **Backend desplegado** y accesible
✅ **Base de datos** conectada
✅ **Frontend** funcionando
✅ **Registro** funciona
✅ **Login** funciona
✅ **CRUD de tareas** funciona
✅ **URLs compartibles**

---

## 🆘 Solución de Problemas Comunes

### Error: Application Error
- Revisar logs del servicio
- Verificar variables de entorno
- Verificar que MongoDB Atlas permite conexiones

### Error: Cannot connect to MongoDB
- Verificar IP whitelist en MongoDB Atlas (0.0.0.0/0)
- Verificar credenciales en MONGODB_URI
- Verificar que el cluster esté activo

### Error: CORS
- Actualizar CORS_ORIGIN a la URL correcta
- Verificar que frontend use la URL de producción

### Error: 502 Bad Gateway
- El servidor no está respondiendo
- Verificar que el start command sea correcto
- Revisar logs para errores de inicio

---

## 📞 URLs Importantes

- **Render Dashboard**: https://dashboard.render.com
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Heroku Dashboard**: https://dashboard.heroku.com
- **Railway Dashboard**: https://railway.app

---

## 🎉 ¡Felicitaciones!

Tu aplicación Full Stack está ahora desplegada en la nube y accesible desde cualquier lugar.

**Ejemplo de URL final**:
- API: `https://proyecto-fullstack.onrender.com/api`
- App: `https://proyecto-fullstack.onrender.com`

Comparte el link con tu instructor o evaluador para la revisión del proyecto.
