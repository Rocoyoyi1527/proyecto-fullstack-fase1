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
- ✅ Configuración de Docker (Dockerfile, docker-compose.yml)
- ✅ Documentación técnica completa
- ✅ Archivos de configuración (package.json, .env.example)
- ✅ Scripts de despliegue y utilidad
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
│   │   ├── auth.js              # Lógica de autenticación (detecta prod/dev)
│   │   └── app.js               # Lógica del dashboard (detecta prod/dev)
│   ├── index.html               # Dashboard principal
│   └── login.html               # Página de login/registro
│
├── Dockerfile                    # Configuración de imagen Docker
├── docker-compose.yml            # Orquestación de contenedores
├── .dockerignore                 # Archivos excluidos de Docker
├── deploy.sh                     # Script de despliegue automatizado
├── server.js                     # Servidor Express
├── package.json                  # Dependencias
└── README.md                     # Documentación
```

### 2.2 Tecnologías Utilizadas

#### Backend
- **Node.js v18+** - Entorno de ejecución
- **Express.js 4.18** - Framework web
- **MongoDB Atlas** - Base de datos NoSQL en la nube
- **Mongoose 8.0** - ODM para MongoDB
- **JWT (jsonwebtoken 9.0)** - Autenticación basada en tokens
- **bcryptjs 2.4** - Encriptación de contraseñas (10 salt rounds)
- **CORS 2.8** - Manejo de políticas CORS
- **dotenv 16.3** - Gestión de variables de entorno

#### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos con variables CSS, Flexbox, Grid, animaciones
- **JavaScript ES6+** - Interactividad (Fetch API, Async/Await, DOM Manipulation)
- **Detección automática de entorno** - Configuración dinámica para desarrollo/producción

#### Infraestructura y Despliegue
- **Docker 24+** - Contenedorización de la aplicación
- **Docker Compose** - Orquestación de servicios
- **Ubuntu Linux 24** - Sistema operativo del servidor
- **Nginx** - Servidor web y reverse proxy (opcional)
- **MongoDB Atlas** - Base de datos en la nube con cluster M0 (gratuito)

#### DevOps
- **Git/GitHub** - Control de versiones
- **Docker Multi-stage builds** - Optimización de imágenes
- **Variables de entorno** - Configuración separada por entorno
- **Health checks** - Monitoreo de contenedores
- **Auto-restart** - Reinicio automático en caso de fallos

### 2.3 Características Implementadas

✅ **Sistema de Autenticación Completo**
- Registro de usuarios con validación
- Inicio de sesión con JWT
- Protección de rutas mediante middleware
- Encriptación de contraseñas con bcrypt (10 salt rounds)
- Tokens con expiración de 24 horas

✅ **Operaciones CRUD Completas para Tareas**
- CREATE: Crear nuevas tareas con validación
- READ: Listar todas las tareas (público) y tareas del usuario (privado)
- UPDATE: Actualizar tareas propias con verificación de propiedad
- DELETE: Eliminar tareas propias con confirmación

✅ **Validaciones en Múltiples Capas**
- Frontend: HTML5 + JavaScript con feedback inmediato
- Backend: Middleware personalizado + Mongoose schemas
- Base de datos: Constraints y validaciones a nivel de modelo

✅ **Manejo de Errores Centralizado**
- Middleware de manejo de errores
- Respuestas consistentes en formato JSON
- Códigos de estado HTTP apropiados
- Logging de errores

✅ **Interfaz de Usuario Moderna**
- Diseño responsivo (mobile-first)
- Animaciones CSS suaves
- Feedback visual inmediato
- Filtros de tareas por estado
- Badges de prioridad y estado

✅ **Despliegue Containerizado**
- Aplicación empaquetada en Docker
- Configuración reproducible
- Reinicio automático en caso de fallos
- Aislamiento de dependencias

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
  email: String,              // Email único (requerido, indexado)
  password: String,           // Contraseña hasheada (requerido, select: false)
  rol: String,                // "usuario" o "admin" (default: "usuario")
  createdAt: Date,            // Fecha de creación
  updatedAt: Date             // Última actualización
}
```

