/**
 * Script para inicializar la base de datos con datos de prueba
 * Ejecutar: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Task = require('./src/models/Task');

// Datos de usuarios de prueba
const usuariosPrueba = [
  {
    nombre: 'Juan Pérez',
    email: 'juan@example.com',
    password: '123456',
    rol: 'usuario'
  },
  {
    nombre: 'María García',
    email: 'maria@example.com',
    password: '123456',
    rol: 'usuario'
  },
  {
    nombre: 'Admin Sistema',
    email: 'admin@example.com',
    password: '123456',
    rol: 'admin'
  }
];

// Datos de tareas de prueba
const tareasPrueba = [
  {
    titulo: 'Estudiar JavaScript Avanzado',
    descripcion: 'Completar módulos de async/await, promesas y manejo de errores',
    estado: 'en_progreso',
    prioridad: 'alta',
    fechaVencimiento: new Date('2025-02-15')
  },
  {
    titulo: 'Proyecto de React',
    descripcion: 'Crear una aplicación web con React y Redux',
    estado: 'pendiente',
    prioridad: 'alta',
    fechaVencimiento: new Date('2025-03-01')
  },
  {
    titulo: 'Aprender MongoDB',
    descripcion: 'Estudiar operaciones CRUD, agregación y modelado de datos',
    estado: 'completada',
    prioridad: 'media',
    fechaVencimiento: new Date('2025-01-20')
  },
  {
    titulo: 'Preparar presentación',
    descripcion: 'Crear slides para la presentación del proyecto final',
    estado: 'pendiente',
    prioridad: 'baja',
    fechaVencimiento: new Date('2025-02-28')
  },
  {
    titulo: 'Revisar código del equipo',
    descripcion: 'Hacer code review de los pull requests pendientes',
    estado: 'en_progreso',
    prioridad: 'media'
  }
];

// Función para limpiar la base de datos
const limpiarDB = async () => {
  try {
    await User.deleteMany({});
    await Task.deleteMany({});
    console.log('✅ Base de datos limpiada');
  } catch (error) {
    console.error('❌ Error al limpiar la base de datos:', error);
    throw error;
  }
};

// Función para crear usuarios
const crearUsuarios = async () => {
  try {
    const usuarios = await User.create(usuariosPrueba);
    console.log(`✅ ${usuarios.length} usuarios creados`);
    return usuarios;
  } catch (error) {
    console.error('❌ Error al crear usuarios:', error);
    throw error;
  }
};

// Función para crear tareas
const crearTareas = async (usuarios) => {
  try {
    // Asignar tareas a diferentes usuarios
    const tareasConUsuarios = tareasPrueba.map((tarea, index) => ({
      ...tarea,
      usuario: usuarios[index % usuarios.length]._id
    }));

    const tareas = await Task.create(tareasConUsuarios);
    console.log(`✅ ${tareas.length} tareas creadas`);
    return tareas;
  } catch (error) {
    console.error('❌ Error al crear tareas:', error);
    throw error;
  }
};

// Función principal
const inicializarDB = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔌 Conectado a MongoDB');

    // Limpiar base de datos
    await limpiarDB();

    // Crear usuarios
    const usuarios = await crearUsuarios();

    // Crear tareas
    await crearTareas(usuarios);

    console.log('\n🎉 ¡Base de datos inicializada exitosamente!\n');
    console.log('📋 Usuarios de prueba:');
    usuarios.forEach(usuario => {
      console.log(`   - ${usuario.email} (${usuario.rol})`);
    });
    console.log('\n🔑 Contraseña para todos: 123456\n');

    // Desconectar
    await mongoose.connection.close();
    console.log('👋 Desconectado de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fatal:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Ejecutar script
if (require.main === module) {
  console.log('🚀 Iniciando script de inicialización...\n');
  inicializarDB();
}

module.exports = { inicializarDB };
