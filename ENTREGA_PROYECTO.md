# ENTREGA AVANCE DEL RETO - FASE 1
## PROYECTO FULL STACK: SISTEMA DE GESTIÓN DE TAREAS EDUCATIVAS

---

## DATOS DEL ALUMNO

**Nombre del Alumno:** [TU NOMBRE COMPLETO AQUÍ]  
**Matrícula/ID:** [TU MATRÍCULA AQUÍ]  
**Curso:** Desarrollo Full Stack  
**Fecha de Entrega:** [FECHA ACTUAL]  
**Instructor:** [NOMBRE DEL INSTRUCTOR]

---

## 1. REPOSITORIO EN GITHUB

### URL del Repositorio
```
[PEGA AQUÍ TU URL DE GITHUB]
Ejemplo: https://github.com/tuusuario/proyecto-fullstack-fase1
```

### Contenido del Repositorio
El repositorio incluye:
- ✅ Código fuente completo del backend (Node.js + Express)
- ✅ Código fuente completo del frontend (HTML + CSS + JavaScript)
- ✅ Documentación técnica completa
- ✅ Archivos de configuración (package.json, .env.example)
- ✅ Scripts de utilidad (seed.js)
- ✅ Colección de Postman para pruebas

### Instrucciones de Instalación
Ver archivo `README.md` en el repositorio para instrucciones detalladas de instalación y ejecución.

---

## 2. DOCUMENTACIÓN TÉCNICA

### 2.1 Estructura del Proyecto

```
AvanceProyectoFULLSTACK/
│
├── src/                          # Código del Backend
│   ├── config/                   # Configuraciones
│   │   ├── database.js          # Conexión a MongoDB
│   │   └── jwt.js               # Configuración JWT
│   │
│   ├── models/                   # Modelos de Datos
│   │   ├── User.js              # Modelo de Usuario
│   │   └── Task.js              # Modelo de Tarea
│   │
│   ├── controllers/              # Lógica de Negocio
│   │   ├── auth.controller.js   # Autenticación
│   │   └── task.controller.js   # Gestión de Tareas
│   │
│   ├── routes/                   # Rutas de la API
│   │   ├── auth.routes.js       # Rutas de autenticación
│   │   └── task.routes.js       # Rutas de tareas
│   │
│   └── middleware/               # Middleware
│       ├── auth.js              # Verificación JWT
│       ├── errorHandler.js      # Manejo de errores
│       └── validation.js        # Validaciones
│
├── public/                       # Frontend
│   ├── css/
│   │   └── styles.css           # Estilos de la aplicación
│   ├── js/
│   │   ├── auth.js              # Lógica de autenticación
│   │   └── app.js               # Lógica del dashboard
│   ├── index.html               # Dashboard principal
│   └── login.html               # Página de login/registro
│
├── server.js                     # Servidor Express
├── package.json                  # Dependencias
└── README.md                     # Documentación
```

### 2.2 Tecnologías Utilizadas

#### Backend
- **Node.js v18+** - Entorno de ejecución
- **Express.js 4.18** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose 8.0** - ODM para MongoDB
- **JWT (jsonwebtoken 9.0)** - Autenticación basada en tokens
- **bcryptjs 2.4** - Encriptación de contraseñas
- **CORS 2.8** - Manejo de políticas CORS
- **dotenv 16.3** - Gestión de variables de entorno

#### Frontend
- **HTML5** - Estructura
- **CSS3** - Estilos modernos con variables CSS, Flexbox, Grid
- **JavaScript ES6+** - Interactividad (Fetch API, DOM Manipulation)

#### Base de Datos
- **MongoDB Atlas** - Base de datos en la nube (cluster gratuito)

### 2.3 Características Implementadas

✅ **Sistema de Autenticación Completo**
- Registro de usuarios con validación
- Inicio de sesión con JWT
- Protección de rutas mediante middleware
- Encriptación de contraseñas con bcrypt (10 salt rounds)

✅ **Operaciones CRUD Completas para Tareas**
- CREATE: Crear nuevas tareas
- READ: Listar todas las tareas (público) y tareas del usuario
- UPDATE: Actualizar tareas propias
- DELETE: Eliminar tareas propias

✅ **Validaciones en Múltiples Capas**
- Frontend: HTML5 + JavaScript
- Backend: Middleware personalizado + Mongoose schemas

