// Configuración de la API
// Detecta automáticamente si estamos en producción o desarrollo
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api'
  : `${window.location.protocol}//${window.location.host}/api`;

let tareasGlobales = [];
let filtroEstadoActual = 'todas';
let filtroCategoriaActual = 'todas';

// Verificar autenticación al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacion();
    cargarTareas();
    setTimeout(() => {
        cargarEstadisticas();
    }, 1000);
    solicitarPermisoNotificaciones();
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
            aplicarFiltros();
        } else {
            listaTareas.innerHTML = '<p class="loading">Error al cargar las tareas</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        listaTareas.innerHTML = '<p class="loading">Error de conexión con el servidor</p>';
    }
}

// Obtener icono de categoría
function obtenerIconoCategoria(categoria) {
    const iconos = {
        'trabajo': '💼',
        'estudio': '📚',
        'personal': '👤',
        'hogar': '🏠',
        'salud': '💚',
        'otro': '📋'
    };
    return iconos[categoria] || '📋';
}

// Obtener nombre de categoría
function obtenerNombreCategoria(categoria) {
    const nombres = {
        'trabajo': 'Trabajo',
        'estudio': 'Estudio',
        'personal': 'Personal',
        'hogar': 'Hogar',
        'salud': 'Salud',
        'otro': 'Otro'
    };
    return nombres[categoria] || 'Otro';
}

// Mostrar tareas en el DOM
function mostrarTareas(tareas) {
    const listaTareas = document.getElementById('lista-tareas');

    if (tareas.length === 0) {
        listaTareas.innerHTML = '<p class="loading">No hay tareas para mostrar</p>';
        return;
    }

    listaTareas.innerHTML = tareas.map(tarea => {
        const fechaVencimiento = tarea.fechaVencimiento 
            ? new Date(tarea.fechaVencimiento).toLocaleDateString('es-ES')
            : 'Sin fecha';

        const badgeEstado = tarea.estado === 'pendiente' ? 'Pendiente' 
            : tarea.estado === 'en_progreso' ? 'En Progreso' 
            : 'Completada';

        const badgePrioridad = `badge-prioridad-${tarea.prioridad}`;

        // Etiquetas
        const etiquetasHTML = tarea.etiquetas && tarea.etiquetas.length > 0
            ? tarea.etiquetas.map(etiqueta => 
                `<span class="badge badge-etiqueta">#${etiqueta}</span>`
              ).join('')
            : '';

        return `
            <div class="tarea-item ${tarea.estado}">
                <div class="tarea-header">
                    <div>
                        <h3 class="tarea-titulo">${tarea.titulo}</h3>
                        <div class="tarea-badges">
                            <span class="badge ${badgePrioridad}">${tarea.prioridad.toUpperCase()}</span>
                            <span class="badge badge-estado">${badgeEstado}</span>
                            <span class="badge badge-categoria">${obtenerIconoCategoria(tarea.categoria)} ${obtenerNombreCategoria(tarea.categoria)}</span>
                            ${etiquetasHTML}
                        </div>
                    </div>
                </div>
                <p class="tarea-descripcion">${tarea.descripcion}</p>
                <div class="tarea-meta">
                    <span>📅 Vence: ${fechaVencimiento}</span>
                    <span>👤 ${tarea.usuario.nombre}</span>
                </div>
                <div class="tarea-acciones">
                    <button onclick="editarTarea('${tarea._id}')" class="btn btn-small btn-editar">✏️ Editar</button>
                    <button onclick="eliminarTarea('${tarea._id}')" class="btn btn-small btn-eliminar">🗑️ Eliminar</button>
                </div>
            </div>
        `;
    }).join('');
}

