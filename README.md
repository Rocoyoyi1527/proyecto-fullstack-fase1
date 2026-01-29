# 📚 Proyecto Full Stack - Gestor de Tareas Educativas

## 🎯 Descripción del Proyecto

Aplicación web Full Stack para gestión de tareas educativas con sistema de autenticación JWT. Permite a los usuarios registrarse, iniciar sesión y administrar sus tareas de manera eficiente con operaciones CRUD completas.

## 🚀 Características Principales

- ✅ Sistema de autenticación con JWT
- ✅ Registro e inicio de sesión de usuarios
- ✅ Operaciones CRUD completas para tareas
- ✅ Interfaz moderna y responsiva
- ✅ Filtrado de tareas por estado
- ✅ Validación de datos en frontend y backend
- ✅ Manejo centralizado de errores
- ✅ Protección de rutas con middleware
- ✅ Diseño UI/UX profesional

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación basada en tokens
- **bcryptjs** - Encriptación de contraseñas
- **dotenv** - Gestión de variables de entorno
- **CORS** - Manejo de políticas de origen cruzado

### Frontend
- **HTML5** - Estructura
- **CSS3** - Estilos y animaciones
- **JavaScript (Vanilla)** - Interactividad y manejo del DOM

## 📁 Estructura del Proyecto

```
AvanceProyectoFULLSTACK/
│
├── src/
│   ├── config/
│   │   ├── database.js          # Configuración de MongoDB
│   │   └── jwt.js               # Utilidades JWT
│   │
│   ├── middleware/
│   │   ├── auth.js              # Middleware de autenticación
│   │   ├── errorHandler.js     # Manejo de errores
│   │   └── validation.js        # Validación de datos
│   │
│   ├── models/
│   │   ├── User.js              # Modelo de Usuario
│   │   └── Task.js              # Modelo de Tarea
│   │
│   ├── controllers/
│   │   ├── auth.controller.js   # Controlador de autenticación
│   │   └── task.controller.js   # Controlador de tareas
│   │
│   └── routes/
│       ├── auth.routes.js       # Rutas de autenticación
│       └── task.routes.js       # Rutas de tareas
│
├── public/
│   ├── css/
│   │   └── styles.css           # Estilos de la aplicación
│   ├── js/
│   │   ├── auth.js              # Lógica de autenticación
│   │   └── app.js               # Lógica principal
│   ├── index.html               # Página principal
│   └── login.html               # Página de login/registro
│
├── server.js                    # Punto de entrada
├── package.json                 # Dependencias
├── .env.example                 # Ejemplo de variables de entorno
├── .gitignore                   # Archivos a ignorar
└── README.md                    # Este archivo
```

## 🔧 Instalación y Configuración

### Prerrequisitos

- Node.js (v14 o superior)
- MongoDB (local o MongoDB Atlas)
- npm o yarn
- Postman (para pruebas de API)

### Pasos de Instalación

1. **Clonar el repositorio** (o navegar a la carpeta)
```bash
cd C:\Users\R-Cou\Escritorio\CLAUDE COSAS\AvanceProyectoFULLSTACK
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear un archivo `.env` basado en `.env.example`:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/proyecto_fullstack
JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000
```

4. **Iniciar MongoDB**

Si usas MongoDB local:
```bash
mongod
```

O configura MongoDB Atlas y actualiza el `MONGODB_URI`.

5. **Iniciar el servidor**

Desarrollo (con nodemon):
```bash
npm run dev
```

Producción:
```bash
npm start
```

6. **Acceder a la aplicación**
- Frontend: http://localhost:3000
- API: http://localhost:3000/api

## 📡 API Endpoints

### Autenticación

#### Registro de Usuario
```http
POST /api/auth/registro
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "123456"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "usuario": {
      "id": "...",
      "nombre": "Juan Pérez",
      "email": "juan@example.com",
      "rol": "usuario"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Inicio de Sesión
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "123456"
}
```

#### Obtener Perfil (Ruta Protegida)
```http
GET /api/auth/perfil
Authorization: Bearer {token}
```

### Tareas

#### Obtener Todas las Tareas (Pública)
```http
GET /api/tareas
```

#### Obtener Tarea por ID (Pública)
```http
GET /api/tareas/:id
```

#### Obtener Mis Tareas (Protegida)
```http
GET /api/tareas/mis-tareas/todas
Authorization: Bearer {token}
```

#### Crear Tarea (Protegida)
```http
POST /api/tareas
Authorization: Bearer {token}
Content-Type: application/json

{
  "titulo": "Estudiar Node.js",
  "descripcion": "Completar el módulo de Express",
  "estado": "pendiente",
  "prioridad": "alta",
  "fechaVencimiento": "2025-02-15"
}
```