**Validaciones:**
- Email válido y único (índice único)
- Contraseña mínima de 6 caracteres
- Password encriptado antes de guardar (bcrypt middleware)
- Método `compararPassword` para verificación

### 4.2 Modelo de Tarea (Task)

```javascript
{
  _id: ObjectId,              // ID único (MongoDB)
  titulo: String,             // Título (max 100 caracteres, requerido)
  descripcion: String,        // Descripción (max 500 caracteres, requerido)
  estado: String,             // "pendiente", "en_progreso", "completada"
  prioridad: String,          // "baja", "media", "alta"
  fechaVencimiento: Date,     // Fecha límite (opcional)
  usuario: ObjectId,          // Referencia al usuario creador (requerido, ref: 'User')
  createdAt: Date,            // Fecha de creación
  updatedAt: Date             // Última actualización
}
```

**Relaciones:**
- Una tarea pertenece a un usuario (many-to-one)
- Populate automático del usuario al listar tareas públicas

---

## 5. SEGURIDAD IMPLEMENTADA

### 5.1 Autenticación
- **JWT (JSON Web Tokens)** con expiración de 24 horas
- Tokens firmados con clave secreta de 32+ caracteres
- Middleware de verificación en rutas protegidas
- Validación de token en cada request protegido

### 5.2 Encriptación
- Contraseñas hasheadas con **bcrypt**
- Salt rounds: 10 (equilibrio seguridad/performance)
- Nunca se almacenan contraseñas en texto plano
- Password excluido por defecto en queries (select: false)

### 5.3 Validaciones
- **Frontend**: Validación HTML5 + JavaScript (prevención)
- **Backend**: Middleware personalizado + Mongoose validators (seguridad)
- Sanitización de entradas
- Validación de tipos de datos
- Límites de longitud de campos

### 5.4 CORS
- Configurado para permitir orígenes específicos
- Credenciales habilitadas para autenticación
- Headers permitidos: Content-Type, Authorization
- Métodos permitidos: GET, POST, PUT, DELETE

### 5.5 Variables de Entorno
- Todas las credenciales en archivo `.env`
- `.env` excluido del repositorio (`.gitignore`)
- `.env.example` proporcionado como template
- Variables separadas por entorno (desarrollo/producción)

### 5.6 Docker Security
- Imagen basada en Alpine Linux (minimal attack surface)
- Usuario no-root en el contenedor
- Network isolation con Docker networks
- Secrets manejados via environment variables
- No hay archivos sensibles en la imagen

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
4. **Despliegue Docker** (1 min) - Demostración de:
   - Contenedor corriendo (`docker ps`)
   - Logs de la aplicación
   - Aplicación accesible desde navegador
5. **Base de Datos** (1 min) - Visualización en MongoDB Atlas

---

## 7. DESPLIEGUE EN SERVIDOR DEDICADO

### URL de la Aplicación Desplegada
```
http://189.194.68.7:8080
O
http://obelisque.space:8080 (cuando DNS se propague)
```

### 7.1 Arquitectura de Despliegue

```
┌─────────────────────────────────────────────────┐
│           INTERNET (Acceso Público)              │
└──────────────────┬──────────────────────────────┘
                   │
                   │ Puerto 8080
                   ▼
┌─────────────────────────────────────────────────┐
│    SERVIDOR UBUNTU LINUX (189.194.68.7)         │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │     Docker Container                    │    │
│  │  ┌──────────────────────────────────┐  │    │
│  │  │   Node.js + Express              │  │    │
│  │  │   Puerto 3000 (interno)          │  │    │
│  │  │                                  │  │    │
│  │  │   - API REST (/api)             │  │    │
│  │  │   - Frontend estático (/)        │  │    │
│  │  │   - JWT Authentication           │  │    │
│  │  └──────────────────────────────────┘  │    │
│  └────────────────────────────────────────┘    │
│                   │                             │
│                   │ HTTPS/Internet              │
│                   ▼                             │
│         ┌──────────────────┐                    │
│         │  MongoDB Atlas   │                    │
│         │  (Cloud DB)      │                    │
│         └──────────────────┘                    │
└─────────────────────────────────────────────────┘
```

