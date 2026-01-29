# 🎥 GUÍA PARA CREAR EL VIDEO DEMOSTRATIVO

## 📋 Requisitos

- **Duración**: 5-10 minutos
- **Calidad**: HD (1080p mínimo)
- **Audio**: Claro y sin ruido
- **Herramientas sugeridas**: 
  - OBS Studio (gratis)
  - Loom (gratis)
  - Camtasia (pago)
  - Zoom (para grabación de pantalla)

---

## 🎬 Estructura del Video

### Introducción (30 segundos)
```
✓ Saludo
✓ Nombre del proyecto
✓ Propósito de la aplicación
✓ Tecnologías utilizadas
```

**Script sugerido**:
"Hola, mi nombre es [TU NOMBRE]. Les voy a mostrar mi proyecto Full Stack: un Sistema de Gestión de Tareas Educativas. Está desarrollado con Node.js, Express, MongoDB, y utiliza autenticación JWT. Vamos a ver cómo funciona."

---

### Parte 1: Demostración del Frontend (2-3 minutos)

#### 1. Página de Registro (30 segundos)
- Mostrar la URL: `http://localhost:3000/login.html`
- Hacer clic en "Registrarse"
- Explicar campos del formulario
- Registrar un usuario de prueba
- Mostrar mensaje de éxito

**Qué decir**:
"Primero, vemos la página de autenticación. Tiene dos opciones: iniciar sesión y registrarse. Voy a registrar un nuevo usuario. Como pueden ver, hay validación en los campos. Una vez registrado, soy automáticamente redirigido al dashboard."

#### 2. Dashboard Principal (30 segundos)
- Mostrar la interfaz
- Explicar las secciones:
  - Formulario de nueva tarea
  - Filtros
  - Lista de tareas
- Mostrar el nombre del usuario en la barra superior

**Qué decir**:
"Aquí está el dashboard principal. En la parte superior vemos mi nombre de usuario. Hay un formulario para crear tareas, botones de filtro para ver diferentes estados, y abajo la lista de todas las tareas."

#### 3. Crear Tarea (30 segundos)
- Llenar el formulario:
  - Título: "Estudiar para el examen"
  - Descripción: "Repasar capítulos 1-5 de JavaScript"
  - Estado: Pendiente
  - Prioridad: Alta
  - Fecha: Seleccionar una fecha
- Hacer clic en "Crear Tarea"
- Mostrar que aparece en la lista

**Qué decir**:
"Voy a crear una tarea nueva. Ingreso el título, descripción, selecciono el estado como pendiente, prioridad alta, y agrego una fecha de vencimiento. Al hacer clic en crear, la tarea aparece inmediatamente en la lista con todos los detalles."

#### 4. Filtros (30 segundos)
- Hacer clic en "Pendientes"
- Hacer clic en "Completadas"
- Hacer clic en "En Progreso"
- Volver a "Todas"

**Qué decir**:
"Puedo filtrar las tareas por estado. Aquí veo solo las pendientes, ahora las completadas, y aquí las que están en progreso. Es muy útil para organizar el trabajo."

#### 5. Editar Tarea (30 segundos)
- Hacer clic en "Editar" de una tarea
- Mostrar que el formulario se llena automáticamente
- Cambiar el estado a "En Progreso"
- Guardar cambios
- Mostrar que se actualiza en la lista

**Qué decir**:
"Para editar, hago clic en el botón de editar. El formulario se llena automáticamente con los datos. Voy a cambiar el estado a 'en progreso' y guardar. La tarea se actualiza inmediatamente."

#### 6. Eliminar Tarea (20 segundos)
- Hacer clic en "Eliminar"
- Mostrar la confirmación
- Confirmar
- Mostrar que desaparece de la lista

**Qué decir**:
"Para eliminar una tarea, hago clic en eliminar, confirmo la acción, y la tarea desaparece de la lista."

---

### Parte 2: Demostración del Backend con Postman (2-3 minutos)

#### 1. Abrir Postman (10 segundos)
- Mostrar la colección importada
- Explicar la estructura de endpoints

**Qué decir**:
"Ahora voy a demostrar cómo funciona el backend. Tengo una colección de Postman con todos los endpoints de la API."

