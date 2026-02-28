import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Card, CardContent, CardActions, Chip, CircularProgress,
  Alert, Grid, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, TextField, Divider, Avatar, List,
  ListItem, ListItemText, ListItemAvatar, Tabs, Tab, Tooltip,
  Checkbox, LinearProgress, Collapse
} from '@mui/material'
import CommentIcon from '@mui/icons-material/Comment'
import SendIcon from '@mui/icons-material/Send'
import PersonIcon from '@mui/icons-material/Person'
import ShareIcon from '@mui/icons-material/Share'
import GroupIcon from '@mui/icons-material/Group'
import ChecklistIcon from '@mui/icons-material/Checklist'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import api from '../api/axios'

const ESTADO_COLOR = { pendiente: 'warning', en_progreso: 'info', completada: 'success' }
const PRIORIDAD_COLOR = { baja: 'success', media: 'warning', alta: 'error' }

function TaskCard({ t, onComment, subtasksData, expandedCards, onToggleExpand, onToggleSubtask }) {
  const subs = subtasksData[t.id] || []
  const completadas = subs.filter(s => s.completada).length
  const progress = subs.length > 0 ? Math.round((completadas / subs.length) * 100) : 0
  const expanded = expandedCards[t.id]

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1, mr: 1 }}>{t.titulo}</Typography>
          <IconButton size="small" onClick={() => onComment(t)} title="Comentarios">
            <CommentIcon fontSize="small" />
          </IconButton>
        </Box>
        {t.descripcion && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>{t.descripcion}</Typography>
        )}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          <Chip label={t.estado.replace('_', ' ')} size="small" color={ESTADO_COLOR[t.estado]} />
          <Chip label={t.prioridad} size="small" color={PRIORIDAD_COLOR[t.prioridad]} variant="outlined" />
          <Chip label={t.categoria} size="small" variant="outlined" />
        </Box>
        {t.usuario && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
            <PersonIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              De: {t.usuario.nombre || t.usuario}
            </Typography>
          </Box>
        )}
        {t.colaboradores?.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <GroupIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {t.colaboradores.length} colaborador{t.colaboradores.length > 1 ? 'es' : ''}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {t.colaboradores.map((col, i) => (
                <Tooltip key={i} title={col.usuario?.nombre || col.usuario?.email || 'Colaborador'}>
                  <Avatar sx={{ width: 22, height: 22, fontSize: 10, bgcolor: 'secondary.main' }}>
                    {(col.usuario?.nombre || '?')[0].toUpperCase()}
                  </Avatar>
                </Tooltip>
              ))}
            </Box>
          </Box>
        )}
        {t.fechaVencimiento && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            Vence: {new Date(t.fechaVencimiento).toLocaleDateString('es-MX')}
          </Typography>
        )}
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
      <CardActions sx={{ pt: 0, pb: 0.5, px: 1, justifyContent: 'flex-end' }}>
        <Button size="small" color="inherit"
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={() => onToggleExpand(t.id)}
          sx={{ fontSize: 11, color: 'text.secondary' }}>
          {expanded ? 'Ocultar' : 'Subtareas'}
        </Button>
      </CardActions>
      <Collapse in={expanded} unmountOnExit>
        <Divider />
        <Box sx={{ px: 2, py: 1.5 }}>
          {subs.length === 0 ? (
            <Typography variant="caption" color="text.secondary">Sin subtareas</Typography>
          ) : subs.map(s => (
            <Box key={s.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Checkbox size="small" checked={Boolean(s.completada)}
                onChange={() => onToggleSubtask(t.id, s.id)} sx={{ p: 0.5 }} />
              <Typography variant="body2" sx={{
                flex: 1,
                textDecoration: s.completada ? 'line-through' : 'none',
                color: s.completada ? 'text.disabled' : 'text.primary'
              }}>
                {s.titulo}
              </Typography>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Card>
  )
}

export default function SharedTasks() {
  const [tab, setTab] = useState(0)
  const [recibidas, setRecibidas] = useState([])
  const [compartidas, setCompartidas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [commentDialogOpen, setCommentDialogOpen] = useState(false)
  const [commentTarea, setCommentTarea] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [expandedCards, setExpandedCards] = useState({})
  const [subtasksData, setSubtasksData] = useState({})

  const fetchTareas = useCallback(async () => {
    try {
      const [recibidasRes, misTareasRes] = await Promise.all([
        api.get('/tareas/compartidas/conmigo'),
        api.get('/tareas/mis-tareas/todas')
      ])
      setRecibidas(recibidasRes.data.data.tareas)
      setCompartidas(misTareasRes.data.data.tareas.filter(t => t.esCompartida))
    } catch {
      setError('Error al cargar tareas compartidas')
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

  const handleToggleSubtask = async (taskId, subtareaId) => {
    try {
      const { data } = await api.patch(`/tareas/${taskId}/subtareas/${subtareaId}`)
      setSubtasksData(prev => ({
        ...prev,
        [taskId]: prev[taskId].map(s => s.id === subtareaId ? data.data.subtarea : s)
      }))
    } catch { setError('Error al actualizar subtarea') }
  }

  const openComments = async t => {
    setCommentTarea(t)
    setCommentDialogOpen(true)
    try {
      const { data } = await api.get(`/tareas/${t.id}`)
      setComments(data.data.tarea?.comentarios || [])
    } catch { setComments([]) }
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

  const tareasMostradas = tab === 0 ? recibidas : compartidas

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>Tareas Compartidas</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab icon={<PersonIcon fontSize="small" />} iconPosition="start" label={`Recibidas (${recibidas.length})`} />
        <Tab icon={<ShareIcon fontSize="small" />} iconPosition="start" label={`Compartidas por mi (${compartidas.length})`} />
      </Tabs>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {tareasMostradas.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8, color: 'text.secondary' }}>
          <Typography variant="h6">
            {tab === 0 ? 'No tienes tareas recibidas' : 'No has compartido ninguna tarea'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {tab === 0 ? 'Cuando alguien te invite a colaborar aparecera aqui' : 'Invita colaboradores desde "Mis Tareas"'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {tareasMostradas.map(t => (
            <Grid item xs={12} sm={6} md={4} key={t.id}>
              <TaskCard t={t} onComment={openComments}
                subtasksData={subtasksData} expandedCards={expandedCards}
                onToggleExpand={toggleExpand} onToggleSubtask={handleToggleSubtask} />
            </Grid>
          ))}
        </Grid>
      )}
      <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Comentarios - {commentTarea?.titulo}</DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          {comments.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No hay comentarios todavia.
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
    </Box>
  )
}
