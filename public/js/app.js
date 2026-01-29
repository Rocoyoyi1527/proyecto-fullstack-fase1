// Configuración de la API
const API_URL = 'http://localhost:3000/api';
let tareasGlobales = [];
let filtroActual = 'todas';

// Verificar autenticación al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacion();
    cargarTareas();
});

// Verificar si el usuario está autenticado
function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (!token || !usuario) {
        window.location.href = '/login.html';
        return;
    }

    // Mostrar nombre del usuario
    document.getElementById('usuario-nombre').textContent = `👋 Hola, ${usuario.nombre}`;
}

// Obtener token
function obtenerToken() {
    return localStorage.getItem('token');
}

// Mostrar mensaje
function mostrarMensaje(texto, tipo = 'success') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = texto;
    messageDiv.className = `message ${tipo}`;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login.html';
}

// Cargar tareas
async function cargarTareas() {
    const token = obtenerToken();
    const listaTareas = document.getElementById('lista-tareas');

    try {
        const response = await fetch(`${API_URL}/tareas`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            tareasGlobales = data.data.tareas;
            mostrarTareas(tareasGlobales);
        } else {
            listaTareas.innerHTML = '<p class="loading">Error al cargar las tareas</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        listaTareas.innerHTML = '<p class="loading">Error de conexión con el servidor</p>';
    }
}

// Mostrar tareas en el DOM
function mostrarTareas(tareas) {
    const listaTareas = document.getElementById('lista-tareas');

    if (tareas.length === 0) {
        listaTareas.innerHTML = '<p class="loading">No hay tareas para mostrar</p>';
        return;
    }

    listaTareas.innerHTML = tareas.map(tarea => `
        <div class="tarea-item ${tarea.estado}" data-id="${tarea._id}">
            <div class="tarea-header">
                <div>
                    <div class="tarea-titulo">${tarea.titulo}</div>
                    <div class="tarea-meta">
                        <span>👤 ${tarea.usuario.nombre}</span>
                        ${tarea.fechaVencimiento ? `<span>📅 ${formatearFecha(tarea.fechaVencimiento)}</span>` : ''}
                    </div>
                </div>
                <div class="tarea-badges">
                    <span class="badge badge-prioridad-${tarea.prioridad}">${tarea.prioridad}</span>
                    <span class="badge badge-estado">${formatearEstado(tarea.estado)}</span>
                </div>
            </div>
            <div class="tarea-descripcion">${tarea.descripcion}</div>
            ${esUsuarioPropietario(tarea) ? `
                <div class="tarea-acciones">
                    <button class="btn btn-small btn-editar" onclick="editarTarea('${tarea._id}')">✏️ Editar</button>
                    <button class="btn btn-small btn-eliminar" onclick="eliminarTarea('${tarea._id}')">🗑️ Eliminar</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Verificar si el usuario es propietario de la tarea
function esUsuarioPropietario(tarea) {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    return tarea.usuario._id === usuario.id;
}

// Formatear estado
function formatearEstado(estado) {
    const estados = {
        'pendiente': 'Pendiente',
        'en_progreso': 'En Progreso',
        'completada': 'Completada'
    };
    return estados[estado] || estado;
}

// Formatear fecha
function formatearFecha(fecha) {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Crear tarea
async function crearTarea(event) {
    event.preventDefault();

    const token = obtenerToken();
    const titulo = document.getElementById('titulo').value;
    const descripcion = document.getElementById('descripcion').value;
    const estado = document.getElementById('estado').value;
    const prioridad = document.getElementById('prioridad').value;
    const fechaVencimiento = document.getElementById('fechaVencimiento').value;

    const tareaData = {
        titulo,
        descripcion,
        estado,
        prioridad
    };

    if (fechaVencimiento) {
        tareaData.fechaVencimiento = fechaVencimiento;
    }

    try {
        const response = await fetch(`${API_URL}/tareas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(tareaData)
        });

        const data = await response.json();

        if (data.success) {
            mostrarMensaje('✅ Tarea creada exitosamente', 'success');
            document.getElementById('form-nueva-tarea').reset();
            cargarTareas();
        } else {
            const errorMsg = data.errors ? data.errors.join(', ') : data.message;
            mostrarMensaje(errorMsg, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error de conexión con el servidor', 'error');
    }
}

// Editar tarea (simplificado - puedes expandir con un modal)
async function editarTarea(id) {
    const tarea = tareasGlobales.find(t => t._id === id);
    if (!tarea) return;

    // Rellenar el formulario con los datos de la tarea
    document.getElementById('titulo').value = tarea.titulo;
    document.getElementById('descripcion').value = tarea.descripcion;
    document.getElementById('estado').value = tarea.estado;
    document.getElementById('prioridad').value = tarea.prioridad;
    
    if (tarea.fechaVencimiento) {
        const fecha = new Date(tarea.fechaVencimiento);
        document.getElementById('fechaVencimiento').value = fecha.toISOString().split('T')[0];
    }

    // Cambiar el comportamiento del formulario
    const form = document.getElementById('form-nueva-tarea');
    form.onsubmit = async (e) => {
        e.preventDefault();
        await actualizarTarea(id);
        form.onsubmit = crearTarea;
    };

    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
    mostrarMensaje('📝 Editando tarea. Modifica los campos y guarda los cambios.', 'success');
}

// Actualizar tarea
async function actualizarTarea(id) {
    const token = obtenerToken();
    const titulo = document.getElementById('titulo').value;
    const descripcion = document.getElementById('descripcion').value;
    const estado = document.getElementById('estado').value;
    const prioridad = document.getElementById('prioridad').value;
    const fechaVencimiento = document.getElementById('fechaVencimiento').value;

    const tareaData = {
        titulo,
        descripcion,
        estado,
        prioridad
    };

    if (fechaVencimiento) {
        tareaData.fechaVencimiento = fechaVencimiento;
    }

    try {
        const response = await fetch(`${API_URL}/tareas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(tareaData)
        });

        const data = await response.json();

        if (data.success) {
            mostrarMensaje('✅ Tarea actualizada exitosamente', 'success');
            document.getElementById('form-nueva-tarea').reset();
            cargarTareas();
        } else {
            const errorMsg = data.errors ? data.errors.join(', ') : data.message;
            mostrarMensaje(errorMsg, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error de conexión con el servidor', 'error');
    }
}

// Eliminar tarea
async function eliminarTarea(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
        return;
    }

    const token = obtenerToken();

    try {
        const response = await fetch(`${API_URL}/tareas/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            mostrarMensaje('🗑️ Tarea eliminada exitosamente', 'success');
            cargarTareas();
        } else {
            mostrarMensaje(data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error de conexión con el servidor', 'error');
    }
}

// Filtrar tareas
function filtrarTareas(filtro) {
    filtroActual = filtro;

    // Actualizar botones de filtro
    const botones = document.querySelectorAll('.btn-filter');
    botones.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Filtrar y mostrar tareas
    let tareasFiltradas = tareasGlobales;

    if (filtro !== 'todas') {
        tareasFiltradas = tareasGlobales.filter(tarea => tarea.estado === filtro);
    }

    mostrarTareas(tareasFiltradas);
}