### 7.2 Especificaciones del Servidor

**Sistema Operativo:**
- Ubuntu Linux 24.04 LTS
- Kernel: Linux 6.x

**Software Instalado:**
- Docker Engine 24+
- Docker Compose 2.x
- Git 2.x
- Nginx (opcional, para reverse proxy)

**Recursos:**
- CPU: Dedicado
- RAM: Suficiente para contenedor Node.js
- Almacenamiento: SSD
- Red: IP pública estática (189.194.68.7)
- Dominio: obelisque.space

### 7.3 Configuración Docker

**Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  app:
    build: .
    container_name: proyecto-fullstack
    restart: always
    ports:
      - "8080:3000"
    env_file:
      - .env
    networks:
      - app-network
networks:
  app-network:
    driver: bridge
```

### 7.4 Variables de Entorno en Producción

```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/proyecto_fullstack
JWT_SECRET=clave_segura_generada_con_openssl
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://189.194.68.7:8080
```

### 7.5 Proceso de Despliegue

1. **Preparación del Código:**
   ```bash
   git clone https://github.com/usuario/proyecto-fullstack-fase1.git
   cd proyecto-fullstack-fase1
   ```

2. **Configuración de Variables:**
   ```bash
   cp .env.example .env
   nano .env  # Configurar variables reales
   ```

3. **Construcción de la Imagen:**
   ```bash
   docker-compose build
   ```

4. **Inicio del Contenedor:**
   ```bash
   docker-compose up -d
   ```

5. **Verificación:**
   ```bash
   docker ps
   docker logs proyecto-fullstack
   curl http://localhost:8080/api
   ```

### 7.6 Características del Despliegue

✅ **Alta Disponibilidad**
- Contenedor con `restart: always`
- Se reinicia automáticamente en caso de fallo
- Inicia automáticamente al reiniciar el servidor

✅ **Aislamiento**
- Aplicación aislada en contenedor Docker
- Network dedicada para comunicación
- No hay conflictos con otros servicios

✅ **Reproducibilidad**
- Mismo entorno en desarrollo y producción
- Dockerfile garantiza consistencia
- Fácil de replicar en otros servidores

✅ **Monitoreo**
- Logs accesibles: `docker logs -f proyecto-fullstack`
- Métricas de recursos: `docker stats proyecto-fullstack`
- Estado del contenedor: `docker ps`

✅ **Mantenimiento**
- Actualizaciones simples: `git pull && docker-compose restart`
- Rollback fácil con Git
- Backups automáticos de base de datos (MongoDB Atlas)

### 7.7 Acceso a la Aplicación

**URL Principal:**
```
http://189.194.68.7:8080
```

**Endpoints Disponibles:**
- Frontend: `http://189.194.68.7:8080`
- API: `http://189.194.68.7:8080/api`
- Login: `http://189.194.68.7:8080/login.html`
- Dashboard: `http://189.194.68.7:8080/index.html`

**Estado:** ✅ Funcionando 24/7

---

## 8. INSTRUCCIONES DE USO

### 8.1 Acceso Remoto a la Aplicación

**URL:** `http://189.194.68.7:8080`

1. Abrir navegador web
2. Navegar a la URL
3. Registrarse o iniciar sesión
4. Utilizar el sistema de gestión de tareas

### 8.2 Uso de la Aplicación

1. **Registro de Usuario:**
   - Click en "Registrarse"
   - Llenar: Nombre, Email, Contraseña (mín. 6 caracteres)
   - Click en "Registrarse"
   - Redirección automática al dashboard

2. **Inicio de Sesión:**
   - Ingresar Email y Contraseña
   - Click en "Iniciar Sesión"
   - Acceso al dashboard