✅ **Manejo de Errores Centralizado**
- Middleware de manejo de errores
- Respuestas consistentes en formato JSON
- Códigos de estado HTTP apropiados

✅ **Interfaz de Usuario Moderna**
- Diseño responsivo (mobile-first)
- Animaciones CSS suaves
- Feedback visual inmediato
- Filtros de tareas por estado

---

## 3. ENDPOINTS DE LA API

### 3.1 Autenticación (`/api/auth`)

#### Registrar Usuario
```
POST /api/auth/registro
Content-Type: application/json

Body:
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "123456"
}

Respuesta (201):
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "usuario": {
      "id": "67a1b2c3d4e5f6a7b8c9d0e1",
      "nombre": "Juan Pérez",
      "email": "juan@example.com",
      "rol": "usuario"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Iniciar Sesión
```
POST /api/auth/login
Content-Type: application/json

Body:
{
  "email": "juan@example.com",
  "password": "123456"
}

Respuesta (200):
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "usuario": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Obtener Perfil (Requiere Autenticación)
```
GET /api/auth/perfil
Authorization: Bearer {token}

Respuesta (200):
{
  "success": true,
  "data": {
    "usuario": {
      "id": "67a1b2c3d4e5f6a7b8c9d0e1",
      "nombre": "Juan Pérez",
      "email": "juan@example.com",
      "rol": "usuario"
    }
  }
}
```

### 3.2 Tareas (`/api/tareas`)

#### Obtener Todas las Tareas (Público)
```
GET /api/tareas

Respuesta (200):
{
  "success": true,
  "count": 5,
  "data": {
    "tareas": [
      {
        "_id": "67a1b2c3d4e5f6a7b8c9d0e2",
        "titulo": "Estudiar Node.js",
        "descripcion": "Completar módulo de Express",
        "estado": "pendiente",
        "prioridad": "alta",
        "usuario": {
          "_id": "67a1b2c3d4e5f6a7b8c9d0e1",
          "nombre": "Juan Pérez",
          "email": "juan@example.com"
        },
        "createdAt": "2025-01-29T12:00:00.000Z",
        "updatedAt": "2025-01-29T12:00:00.000Z"
      }
      // ... más tareas
    ]
  }
}
```

#### Crear Tarea (Requiere Autenticación)
```
POST /api/tareas
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "titulo": "Estudiar MongoDB",
  "descripcion": "Aprender operaciones CRUD",
  "estado": "pendiente",
  "prioridad": "alta",
  "fechaVencimiento": "2025-02-15"
}

Respuesta (201):
{
  "success": true,
  "message": "Tarea creada exitosamente",
  "data": {
    "tarea": { ... }
  }
}
```

#### Actualizar Tarea (Requiere Autenticación)
```
PUT /api/tareas/:id
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "titulo": "Estudiar MongoDB Avanzado",
  "descripcion": "Agregación y indexación",
  "estado": "en_progreso",
  "prioridad": "media"
}

Respuesta (200):
{
  "success": true,
  "message": "Tarea actualizada exitosamente",
  "data": {
    "tarea": { ... }
  }
}
```

#### Eliminar Tarea (Requiere Autenticación)
```
DELETE /api/tareas/:id
Authorization: Bearer {token}

Respuesta (200):
{
  "success": true,
  "message": "Tarea eliminada exitosamente"
}
```

#### Obtener Mis Tareas (Requiere Autenticación)
```
GET /api/tareas/mis-tareas/todas
Authorization: Bearer {token}

Respuesta (200):
{
  "success": true,
  "count": 3,
  "data": {
    "tareas": [ ... ]
  }
}
```

### 3.3 Códigos de Estado HTTP

| Código | Significado | Cuándo se usa |
|--------|-------------|---------------|
| 200 | OK | Operación exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Datos de entrada inválidos |
| 401 | Unauthorized | Token inválido o no proporcionado |
| 403 | Forbidden | Usuario sin permisos |
| 404 | Not Found | Recurso no encontrado |
| 500 | Server Error | Error interno del servidor |

---

## 4. MODELOS DE DATOS

### 4.1 Modelo de Usuario (User)

