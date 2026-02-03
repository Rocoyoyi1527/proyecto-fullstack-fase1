// Configuración de la API
// Detecta automáticamente si estamos en producción o desarrollo
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api'
  : `${window.location.protocol}//${window.location.host}/api`;

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

// ==================== DASHBOARD CON GRÁFICAS ====================

// Variables para almacenar los gráficos
let chartEstado, chartPrioridad, chartPorDia, chartSemanal;

// Cargar estadísticas al iniciar
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        cargarEstadisticas();
    }, 1000); // Esperar 1 segundo después de cargar tareas
});

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
                        padding: 15,
                        font: {
                            size: 12
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
                        padding: 15,
                        font: {
                            size: 12
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
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
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
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
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
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
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
