const { GoogleGenerativeAI } = require('@google/generative-ai');
const Task = require('../models/Task');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function safeJsonParse(text) {
  try {
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(clean);
  } catch { return null; }
}

function normalizeAction(obj) {
  const action = (obj?.action || '').toLowerCase().trim();
  const allowed = new Set(['list', 'create', 'complete', 'edit', 'delete', 'summary', 'help', 'chat']);
  return allowed.has(action) ? action : 'help';
}

// Resuelve fechas naturales a YYYY-MM-DD
function resolveNaturalDate(str) {
  if (!str) return null;
  const s = str.toLowerCase().trim();
  const today = new Date();

  if (s === 'hoy') return today.toISOString().substring(0, 10);
  if (s === 'mañana') {
    const d = new Date(today); d.setDate(d.getDate() + 1);
    return d.toISOString().substring(0, 10);
  }
  if (s === 'pasado mañana') {
    const d = new Date(today); d.setDate(d.getDate() + 2);
    return d.toISOString().substring(0, 10);
  }

  const enDias = s.match(/en (\d+) d[ií]as?/);
  if (enDias) {
    const d = new Date(today); d.setDate(d.getDate() + parseInt(enDias[1]));
    return d.toISOString().substring(0, 10);
  }

  const enSemanas = s.match(/en (\d+) semanas?/);
  if (enSemanas) {
    const d = new Date(today); d.setDate(d.getDate() + parseInt(enSemanas[1]) * 7);
    return d.toISOString().substring(0, 10);
  }

  const diasSemana = { lunes: 1, martes: 2, miércoles: 3, miercoles: 3, jueves: 4, viernes: 5, sábado: 6, sabado: 6, domingo: 0 };
  for (const [nombre, num] of Object.entries(diasSemana)) {
    if (s.includes(nombre)) {
      const d = new Date(today);
      const diff = (num - d.getDay() + 7) % 7 || 7;
      d.setDate(d.getDate() + diff);
      return d.toISOString().substring(0, 10);
    }
  }

  if (s.includes('fin de semana') || s.includes('este fin')) {
    const d = new Date(today);
    const diff = (6 - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    return d.toISOString().substring(0, 10);
  }

  // Si ya es YYYY-MM-DD devolverlo tal cual
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  return null;
}

async function listTasksForUser(userId, filters = {}) {
  const all = await Task.find({ usuario_id: userId }, { populate: true });
  let tasks = all;
  if (filters.estado) tasks = tasks.filter(t => t.estado === filters.estado);
  if (filters.prioridad) tasks = tasks.filter(t => t.prioridad === filters.prioridad);
  if (filters.categoria) tasks = tasks.filter(t => t.categoria === filters.categoria);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    tasks = tasks.filter(t =>
      t.titulo.toLowerCase().includes(q) ||
      (t.descripcion || '').toLowerCase().includes(q)
    );
  }
  return tasks.slice(0, 20);
}

async function createTaskForUser(userId, data) {
  const titulo = String(data?.titulo || '').trim();
  if (!titulo) throw new Error('Necesito un título para la tarea');

  const fechaVencimiento = resolveNaturalDate(data?.fechaVencimiento);

  return Task.create({
    titulo,
    descripcion: data?.descripcion ? String(data.descripcion).trim() : '',
    estado: 'pendiente',
    prioridad: data?.prioridad || 'media',
    categoria: data?.categoria || 'otro',
    etiquetas: Array.isArray(data?.etiquetas) ? data.etiquetas.slice(0, 8) : [],
    fechaVencimiento,
    usuario_id: userId
  });
}