```javascript
{
  _id: ObjectId,              // ID único (MongoDB)
  nombre: String,             // Nombre completo (requerido)
  email: String,              // Email único (requerido, único)
  password: String,           // Contraseña hasheada (requerido)
  rol: String,                // "usuario" o "admin" (default: "usuario")
  createdAt: Date,            // Fecha de creación
  updatedAt: Date             // Última actualización
}
```

**Validaciones:**
- Email válido y único
- Contraseña mínima de 6 caracteres
- Password encriptado antes de guardar (bcrypt)

### 4.2 Modelo de Tarea (Task)

```javascript
{
  _id: ObjectId,              // ID único (MongoDB)
  titulo: String,             // Título (max 100 caracteres, requerido)
  descripcion: String,        // Descripción (max 500 caracteres, requerido)
  estado: String,             // "pendiente", "en_progreso", "completada"
  prioridad: String,          // "baja", "media", "alta"
  fechaVencimiento: Date,     // Fecha límite (opcional)
  usuario: ObjectId,          // Referencia al usuario creador (requerido)
  createdAt: Date,            // Fecha de creación
  updatedAt: Date             // Última actualización
}
```

**Relaciones:**
- Una tarea pertenece a un usuario (many-to-one)
- Populate automático del usuario al listar tareas

---

## 5. SEGURIDAD IMPLEMENTADA

### 5.1 Autenticación
- **JWT (JSON Web Tokens)** con expiración de 24 horas
- Tokens firmados con clave secreta (almacenada en variables de entorno)
- Middleware de verificación en rutas protegidas

### 5.2 Encriptación
- Contraseñas hasheadas con **bcrypt**
- Salt rounds: 10
- Nunca se almacenan contraseñas en texto plano

### 5.3 Validaciones
- **Frontend**: Validación HTML5 + JavaScript
- **Backend**: Middleware personalizado + Mongoose validators
- Sanitización de entradas

### 5.4 CORS
- Configurado para permitir orígenes específicos
- Credenciales habilitadas para autenticación

### 5.5 Variables de Entorno
- Todas las credenciales en archivo `.env`
- `.env` excluido del repositorio (`.gitignore`)
- `.env.example` proporcionado como template

---

## 6. VIDEO DEMOSTRATIVO

### URL del Video
```
[PEGA AQUÍ TU ENLACE DE LOOM/YOUTUBE]
Ejemplo: https://www.loom.com/share/xxxxxxxxx
```

### Contenido del Video (5-10 minutos)
1. **Introducción** (30 seg) - Presentación del proyecto y tecnologías
2. **Frontend** (3 min) - Demostración de:
   - Registro de usuario
   - Inicio de sesión
   - Creación de tareas
   - Edición de tareas
   - Eliminación de tareas
   - Filtros por estado
3. **Backend con Postman** (2 min) - Demostración de:
   - Endpoint de registro
   - Endpoint de login
   - Endpoint de crear tarea (con token)
   - Prueba de error sin autenticación
4. **Código** (1 min) - Explicación breve de:
   - Estructura del proyecto
   - Modelo de datos
   - Middleware de autenticación
5. **Base de Datos** (1 min) - Visualización en MongoDB Atlas

---

## 7. DESPLIEGUE EN LA NUBE

### URL de la Aplicación Desplegada
```
[PEGA AQUÍ TU URL DE RENDER/HEROKU]
Ejemplo: https://proyecto-fullstack-tunombre.onrender.com
```

### Plataforma Utilizada
- **Render** (o especifica la que usaste: Heroku, Railway, etc.)

### Base de Datos
- **MongoDB Atlas** - Cluster gratuito M0
- Región: [Especifica la región, ej: N. Virginia]

### Variables de Entorno en Producción
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://... (MongoDB Atlas)
JWT_SECRET=... (clave secreta segura)
JWT_EXPIRES_IN=24h
PORT=3000
CORS_ORIGIN=https://tu-app.onrender.com
```

**Nota:** Si no desplegaste en la nube, especifica: "Aplicación funcional en entorno local. Despliegue en nube pendiente para siguientes fases."

---

## 8. INSTRUCCIONES DE USO

### 8.1 Instalación Local

1. Clonar el repositorio:
```bash
git clone [URL_DE_TU_REPOSITORIO]
cd proyecto-fullstack-fase1
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
- Copiar `.env.example` a `.env`
- Actualizar con tus credenciales de MongoDB Atlas