#### 2. Registro de Usuario (30 segundos)
- Mostrar el endpoint: `POST /api/auth/registro`
- Mostrar el body con los datos
- Enviar la petición
- Mostrar la respuesta con el token

**Qué decir**:
"Este es el endpoint de registro. Envío el nombre, email y contraseña en formato JSON. La respuesta incluye el token JWT que se usará para autenticación."

#### 3. Login (30 segundos)
- Mostrar el endpoint: `POST /api/auth/login`
- Mostrar el body con credenciales
- Enviar la petición
- Mostrar el token en la respuesta
- Copiar el token

**Qué decir**:
"Para iniciar sesión, envío el email y contraseña. Obtengo un token que voy a usar para las siguientes peticiones."

#### 4. Obtener Perfil (30 segundos)
- Mostrar el endpoint: `GET /api/auth/perfil`
- Mostrar la pestaña Authorization con el token
- Enviar la petición
- Mostrar los datos del usuario

**Qué decir**:
"Este endpoint requiere autenticación. Envío el token en el header Authorization. La API verifica el token y devuelve mi perfil de usuario."

#### 5. Crear Tarea (30 segundos)
- Mostrar el endpoint: `POST /api/tareas`
- Mostrar el body con los datos de la tarea
- Enviar la petición
- Mostrar la tarea creada

**Qué decir**:
"Para crear una tarea, envío un POST con el título, descripción, estado y prioridad. Esta operación también requiere autenticación."

#### 6. Listar Tareas (20 segundos)
- Mostrar el endpoint: `GET /api/tareas`
- Enviar la petición
- Mostrar el array de tareas

**Qué decir**:
"Este endpoint no requiere autenticación y devuelve todas las tareas del sistema."

#### 7. Intentar sin Token (20 segundos)
- Quitar el token de Authorization
- Intentar crear una tarea
- Mostrar el error 401

**Qué decir**:
"Si intento crear una tarea sin token de autenticación, obtengo un error 401 Unauthorized. Así la API protege las operaciones sensibles."

---

### Parte 3: Mostrar el Código (1-2 minutos)

#### 1. Estructura del Proyecto (20 segundos)
- Abrir VS Code
- Mostrar la estructura de carpetas
- Explicar brevemente la organización

**Qué decir**:
"Este es el código del proyecto. Está organizado siguiendo el patrón MVC. En 'src' tenemos los modelos, controladores, rutas y middleware. En 'public' está el frontend."

#### 2. Modelo de Usuario (20 segundos)
- Abrir `src/models/User.js`
- Mostrar el esquema
- Señalar el middleware de encriptación

**Qué decir**:
"Este es el modelo de Usuario. Define la estructura de datos y aquí está el middleware que encripta la contraseña antes de guardarla."

#### 3. Autenticación JWT (20 segundos)
- Abrir `src/config/jwt.js`
- Mostrar la función de generar token
- Mostrar la función de verificar token

**Qué decir**:
"Aquí está la configuración de JWT. Esta función genera el token con el ID del usuario, y esta otra lo verifica."

#### 4. Middleware de Autenticación (20 segundos)
- Abrir `src/middleware/auth.js`
- Mostrar cómo verifica el token
- Mostrar cómo agrega el usuario al request

**Qué decir**:
"Este middleware intercepta las peticiones protegidas, verifica el token, busca el usuario en la base de datos, y lo agrega al request para que los controladores lo usen."

#### 5. Controlador de Tareas (20 segundos)
- Abrir `src/controllers/task.controller.js`
- Mostrar la función de crear tarea
- Mostrar cómo verifica la propiedad

**Qué decir**:
"En el controlador de tareas, aquí está la lógica para crear, actualizar y eliminar. Nota cómo verifica que el usuario sea el propietario antes de permitir editar o eliminar."

---

### Parte 4: Base de Datos (1 minuto)

#### 1. MongoDB Compass (o Atlas) (30 segundos)
- Abrir MongoDB Compass o Atlas
- Mostrar la base de datos
- Mostrar la colección de usuarios
- Mostrar la colección de tareas

**Qué decir**:
"Aquí está la base de datos MongoDB. Tenemos dos colecciones: usuarios y tareas. Pueden ver los documentos almacenados con toda su información."

#### 2. Ver un Usuario (15 segundos)
- Hacer clic en un usuario
- Mostrar que la contraseña está hasheada