async function findTaskByIdOrTitle(userId, data) {
  const id = data?.id !== undefined ? Number(data.id) : null;
  const titulo = data?.titulo ? String(data.titulo).toLowerCase() : null;

  if (id) {
    const task = await Task.findById(id);
    if (!task) throw new Error(`No encontré tarea con id ${id}`);
    const ownerId = typeof task.usuario === 'object' ? task.usuario.id : task.usuario;
    if (Number(ownerId) !== Number(userId)) throw new Error('Esa tarea no te pertenece');
    return task;
  }

  if (titulo) {
    const tasks = await Task.find({ usuario_id: userId });
    const task = tasks.find(t => t.titulo.toLowerCase() === titulo)
      || tasks.find(t => t.titulo.toLowerCase().includes(titulo));
    if (!task) throw new Error(`No encontré tarea con título "${data.titulo}"`);
    return task;
  }

  throw new Error('Necesito el id o título de la tarea');
}

async function completeTaskForUser(userId, data) {
  const task = await findTaskByIdOrTitle(userId, data);
  return Task.findByIdAndUpdate(task.id, { estado: 'completada' });
}

async function editTaskForUser(userId, data) {
  const task = await findTaskByIdOrTitle(userId, data);

  const updates = {};
  if (data.titulo_nuevo) updates.titulo = data.titulo_nuevo;
  if (data.descripcion) updates.descripcion = data.descripcion;
  if (data.estado) updates.estado = data.estado;
  if (data.prioridad) updates.prioridad = data.prioridad;
  if (data.categoria) updates.categoria = data.categoria;
  if (data.fechaVencimiento) updates.fechaVencimiento = resolveNaturalDate(data.fechaVencimiento);

  if (Object.keys(updates).length === 0) throw new Error('No especificaste qué cambiar');

  return Task.findByIdAndUpdate(task.id, updates);
}

async function deleteTaskForUser(userId, data) {
  const task = await findTaskByIdOrTitle(userId, data);
  await Task.findByIdAndDelete(task.id);
  return { id: task.id, titulo: task.titulo };
}

async function summaryForUser(userId) {
  const all = await Task.find({ usuario_id: userId });
  const hoy = new Date();
  const hace7 = new Date(); hace7.setDate(hace7.getDate() - 7);
  const en7 = new Date(); en7.setDate(en7.getDate() + 7);

  const completadasEstaSemana = all.filter(t =>
    t.estado === 'completada' && new Date(t.updatedAt) >= hace7
  );
  const vencidas = all.filter(t =>
    t.fechaVencimiento && new Date(t.fechaVencimiento) < hoy && t.estado !== 'completada'
  );
  const porVencer = all.filter(t =>
    t.fechaVencimiento && new Date(t.fechaVencimiento) >= hoy &&
    new Date(t.fechaVencimiento) <= en7 && t.estado !== 'completada'
  );
  const pendientes = all.filter(t => t.estado === 'pendiente');
  const enProgreso = all.filter(t => t.estado === 'en_progreso');

  return {
    total: all.length,
    completadasEstaSemana: completadasEstaSemana.length,
    vencidas: vencidas.length,
    porVencer: porVencer.length,
    pendientes: pendientes.length,
    enProgreso: enProgreso.length,
    tareasVencidas: vencidas.slice(0, 5).map(t => ({ id: t.id, titulo: t.titulo, fechaVencimiento: t.fechaVencimiento })),
    tareasPorVencer: porVencer.slice(0, 5).map(t => ({ id: t.id, titulo: t.titulo, fechaVencimiento: t.fechaVencimiento }))
  };
}