// Crear nueva tarea
async function crearTarea(event) {
    event.preventDefault();

    const token = obtenerToken();
    const titulo = document.getElementById('titulo').value;
    const descripcion = document.getElementById('descripcion').value;
    const estado = document.getElementById('estado').value;
    const prioridad = document.getElementById('prioridad').value;
    const categoria = document.getElementById('categoria').value;
    const fechaVencimiento = document.getElementById('fechaVencimiento').value;
    const etiquetasInput = document.getElementById('etiquetas').value;

    // Procesar etiquetas
    const etiquetas = etiquetasInput
        ? etiquetasInput.split(',').map(e => e.trim()).filter(e => e.length > 0)
        : [];

    const tareaData = {
        titulo,
        descripcion,
        estado,
        prioridad,
        categoria,
        etiquetas
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
            enviarNotificacion('✅ Tarea Creada', `"${titulo}" fue creada exitosamente`);
            document.getElementById('form-nueva-tarea').reset();
            cerrarModalTarea();
            cargarTareas();
            cargarEstadisticas(); // Actualizar estadísticas
        } else {
            const errorMsg = data.errors ? data.errors.join(', ') : data.message;
            mostrarMensaje(errorMsg, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error de conexión con el servidor', 'error');
    }
}

// Editar tarea
async function editarTarea(id) {
    const tarea = tareasGlobales.find(t => t._id === id);
    
    if (!tarea) {
        mostrarMensaje('Tarea no encontrada', 'error');
        return;
    }

    // Abrir modal
    const modal = document.getElementById('modalTarea');
    const modalTitulo = document.getElementById('modal-titulo');
    const btnSubmit = document.getElementById('btn-submit-tarea');

    // Llenar el formulario con los datos de la tarea
    document.getElementById('titulo').value = tarea.titulo;
    document.getElementById('descripcion').value = tarea.descripcion;
    document.getElementById('estado').value = tarea.estado;
    document.getElementById('prioridad').value = tarea.prioridad;
    document.getElementById('categoria').value = tarea.categoria || 'otro';
    document.getElementById('etiquetas').value = tarea.etiquetas ? tarea.etiquetas.join(', ') : '';
    
    if (tarea.fechaVencimiento) {
        const fecha = new Date(tarea.fechaVencimiento).toISOString().split('T')[0];
        document.getElementById('fechaVencimiento').value = fecha;
    }

    // Configurar modal para edición
    modalTitulo.textContent = '✏️ Editar Tarea';
    btnSubmit.textContent = 'Guardar Cambios';

    // Cambiar el comportamiento del formulario
    const form = document.getElementById('form-nueva-tarea');
    form.onsubmit = async (e) => {
        e.preventDefault();
        await actualizarTarea(id);
        cerrarModalTarea();
        form.onsubmit = crearTarea; // Volver al comportamiento original
    };

    // Mostrar modal
    modal.classList.add('show');
}

// Actualizar tarea
async function actualizarTarea(id) {
    const token = obtenerToken();
    const titulo = document.getElementById('titulo').value;
    const descripcion = document.getElementById('descripcion').value;
    const estado = document.getElementById('estado').value;
    const prioridad = document.getElementById('prioridad').value;
    const categoria = document.getElementById('categoria').value;
    const fechaVencimiento = document.getElementById('fechaVencimiento').value;
    const etiquetasInput = document.getElementById('etiquetas').value;

    // Procesar etiquetas
    const etiquetas = etiquetasInput
        ? etiquetasInput.split(',').map(e => e.trim()).filter(e => e.length > 0)
        : [];

    const tareaData = {
        titulo,
        descripcion,
        estado,
        prioridad,
        categoria,
        etiquetas
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
            enviarNotificacion('✏️ Tarea Actualizada', `"${titulo}" fue actualizada`);
            document.getElementById('form-nueva-tarea').reset();
            cargarTareas();
            cargarEstadisticas(); // Actualizar estadísticas
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
            enviarNotificacion('🗑️ Tarea Eliminada', 'La tarea fue eliminada correctamente');
            cargarTareas();
            cargarEstadisticas(); // Actualizar estadísticas
        } else {
            mostrarMensaje(data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error de conexión con el servidor', 'error');
    }
}

// Filtrar por estado
function filtrarPorEstado(estado) {
    filtroEstadoActual = estado;

    // Actualizar botones de filtro de estado
    const botones = document.querySelectorAll('[data-filtro-tipo="estado"]');
    botones.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    aplicarFiltros();
}

// Filtrar por categoría
function filtrarPorCategoria(categoria) {
    filtroCategoriaActual = categoria;

    // Actualizar botones de filtro de categoría
    const botones = document.querySelectorAll('[data-filtro-tipo="categoria"]');
    botones.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    aplicarFiltros();
}

// Aplicar todos los filtros
function aplicarFiltros() {
    let tareasFiltradas = tareasGlobales;

    // Filtrar por estado
    if (filtroEstadoActual !== 'todas') {
        tareasFiltradas = tareasFiltradas.filter(tarea => tarea.estado === filtroEstadoActual);
    }

    // Filtrar por categoría
    if (filtroCategoriaActual !== 'todas') {
        tareasFiltradas = tareasFiltradas.filter(tarea => tarea.categoria === filtroCategoriaActual);
    }

    mostrarTareas(tareasFiltradas);
}

// ==================== DASHBOARD CON GRÁFICAS ====================

// Variables para almacenar los gráficos
let chartEstado, chartPrioridad, chartPorDia, chartSemanal;

// Cargar estadísticas desde el backend
async function cargarEstadisticas() {
    const token = obtenerToken();

    try {
        const response = await fetch(`${API_URL}/tareas/estadisticas/resumen`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            actualizarTarjetasEstadisticas(data.data.resumen);
            generarGraficos(data.data);
            mostrarAlertas(data.data.resumen);
        }
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

// Actualizar tarjetas de estadísticas rápidas
function actualizarTarjetasEstadisticas(resumen) {
    document.getElementById('stat-total').textContent = resumen.total;
    document.getElementById('stat-completadas').textContent = resumen.completadas;
    document.getElementById('stat-pendientes').textContent = resumen.pendientes;
    document.getElementById('stat-tasa').textContent = `${resumen.tasaCompletado}%`;
}

// Generar todos los gráficos
function generarGraficos(data) {
    generarGraficoEstado(data.porEstado);
    generarGraficoPrioridad(data.porPrioridad);
    generarGraficoPorDia(data.porDiaSemana);
    generarGraficoSemanal(data.tareasCompletadasPorSemana);
}

// Gráfico de Estado (Dona)
function generarGraficoEstado(porEstado) {
    const ctx = document.getElementById('chartEstado');
    
    // Destruir gráfico anterior si existe
    if (chartEstado) {
        chartEstado.destroy();
    }

    chartEstado = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pendientes', 'En Progreso', 'Completadas'],
            datasets: [{
                data: [
                    porEstado.pendiente,
                    porEstado.en_progreso,
                    porEstado.completada
                ],
                backgroundColor: [
                    '#f59e0b', // Amarillo (warning)
                    '#6366f1', // Azul (primary)
                    '#10b981'  // Verde (success)
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 10,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Gráfico de Prioridad (Dona)
function generarGraficoPrioridad(porPrioridad) {
    const ctx = document.getElementById('chartPrioridad');
    
    // Destruir gráfico anterior si existe
    if (chartPrioridad) {
        chartPrioridad.destroy();
    }

    chartPrioridad = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Baja', 'Media', 'Alta'],
            datasets: [{
                data: [
                    porPrioridad.baja,
                    porPrioridad.media,
                    porPrioridad.alta
                ],
                backgroundColor: [
                    '#3b82f6', // Azul
                    '#f59e0b', // Amarillo
                    '#ef4444'  // Rojo
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 10,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Gráfico por Día de la Semana (Barras)
function generarGraficoPorDia(porDiaSemana) {
    const ctx = document.getElementById('chartPorDia');
    
    // Destruir gráfico anterior si existe
    if (chartPorDia) {
        chartPorDia.destroy();
    }

    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const valores = dias.map(dia => porDiaSemana[dia]);

    chartPorDia = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dias,
            datasets: [{
                label: 'Tareas Creadas',
                data: valores,
                backgroundColor: '#6366f1',
                borderColor: '#4f46e5',
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 10
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Tareas: ${context.parsed.y}`;
                        }
                    }
                }
            }
        }
    });
}

// Gráfico Semanal (Líneas)
function generarGraficoSemanal(tareasCompletadasPorSemana) {
    const ctx = document.getElementById('chartSemanal');
    
    // Destruir gráfico anterior si existe
    if (chartSemanal) {
        chartSemanal.destroy();
    }

    const semanas = tareasCompletadasPorSemana.map(item => item.semana);
    const completadas = tareasCompletadasPorSemana.map(item => item.completadas);

    chartSemanal = new Chart(ctx, {
        type: 'line',
        data: {
            labels: semanas,
            datasets: [{
                label: 'Tareas Completadas',
                data: completadas,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 10
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Completadas: ${context.parsed.y}`;
                        }
                    }
                }
            }
        }
    });
}

// Mostrar alertas
function mostrarAlertas(resumen) {
    // Alerta de tareas vencidas
    const alertVencidas = document.getElementById('alert-vencidas');
    if (resumen.vencidas > 0) {
        alertVencidas.style.display = 'flex';
        alertVencidas.querySelector('.alert-text').textContent = 
            `Tienes ${resumen.vencidas} tarea${resumen.vencidas > 1 ? 's' : ''} vencida${resumen.vencidas > 1 ? 's' : ''}. ¡Revisa tu lista!`;
        
        // Enviar notificación
        enviarNotificacion('⚠️ Tareas Vencidas', 
            `Tienes ${resumen.vencidas} tarea${resumen.vencidas > 1 ? 's' : ''} vencida${resumen.vencidas > 1 ? 's' : ''}`);
    } else {
        alertVencidas.style.display = 'none';
    }

    // Alerta de tareas por vencer
    const alertPorVencer = document.getElementById('alert-por-vencer');
    if (resumen.porVencer > 0) {
        alertPorVencer.style.display = 'flex';
        alertPorVencer.querySelector('.alert-text').textContent = 
            `${resumen.porVencer} tarea${resumen.porVencer > 1 ? 's' : ''} vencerá${resumen.porVencer > 1 ? 'n' : ''} en los próximos 7 días.`;
    } else {
        alertPorVencer.style.display = 'none';
    }
}

// ==================== MODAL ====================

// Abrir modal para crear tarea
function abrirModalTarea() {
    const modal = document.getElementById('modalTarea');
    const modalTitulo = document.getElementById('modal-titulo');
    const btnSubmit = document.getElementById('btn-submit-tarea');
    
    // Limpiar formulario
    document.getElementById('form-nueva-tarea').reset();
    
    // Configurar para crear
    modalTitulo.textContent = '➕ Nueva Tarea';
    btnSubmit.textContent = 'Crear Tarea';
    
    // Restaurar comportamiento original del formulario
    const form = document.getElementById('form-nueva-tarea');
    form.onsubmit = crearTarea;
    
    // Mostrar modal
    modal.classList.add('show');
}

// Cerrar modal
function cerrarModalTarea() {
    const modal = document.getElementById('modalTarea');
    modal.classList.remove('show');
}

// Cerrar modal al hacer click fuera
window.onclick = function(event) {
    const modal = document.getElementById('modalTarea');
    if (event.target === modal) {
        cerrarModalTarea();
    }
}

// ==================== NOTIFICACIONES ====================

// Solicitar permiso para notificaciones
function solicitarPermisoNotificaciones() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('✅ Notificaciones habilitadas');
                mostrarMensaje('🔔 Notificaciones habilitadas correctamente', 'success');
            }
        });
    }
}

// Enviar notificación
function enviarNotificacion(titulo, mensaje, icono = '📋') {
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(titulo, {
            body: mensaje,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">' + icono + '</text></svg>',
            badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📋</text></svg>',
            tag: 'tarea-notification',
            requireInteraction: false,
            silent: false
        });

        notification.onclick = function() {
            window.focus();
            notification.close();
        };

        // Auto-cerrar después de 5 segundos
        setTimeout(() => {
            notification.close();
        }, 5000);
    }
}