**Qué decir**:
"Como pueden ver, las contraseñas están encriptadas con bcrypt, nunca se almacenan en texto plano."

#### 3. Ver una Tarea (15 segundos)
- Hacer clic en una tarea
- Mostrar la referencia al usuario

**Qué decir**:
"Cada tarea tiene una referencia al usuario que la creó, así mantenemos la relación entre las colecciones."

---

### Cierre (30 segundos)

**Qué decir**:
"En resumen, este proyecto implementa un sistema completo de gestión de tareas con:
- Backend robusto con Node.js y Express
- Autenticación segura con JWT
- Base de datos MongoDB
- Frontend moderno e interactivo
- Todas las operaciones CRUD funcionando

El código está disponible en GitHub y la documentación es completa. Gracias por ver el video."

---

## 🎯 Checklist de Grabación

Antes de grabar, asegúrate de:

- [ ] Tener datos de prueba en la base de datos
- [ ] El servidor esté corriendo sin errores
- [ ] Postman tenga la colección importada
- [ ] MongoDB Compass esté conectado
- [ ] VS Code esté abierto con el proyecto
- [ ] Cerrar aplicaciones innecesarias
- [ ] Limpiar el escritorio
- [ ] Configurar resolución en 1920x1080
- [ ] Probar el audio
- [ ] Preparar un script o guion

---

## 💡 Tips para una Buena Grabación

### Audio
- Usar micrófono si es posible
- Grabar en un lugar silencioso
- Hablar claro y a ritmo moderado
- No comer ni beber durante la grabación

### Video
- Usar modo pantalla completa cuando sea relevante
- No ir demasiado rápido
- Dar tiempo para que se vean las acciones
- Evitar movimientos bruscos del mouse

### Contenido
- Explicar qué estás haciendo
- Señalar los elementos importantes
- No asumir conocimiento previo
- Mantener el flujo narrativo

### Edición
- Cortar pausas largas
- Eliminar errores o intentos fallidos
- Agregar transiciones suaves
- Incluir título y créditos finales

---

## 🔧 Herramientas de Grabación

### OBS Studio (Recomendado - Gratis)
1. Descargar de https://obsproject.com/
2. Agregar fuente: Captura de Pantalla
3. Configurar audio de micrófono
4. Iniciar grabación

### Loom (Fácil de Usar - Gratis)
1. Instalar extensión de Chrome
2. Hacer clic en el ícono
3. Seleccionar "Screen + Cam"
4. Grabar y compartir

### Windows Game Bar (Windows 11)
1. Presionar Win + G
2. Hacer clic en "Capturar"
3. Iniciar grabación

---

## 📤 Subir el Video

### YouTube (Recomendado)
1. Subir como "No listado" o "Público"
2. Agregar título descriptivo
3. Agregar descripción con enlace a GitHub
4. Incluir timestamps en la descripción

### Google Drive
1. Subir el video
2. Obtener enlace para compartir
3. Configurar como "Cualquiera con el enlace"

### Loom
- Automáticamente genera enlace para compartir

---

## 📝 Descripción para el Video

```
🎯 Sistema de Gestión de Tareas Educativas - Proyecto Full Stack

📚 Tecnologías:
- Backend: Node.js, Express.js, MongoDB, JWT
- Frontend: HTML5, CSS3, JavaScript
- Seguridad: bcrypt, CORS, validaciones

⏰ Timestamps:
0:00 - Introducción
0:30 - Demo Frontend (Registro y Login)
1:30 - Gestión de Tareas (CRUD)
3:00 - Demo Backend (API con Postman)
5:00 - Código y Arquitectura
6:00 - Base de Datos MongoDB
6:30 - Conclusión

🔗 Código en GitHub: [TU_URL_AQUI]

#FullStack #NodeJS #MongoDB #JavaScript #WebDevelopment
```

---

## ✅ Lista Final

Después de grabar:
- [ ] Video grabado (5-10 minutos)
- [ ] Audio claro
- [ ] Todas las funcionalidades mostradas
- [ ] Video editado (opcional)
- [ ] Video subido a plataforma
- [ ] Enlace generado
- [ ] Enlace probado (funciona)
- [ ] Enlace agregado a la documentación

---

¡Buena suerte con tu video! 🎬