3. **Gestión de Tareas:**
   - **Crear:** Llenar formulario superior y click en "Crear Tarea"
   - **Ver:** Todas las tareas se muestran en tarjetas
   - **Filtrar:** Botones "Todas", "Pendientes", "En Progreso", "Completadas"
   - **Editar:** Click en "Editar", modificar campos, guardar
   - **Eliminar:** Click en "Eliminar", confirmar

### 8.3 Pruebas con Postman

1. Importar la colección: `Postman_Collection.json`
2. Configurar base URL: `http://189.194.68.7:8080/api`
3. Ejecutar endpoints en orden:
   - Registro → Login → Crear tarea → CRUD completo

### 8.4 Administración del Servidor (Para Mantenimiento)

**Conexión SSH:**
```bash
ssh usuario@189.194.68.7
```

**Comandos útiles:**
```bash
# Ver logs
docker logs -f proyecto-fullstack

# Reiniciar aplicación
cd ~/apps/proyecto-fullstack-fase1
docker-compose restart

# Actualizar código
git pull
docker-compose down
docker-compose build
docker-compose up -d

# Ver estado
docker ps
docker stats proyecto-fullstack
```

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
✅ Responsividad en diferentes dispositivos

### 9.2 Pruebas de Seguridad
✅ Contraseñas encriptadas en DB (verificado en MongoDB Atlas)
✅ JWT expira correctamente (24 horas)
✅ No se puede acceder a rutas protegidas sin token válido
✅ No se puede editar/eliminar tareas de otros usuarios
✅ Validación de datos en backend previene inyecciones
✅ CORS configurado correctamente

### 9.3 Pruebas de UI/UX
✅ Diseño responsivo en móvil, tablet y desktop
✅ Animaciones funcionan correctamente
✅ Mensajes de error/éxito visibles y claros
✅ Formularios validan correctamente
✅ Navegación intuitiva
✅ Feedback visual inmediato en acciones

### 9.4 Pruebas de Despliegue
✅ Contenedor Docker inicia correctamente
✅ Aplicación accesible desde internet
✅ MongoDB Atlas conecta sin problemas
✅ Reinicio automático funciona
✅ Logs accesibles y legibles
✅ Variables de entorno cargadas correctamente

---

## 10. CONCLUSIONES

### Objetivos Alcanzados

✅ **Backend robusto y escalable** con Node.js, Express y MongoDB  
✅ **Autenticación segura** con JWT y bcrypt  
✅ **API RESTful completa** con operaciones CRUD  
✅ **Frontend moderno e interactivo** con HTML, CSS y JavaScript vanilla  
✅ **Validaciones en múltiples capas** (frontend, backend, base de datos)  
✅ **Manejo de errores centralizado** y consistente  
✅ **Documentación completa y detallada**  
✅ **Código limpio y estructurado** siguiendo patrón MVC  
✅ **Despliegue en producción** con Docker en servidor dedicado  
✅ **Alta disponibilidad** 24/7 con reinicio automático  

### Aprendizajes Clave

1. **Arquitectura Full Stack** - Integración completa frontend-backend
2. **Autenticación JWT** - Implementación de tokens seguros
3. **Desarrollo de API RESTful** - Endpoints bien diseñados
4. **Modelado de datos** - MongoDB y Mongoose
5. **Diseño responsivo** - CSS moderno y adaptable
6. **Despliegue con Docker** - Contenedorización de aplicaciones
7. **DevOps básico** - CI/CD manual, variables de entorno
8. **Seguridad web** - Prácticas de encriptación y validación
9. **Trabajo con bases de datos en la nube** - MongoDB Atlas

### Mejoras Futuras (Siguientes Fases)

**Funcionalidades:**
- Paginación de resultados
- Búsqueda avanzada de tareas
- Filtros combinados (estado + prioridad + fecha)
- Notificaciones de tareas vencidas
- Sistema de recordatorios
- Categorías/etiquetas para tareas
- Colaboración entre usuarios
- Dashboard con estadísticas y gráficas

