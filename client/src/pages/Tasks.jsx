import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Button, Card, CardContent, CardActions,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Chip, IconButton, CircularProgress, Alert, Grid,
  Menu, MenuItem as MI, Snackbar, Divider, Avatar,
  List, ListItem, ListItemText, ListItemAvatar,
  Checkbox, LinearProgress, Collapse, Tooltip
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ShareIcon from '@mui/icons-material/Share'
import CommentIcon from '@mui/icons-material/Comment'
import SendIcon from '@mui/icons-material/Send'
import ChecklistIcon from '@mui/icons-material/Checklist'
import GroupIcon from '@mui/icons-material/Group'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import api from '../api/axios'

const ESTADO_COLOR = { pendiente: 'warning', en_progreso: 'info', completada: 'success' }
const PRIORIDAD_COLOR = { baja: 'success', media: 'warning', alta: 'error' }

const emptyForm = {
  titulo: '', descripcion: '', estado: 'pendiente',
  prioridad: 'media', categoria: 'otro', fechaVencimiento: ''
}

export default function Tasks() {
  const [tareas, setTareas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Dialogs
  const [dialogOpen, setDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [commentDialogOpen, setCommentDialogOpen] = useState(false)

  // Form state
  const [editTarea, setEditTarea] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  // Share
  const [shareTarea, setShareTarea] = useState(null)
  const [shareEmail, setShareEmail] = useState('')

  // Comments
  const [commentTarea, setCommentTarea] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')

  // Menu
  const [anchorEl, setAnchorEl] = useState(null)
  const [menuTarea, setMenuTarea] = useState(null)

  // Subtasks - expanded cards and local data
  const [expandedCards, setExpandedCards] = useState({})
  const [subtasksData, setSubtasksData] = useState({}) // { taskId: [subtask] }
  const [newSubtask, setNewSubtask] = useState({}) // { taskId: 'texto' }

  const fetchTareas = useCallback(async () => {
    try {
      const { data } = await api.get('/tareas/mis-tareas/todas')
      setTareas(data.data.tareas)
    } catch {
      setError('Error al cargar tareas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTareas() }, [fetchTareas])

  useEffect(() => {
    const handler = () => fetchTareas()
    window.addEventListener('chatbot:tasks-updated', handler)
    return () => window.removeEventListener('chatbot:tasks-updated', handler)
  }, [fetchTareas])

  const toggleExpand = async (taskId) => {
    const isOpen = expandedCards[taskId]
    setExpandedCards(prev => ({ ...prev, [taskId]: !isOpen }))
    if (!isOpen && !subtasksData[taskId]) {
      try {
        const { data } = await api.get(`/tareas/${taskId}/subtareas`)
        setSubtasksData(prev => ({ ...prev, [taskId]: data.data.subtareas }))
      } catch { setSubtasksData(prev => ({ ...prev, [taskId]: [] })) }
    }
  }

  const handleAddSubtask = async (taskId) => {
    const titulo = (newSubtask[taskId] || '').trim()
    if (!titulo) return
    try {
      const { data } = await api.post(`/tareas/${taskId}/subtareas`, { titulo })
      setSubtasksData(prev => ({ ...prev, [taskId]: [...(prev[taskId] || []), data.data.subtarea] }))
      setNewSubtask(prev => ({ ...prev, [taskId]: '' }))
    } catch (err) { setError(err.response?.data?.message || 'Error al crear subtarea') }
  }

  const handleToggleSubtask = async (taskId, subtareaId) => {
    try {
      const { data } = await api.patch(`/tareas/${taskId}/subtareas/${subtareaId}`)
      setSubtasksData(prev => ({
        ...prev,
        [taskId]: prev[taskId].map(s => s.id === subtareaId ? data.data.subtarea : s)
      }))
    } catch (err) { setError('Error al actualizar subtarea') }
  }

  const handleDeleteSubtask = async (taskId, subtareaId) => {
    try {
      await api.delete(`/tareas/${taskId}/subtareas/${subtareaId}`)
      setSubtasksData(prev => ({
        ...prev,
        [taskId]: prev[taskId].filter(s => s.id !== subtareaId)
      }))
    } catch (err) { setError('Error al eliminar subtarea') }
  }

  const openCreate = () => { setEditTarea(null); setForm(emptyForm); setDialogOpen(true) }
  const openEdit = t => {
    setEditTarea(t)
    setForm({
      titulo: t.titulo, descripcion: t.descripcion || '', estado: t.estado,
      prioridad: t.prioridad, categoria: t.categoria,
      fechaVencimiento: t.fechaVencimiento ? t.fechaVencimiento.substring(0, 10) : ''
    })
    setDialogOpen(true)
    setAnchorEl(null)
  }

  const openComments = async t => {
    setCommentTarea(t)
    setCommentDialogOpen(true)
    setAnchorEl(null)
    try {
      const { data } = await api.get(`/tareas/${t.id}`)
      setComments(data.data.tarea?.comentarios || [])
    } catch { setComments([]) }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editTarea) await api.put(`/tareas/${editTarea.id}`, form)
      else await api.post('/tareas', form)
      setDialogOpen(false)
      fetchTareas()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar')
    } finally { setSaving(false) }
  }

  const handleDelete = async id => {
    if (!confirm('¿Eliminar esta tarea?')) return
    await api.delete(`/tareas/${id}`)
    fetchTareas()
    setAnchorEl(null)
  }

  const handleShare = async () => {
    setSaving(true)
    try {
      await api.post(`/tareas/${shareTarea.id}/invitar`, { emailColaborador: shareEmail, permisos: 'leer' })
      setShareDialogOpen(false)
      setShareEmail('')
      setSuccess(`Invitación enviada a ${shareEmail}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar invitación')
    } finally { setSaving(false) }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    setSaving(true)
    try {
      const { data } = await api.post(`/tareas/${commentTarea.id}/comentarios`, { texto: newComment })
      setComments(prev => [...prev, data.data.comentario])
      setNewComment('')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al comentar')
    } finally { setSaving(false) }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Mis Tareas</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Nueva tarea</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {tareas.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8, color: 'text.secondary' }}>
          <Typography variant="h6">No tienes tareas todavía</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>Crea tu primera tarea con el botón de arriba</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {tareas.map(t => {
            const subs = subtasksData[t.id] || []
            const completadas = subs.filter(s => s.completada).length
            const progress = subs.length > 0 ? Math.round((completadas / subs.length) * 100) : 0
            const expanded = expandedCards[t.id]

            return (
              <Grid item xs={12} sm={6} md={4} key={t.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: 1, pb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1, mr: 1 }}>{t.titulo}</Typography>
                      <IconButton size="small" onClick={e => { setAnchorEl(e.currentTarget); setMenuTarea(t) }}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {t.descripcion && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1 }}>
                        {t.descripcion}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      <Chip label={t.estado.replace('_', ' ')} size="small" color={ESTADO_COLOR[t.estado]} />
                      <Chip label={t.prioridad} size="small" color={PRIORIDAD_COLOR[t.prioridad]} variant="outlined" />
                      <Chip label={t.categoria} size="small" variant="outlined" />
                    </Box>

                    {t.fechaVencimiento && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Vence: {new Date(t.fechaVencimiento).toLocaleDateString('es-MX')}
                      </Typography>
                    )}

                    {/* Colaboradores */}
                    {t.esCompartida && t.colaboradores?.length > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                        <GroupIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">Colaboradores:</Typography>
                        {t.colaboradores.map((col, i) => (
                          <Tooltip key={i} title={col.usuario?.nombre || col.usuario?.email || 'Colaborador'}>
                            <Avatar sx={{ width: 20, height: 20, fontSize: 10, bgcolor: 'secondary.main' }}>
                              {(col.usuario?.nombre || '?')[0].toUpperCase()}
                            </Avatar>
                          </Tooltip>
                        ))}
                      </Box>
                    )}

                    {/* Subtasks preview progress */}
                    {subs.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            <ChecklistIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                            {completadas}/{subs.length} subtareas
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{progress}%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={progress} sx={{ height: 4, borderRadius: 2 }} />
                      </Box>
                    )}
                  </CardContent>

                  {/* Expand button */}
                  <CardActions sx={{ pt: 0, pb: 0.5, px: 1, justifyContent: 'flex-end' }}>
                    <Button
                      size="small" color="inherit"
                      endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      onClick={() => toggleExpand(t.id)}
                      sx={{ fontSize: 11, color: 'text.secondary' }}
                    >
                      {expanded ? 'Ocultar' : 'Subtareas'}
                    </Button>
                  </CardActions>

                  {/* Subtasks panel */}
                  <Collapse in={expanded} unmountOnExit>
                    <Divider />
                    <Box sx={{ px: 2, py: 1.5 }}>
                      {subs.length === 0 && !expanded ? null : subs.map(s => (
                        <Box key={s.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Checkbox
                            size="small" checked={Boolean(s.completada)}
                            onChange={() => handleToggleSubtask(t.id, s.id)}
                            sx={{ p: 0.5 }}
                          />
                          <Typography
                            variant="body2" sx={{ flex: 1,
                              textDecoration: s.completada ? 'line-through' : 'none',
                              color: s.completada ? 'text.disabled' : 'text.primary'
                            }}
                          >
                            {s.titulo}
                          </Typography>
                          <IconButton size="small" onClick={() => handleDeleteSubtask(t.id, s.id)}>
                            <DeleteIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      ))}

                      {/* Add subtask input */}
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                        <TextField
                          size="small" fullWidth placeholder="Nueva subtarea..."
                          value={newSubtask[t.id] || ''}
                          onChange={e => setNewSubtask(prev => ({ ...prev, [t.id]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && handleAddSubtask(t.id)}
                          sx={{ '& .MuiInputBase-root': { fontSize: 13 } }}
                        />
                        <IconButton size="small" color="primary" onClick={() => handleAddSubtask(t.id)}>
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Collapse>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* Context menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MI onClick={() => openEdit(menuTarea)}><EditIcon fontSize="small" sx={{ mr: 1 }} />Editar</MI>
        <MI onClick={() => openComments(menuTarea)}><CommentIcon fontSize="small" sx={{ mr: 1 }} />Comentarios</MI>
        <MI onClick={() => { setShareTarea(menuTarea); setShareDialogOpen(true); setAnchorEl(null) }}>
          <ShareIcon fontSize="small" sx={{ mr: 1 }} />Invitar colaborador
        </MI>
        <Divider />
        <MI onClick={() => handleDelete(menuTarea?.id)} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />Eliminar
        </MI>
      </Menu>

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editTarea ? 'Editar tarea' : 'Nueva tarea'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Título" value={form.titulo}
            onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} fullWidth size="small" />
          <TextField label="Descripción" value={form.descripcion}
            onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
            fullWidth size="small" multiline rows={3} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select label="Estado" value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}>
                <MenuItem value="pendiente">Pendiente</MenuItem>
                <MenuItem value="en_progreso">En progreso</MenuItem>
                <MenuItem value="completada">Completada</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Prioridad</InputLabel>
              <Select label="Prioridad" value={form.prioridad} onChange={e => setForm(f => ({ ...f, prioridad: e.target.value }))}>
                <MenuItem value="baja">Baja</MenuItem>
                <MenuItem value="media">Media</MenuItem>
                <MenuItem value="alta">Alta</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <FormControl size="small" fullWidth>
            <InputLabel>Categoría</InputLabel>
            <Select label="Categoría" value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
              {['trabajo', 'estudio', 'personal', 'hogar', 'salud', 'otro'].map(c => (
                <MenuItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Fecha de vencimiento" type="date" value={form.fechaVencimiento}
            onChange={e => setForm(f => ({ ...f, fechaVencimiento: e.target.value }))}
            fullWidth size="small" InputLabelProps={{ shrink: true }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comments dialog */}
      <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Comentarios — {commentTarea?.titulo}</DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          {comments.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No hay comentarios todavía
            </Typography>
          ) : (
            <List dense>
              {comments.map((c, i) => (
                <ListItem key={i} alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                      {c.usuario?.nombre?.[0]?.toUpperCase() || '?'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="body2" fontWeight={600}>{c.usuario?.nombre || 'Usuario'}</Typography>}
                    secondary={
                      <>
                        <Typography variant="body2" sx={{ display: 'block' }}>{c.texto}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {c.fecha ? new Date(c.fecha).toLocaleString('es-MX') : ''}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <TextField size="small" fullWidth placeholder="Escribe un comentario..."
              value={newComment} onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAddComment()} />
            <IconButton color="primary" onClick={handleAddComment} disabled={saving || !newComment.trim()}>
              <SendIcon />
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Share dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Invitar colaborador</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Se enviará un email con enlace para aceptar o rechazar.
          </Typography>
          <TextField label="Email del colaborador" type="email" value={shareEmail}
            onChange={e => setShareEmail(e.target.value)} fullWidth size="small" autoFocus />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleShare} disabled={saving || !shareEmail}>
            {saving ? <CircularProgress size={20} /> : 'Enviar invitación'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(success)} autoHideDuration={4000} onClose={() => setSuccess('')}
        message={success} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  )
}