4. Iniciar el servidor:
```bash
npm start
```

5. Abrir en navegador:
```
http://localhost:3000/login.html
```

### 8.2 Pruebas con Postman

1. Importar la colección: `Postman_Collection.json`
2. Ejecutar endpoints en orden:
   - Registro
   - Login
   - Crear tarea
   - Listar tareas
   - Actualizar/Eliminar

### 8.3 Datos de Prueba

Ejecutar script de datos de prueba:
```bash
node seed.js
```

Esto crea 3 usuarios y 5 tareas de ejemplo.

**Usuarios de prueba:**
- `juan@example.com` / `123456`
- `maria@example.com` / `123456`
- `admin@example.com` / `123456`

---

## 9. PRUEBAS REALIZADAS

### 9.1 Pruebas Funcionales
✅ Registro de usuario con validación
✅ Login exitoso y fallido
✅ Creación de tareas
✅ Listado de tareas (todas y propias)
✅ Actualización de tareas
✅ Eliminación de tareas
✅ Filtros por estado
✅ Protección de rutas sin token
✅ Manejo de errores

### 9.2 Pruebas de Seguridad
✅ Contraseñas encriptadas en DB
✅ JWT expira correctamente
✅ No se puede acceder a rutas protegidas sin token
✅ No se puede editar/eliminar tareas de otros usuarios
✅ Validación de datos en backend

### 9.3 Pruebas de UI/UX
✅ Diseño responsivo en móvil y desktop
✅ Animaciones funcionan correctamente
✅ Mensajes de error/éxito visibles
✅ Formularios validan correctamente
✅ Navegación intuitiva

---

## 10. CONCLUSIONES

### Objetivos Alcanzados

✅ **Backend robusto** con Node.js, Express y MongoDB
✅ **Autenticación segura** con JWT y bcrypt
✅ **API RESTful** completa con operaciones CRUD
✅ **Frontend moderno** e interactivo con HTML, CSS y JavaScript
✅ **Validaciones** en múltiples capas
✅ **Manejo de errores** centralizado
✅ **Documentación** completa y detallada
✅ **Código limpio** y bien estructurado (patrón MVC)

### Aprendizajes Clave

1. Implementación de autenticación JWT
2. Desarrollo de API RESTful con Express
3. Modelado de datos con MongoDB y Mongoose
4. Diseño de interfaces modernas con CSS3
5. Integración frontend-backend
6. Manejo de errores y validaciones
7. Despliegue en plataformas cloud

### Mejoras Futuras

Para fases posteriores del proyecto:
- Paginación de resultados
- Búsqueda avanzada de tareas
- Notificaciones en tiempo real
- Upload de archivos
- Dashboard con estadísticas
- Tests automatizados
- CI/CD pipeline

---

## 11. RECURSOS ADICIONALES

### Documentación en el Repositorio
- `README.md` - Documentación principal
- `GUIA_INICIO.md` - Guía de inicio rápido
- `DOCUMENTACION_TECNICA.md` - Documentación técnica detallada
- `DESPLIEGUE.md` - Guía de despliegue en la nube
- `GUIA_VIDEO.md` - Guía para crear el video

### Herramientas Utilizadas
- **VS Code** - Editor de código
- **Postman** - Pruebas de API
- **MongoDB Compass** - Visualización de base de datos
- **Git/GitHub** - Control de versiones
- **Render** - Despliegue en la nube

---

## 12. DECLARACIÓN

Declaro que el trabajo presentado es original y ha sido desarrollado por mí, aplicando los conocimientos adquiridos en el curso de Desarrollo Full Stack.

**Firma:** _______________________

**Fecha:** [FECHA ACTUAL]

---

## ANEXOS

### Anexo A: Capturas de Pantalla

[Aquí puedes agregar capturas de pantalla de:]
1. Página de login/registro
2. Dashboard con tareas
3. Postman ejecutando endpoints
4. MongoDB Atlas mostrando datos
5. Aplicación desplegada en la nube

### Anexo B: Enlaces Importantes

- Repositorio GitHub: [URL]
- Video demostrativo: [URL]
- Aplicación desplegada: [URL]
- MongoDB Atlas: https://cloud.mongodb.com/

---

**FIN DEL DOCUMENTO**
