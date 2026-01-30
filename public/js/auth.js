// Configuración de la API
// Detecta automáticamente si estamos en producción o desarrollo
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api'
  : `${window.location.protocol}//${window.location.host}/api`;

// Cambiar entre tabs de login y registro
function mostrarTab(tab) {
    const loginForm = document.getElementById('login-form');
    const registroForm = document.getElementById('registro-form');
    const tabButtons = document.querySelectorAll('.tab-button');

    if (tab === 'login') {
        loginForm.classList.add('active');
        registroForm.classList.remove('active');
        tabButtons[0].classList.add('active');
        tabButtons[1].classList.remove('active');
    } else {
        registroForm.classList.add('active');
        loginForm.classList.remove('active');
        tabButtons[1].classList.add('active');
        tabButtons[0].classList.remove('active');
    }

    // Limpiar mensajes
    ocultarMensaje();
}

// Mostrar mensaje
function mostrarMensaje(texto, tipo = 'success') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = texto;
    messageDiv.className = `message ${tipo}`;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        ocultarMensaje();
    }, 5000);
}

// Ocultar mensaje
function ocultarMensaje() {
    const messageDiv = document.getElementById('message');
    messageDiv.style.display = 'none';
}

// Iniciar sesión
async function iniciarSesion(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            // Guardar token y datos del usuario
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('usuario', JSON.stringify(data.data.usuario));

            mostrarMensaje('¡Inicio de sesión exitoso! Redirigiendo...', 'success');

            // Redirigir al panel principal
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1500);
        } else {
            mostrarMensaje(data.message || 'Error al iniciar sesión', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error de conexión con el servidor', 'error');
    }
}

// Registrar usuario
async function registrarUsuario(event) {
    event.preventDefault();

    const nombre = document.getElementById('registro-nombre').value;
    const email = document.getElementById('registro-email').value;
    const password = document.getElementById('registro-password').value;

    try {
        const response = await fetch(`${API_URL}/auth/registro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, email, password })
        });

        const data = await response.json();

        if (data.success) {
            // Guardar token y datos del usuario
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('usuario', JSON.stringify(data.data.usuario));

            mostrarMensaje('¡Registro exitoso! Redirigiendo...', 'success');

            // Redirigir al panel principal
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1500);
        } else {
            const errorMsg = data.errors ? data.errors.join(', ') : data.message;
            mostrarMensaje(errorMsg || 'Error al registrar usuario', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error de conexión con el servidor', 'error');
    }
}

// Verificar si ya está autenticado
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token && window.location.pathname.includes('login.html')) {
        window.location.href = '/index.html';
    }
});