async function decideIntent(message) {
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-3-flash-preview' });

  const hoy = new Date().toISOString().substring(0, 10);

  const prompt = `Eres un asistente para un gestor de tareas. Hoy es ${hoy}.
Devuelve SOLO JSON válido sin markdown ni texto extra.

Acciones disponibles: "list", "create", "complete", "edit", "delete", "summary", "help", "chat"

Esquemas:
list: {"action":"list","filters":{"estado":"pendiente|completada|en_progreso","prioridad":"baja|media|alta","categoria":"trabajo|estudio|personal|hogar|salud|otro","search":"texto"}}
create: {"action":"create","data":{"titulo":"...","descripcion":"...","prioridad":"baja|media|alta","categoria":"...","fechaVencimiento":"YYYY-MM-DD o texto natural como 'mañana','el viernes','en 3 días'"}}
complete: {"action":"complete","data":{"id":123}} o {"action":"complete","data":{"titulo":"..."}}
edit: {"action":"edit","data":{"id":123,"titulo_nuevo":"...","descripcion":"...","estado":"...","prioridad":"...","categoria":"...","fechaVencimiento":"..."}}
  o con título: {"action":"edit","data":{"titulo":"nombre actual","titulo_nuevo":"nuevo nombre","estado":"completada",...}}
delete: {"action":"delete","data":{"id":123}} o {"action":"delete","data":{"titulo":"..."}}
summary: {"action":"summary"}
help: {"action":"help"}

Reglas:
- "resumen", "cómo voy", "mi semana" → summary
- "borra", "elimina" → delete
- "cambia", "modifica", "actualiza", "pon", "mueve a" → edit
- Fechas naturales van en fechaVencimiento tal cual (ej: "mañana", "el viernes", "en 3 días")
- Si hay ambigüedad → help

Mensaje: "${message.replace(/"/g, "'")}"`;

  const result = await model.generateContent(prompt);
  return safeJsonParse(result.response.text()) || { action: 'help' };
}

async function craftFinalAnswer({ userMessage, action, toolResult, toolError }) {
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-3-flash-preview' });

  const prompt = `Eres el asistente de TaskFlow. Responde en español, breve y amigable. Usa emojis con moderación.

Reglas de formato:
- list: "- [id] título — estado (prioridad)" máx 10, si hay más di cuántas quedan
- create: confirma con "✅ Tarea creada: [id] título" y menciona fecha si la tiene
- complete: "✅ Completada: [id] título"
- edit: "✏️ Actualizada: [id] título — qué cambió"
- delete: "🗑️ Eliminada: título"
- summary: formato de resumen con secciones claras
- error: explica brevemente y da ejemplo correcto
- help: lista comandos de forma clara y concisa

Contexto:
mensaje="${userMessage}"
acción="${action}"
resultado=${JSON.stringify(toolResult)}
error="${toolError || ''}"`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

exports.handleChat = async ({ userId, message }) => {
  let intent = { action: 'help' };
  try {
    intent = await decideIntent(message);
  } catch (e) {
    console.error('Gemini intent error:', e.message);
  }

  const action = normalizeAction(intent);
  let toolResult = null;
  let toolError = null;

  try {
    switch (action) {
      case 'list':
        toolResult = await listTasksForUser(userId, intent.filters || {});
        break;
      case 'create':
        toolResult = await createTaskForUser(userId, intent.data || {});
        break;
      case 'complete':
        toolResult = await completeTaskForUser(userId, intent.data || {});
        break;
      case 'edit':
        toolResult = await editTaskForUser(userId, intent.data || {});
        break;
      case 'delete':
        toolResult = await deleteTaskForUser(userId, intent.data || {});
        break;
      case 'summary':
        toolResult = await summaryForUser(userId);
        break;
      default:
        toolResult = {
          help: [
            '"Lista mis tareas"',
            '"Lista mis pendientes de alta prioridad"',
            '"Crea tarea Estudiar para el viernes"',
            '"Completa la tarea Estudiar"',
            '"Edita la tarea 5, cambia prioridad a alta"',
            '"Elimina la tarea Estudiar"',
            '"Dame un resumen de mi semana"'
          ]
        };
    }
  } catch (e) {
    toolError = e.message;
  }

  let answer = '';
  try {
    answer = await craftFinalAnswer({ userMessage: message, action, toolResult, toolError });
  } catch (e) {
    answer = toolError || 'Ocurrió un error, intenta de nuevo.';
  }

  return { action, answer, data: toolError ? null : toolResult, error: toolError };
};