#### Actualizar Tarea (Protegida)
```http
PUT /api/tareas/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "titulo": "Estudiar Node.js Avanzado",
  "descripcion": "Completar módulos de Express y MongoDB",
  "estado": "en_progreso",
  "prioridad": "alta"
}
```

#### Eliminar Tarea (Protegida)
```http
DELETE /api/tareas/:id
Authorization: Bearer {token}
```

## 🎨 Diseño UI/UX

### Principios Aplicados

1. **Jerarquía Visual**: Títulos prominentes y contenido organizado
2. **Espaciado Consistente**: Uso de espacios en blanco para mejorar legibilidad
3. **Paleta de Colores**: 
   - Primario: #6366f1 (Índigo)
   - Éxito: #10b981 (Verde)
   - Advertencia: #f59e0b (Ámbar)
   - Peligro: #ef4444 (Rojo)
4. **Tipografía**: Sistema de fuentes sans-serif moderno
5. **Interactividad**: Animaciones suaves y feedback visual
6. **Responsive Design**: Adaptable a dispositivos móviles

### Características de Diseño

- Gradientes modernos en el fondo
- Cards con sombras suaves
- Botones con efectos hover
- Animaciones de entrada (fadeIn, slideDown)
- Badges de estado con colores semánticos
- Sistema de mensajes con animaciones

## 🔒 Seguridad

- Contraseñas encriptadas con bcrypt (salt rounds: 10)
- Tokens JWT con expiración configurable
- Validación de datos en backend y frontend
- Protección de rutas sensibles con middleware
- Variables de entorno para datos sensibles
- Sanitización de entradas

## ✅ Validaciones Implementadas

### Backend
- Email válido y único
- Contraseña mínima de 6 caracteres
- Título de tarea: máximo 100 caracteres
- Descripción: máximo 500 caracteres
- Estados y prioridades con enum

### Frontend
- Campos requeridos
- Validación de formato de email
- Longitud mínima de contraseña
- Límites de caracteres en campos de texto

## 🧪 Pruebas con Postman

### Colección de Pruebas

1. **Registro**: POST /api/auth/registro
2. **Login**: POST /api/auth/login (guardar token)
3. **Perfil**: GET /api/auth/perfil (usar token)
4. **Crear Tarea**: POST /api/tareas (usar token)
5. **Listar Tareas**: GET /api/tareas
6. **Actualizar Tarea**: PUT /api/tareas/:id (usar token)
7. **Eliminar Tarea**: DELETE /api/tareas/:id (usar token)

## 🚀 Despliegue

### Opciones de Despliegue

#### Backend
- **Render**: https://render.com
- **Heroku**: https://heroku.com
- **Railway**: https://railway.app
- **AWS EC2**: Amazon Web Services

#### Base de Datos
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas

#### Frontend (Opcional)
- **Vercel**: https://vercel.com
- **Netlify**: https://netlify.com

### Pasos para Desplegar en Render

1. Crear cuenta en Render
2. Crear nuevo Web Service
3. Conectar repositorio de GitHub
4. Configurar:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Agregar variables de entorno
6. Desplegar

## 📝 Uso de la Aplicación

### Registro e Inicio de Sesión

1. Acceder a http://localhost:3000/login.html
2. Cambiar a la pestaña "Registrarse"
3. Completar el formulario con nombre, email y contraseña
4. Hacer clic en "Registrarse"
5. Serás redirigido automáticamente al panel principal

### Gestión de Tareas

1. **Crear Tarea**: Completar el formulario en la parte superior
2. **Ver Tareas**: Se muestran todas las tareas en la lista
3. **Filtrar**: Usar los botones de filtro (Todas, Pendientes, etc.)
4. **Editar**: Hacer clic en "Editar" en tu propia tarea
5. **Eliminar**: Hacer clic en "Eliminar" y confirmar

## 🐛 Solución de Problemas

### Error: MongoDB no se conecta
- Verificar que MongoDB esté corriendo
- Revisar la URI de conexión en `.env`
- Verificar conectividad de red (si usas MongoDB Atlas)

### Error: Token inválido
- Verificar que el token esté en el header Authorization
- Formato: `Bearer {token}`
- El token expira según JWT_EXPIRES_IN

### Error: CORS
- Verificar CORS_ORIGIN en `.env`
- Asegurarse de que el frontend y backend estén en el mismo dominio o configurar CORS correctamente

## 📚 Recursos y Referencias

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [MDN Web Docs](https://developer.mozilla.org/)

## 👥 Autor

Desarrollado como parte del reto de desarrollo Full Stack

## 📄 Licencia

MIT License - Libre para uso educativo y personal

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abrir un Pull Request

---

**Nota**: Este proyecto fue desarrollado con fines educativos como parte de un reto de desarrollo Full Stack, cumpliendo con todos los requerimientos especificados en la primera fase del proyecto.