**Técnicas:**
- Tests automatizados (Jest, Mocha)
- CI/CD automatizado (GitHub Actions)
- SSL/HTTPS con certificado (Let's Encrypt)
- Rate limiting y throttling
- Logging avanzado (Winston, Morgan)
- Monitoreo con Prometheus/Grafana
- Backup automatizado de base de datos
- Documentación API con Swagger

**Infraestructura:**
- Load balancer para alta disponibilidad
- CDN para assets estáticos
- Redis para caché
- WebSockets para actualizaciones en tiempo real
- Kubernetes para orquestación avanzada

---

## 11. RECURSOS ADICIONALES

### Documentación en el Repositorio
- `README.md` - Documentación principal del proyecto
- `GUIA_INICIO.md` - Guía de inicio rápido (5 minutos)
- `DOCUMENTACION_TECNICA.md` - Documentación técnica detallada
- `DESPLIEGUE.md` - Guía de despliegue en la nube (Render, Heroku, Railway)
- `DESPLIEGUE_UBUNTU.md` - Guía de despliegue en servidor Ubuntu con Docker
- `GUIA_VIDEO.md` - Guía para crear el video demostrativo

### Archivos de Configuración
- `Dockerfile` - Configuración de la imagen Docker
- `docker-compose.yml` - Orquestación de contenedores
- `.dockerignore` - Archivos excluidos de la imagen
- `.env.example` - Template de variables de entorno
- `deploy.sh` - Script de despliegue automatizado

### Herramientas Utilizadas
- **VS Code** - Editor de código
- **Postman** - Pruebas de API
- **MongoDB Compass** - Visualización de base de datos
- **Git/GitHub** - Control de versiones
- **Docker Desktop** - Desarrollo local con contenedores
- **SSH** - Acceso remoto al servidor

### Enlaces Útiles
- Repositorio GitHub: [URL del repositorio]
- Aplicación en producción: http://189.194.68.7:8080
- MongoDB Atlas: https://cloud.mongodb.com/
- Documentación Docker: https://docs.docker.com/
- Documentación Express: https://expressjs.com/
- Documentación Mongoose: https://mongoosejs.com/

---

## 12. DECLARACIÓN

Declaro que el trabajo presentado es original y ha sido desarrollado por mí, aplicando los conocimientos adquiridos en el curso de Desarrollo Full Stack. El proyecto fue desplegado en un servidor dedicado con Docker, garantizando alta disponibilidad y funcionamiento 24/7.

**Firma:** _______________________

**Fecha:** [FECHA ACTUAL]

---

## ANEXOS

### Anexo A: Capturas de Pantalla

**Incluye capturas de:**
1. Página de login/registro funcionando
2. Dashboard con tareas creadas
3. Postman ejecutando endpoints exitosamente
4. MongoDB Atlas mostrando usuarios y tareas
5. Terminal mostrando contenedor Docker corriendo (`docker ps`)
6. Logs de la aplicación (`docker logs`)
7. Aplicación accesible desde navegador (con URL visible)

### Anexo B: Enlaces Importantes

**Repositorio y Código:**
- GitHub: [URL del repositorio]

**Aplicación Desplegada:**
- URL Principal: http://189.194.68.7:8080
- API Base: http://189.194.68.7:8080/api

**Recursos:**
- Video Demostrativo: [URL del video]
- MongoDB Atlas: https://cloud.mongodb.com/
- Documentación del Proyecto: Ver repositorio GitHub

### Anexo C: Comandos de Mantenimiento

**Verificar Estado:**
```bash
docker ps
docker logs proyecto-fullstack
curl http://localhost:8080/api
```

**Reiniciar Aplicación:**
```bash
docker-compose restart
```

**Actualizar Código:**
```bash
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

**Ver Métricas:**
```bash
docker stats proyecto-fullstack
```

---

**FIN DEL DOCUMENTO**

---

**NOTA IMPORTANTE:** Este proyecto está desplegado en producción en un servidor Ubuntu Linux con Docker, accesible 24/7 en la URL http://189.194.68.7:8080. El despliegue garantiza alta disponibilidad con reinicio automático y aislamiento de dependencias mediante contenedorización.
