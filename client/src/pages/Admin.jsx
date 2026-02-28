import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Card, CardContent, TextField, Button,
  CircularProgress, Alert, Grid, Chip, Avatar, Table,
  TableBody, TableCell, TableHead, TableRow, Dialog,
  DialogTitle, DialogContent, DialogActions, Divider,
  IconButton, Tooltip, LinearProgress
} from '@mui/material'
import LockIcon from '@mui/icons-material/Lock'
import PeopleIcon from '@mui/icons-material/People'
import TaskIcon from '@mui/icons-material/Task'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CommentIcon from '@mui/icons-material/Comment'
import ShareIcon from '@mui/icons-material/Share'
import VisibilityIcon from '@mui/icons-material/Visibility'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { StatusDot } from '../components/StatusDot'
import api from '../api/axios'

const ESTADO_COLOR = { pendiente: 'warning', en_progreso: 'info', completada: 'success' }
const PRIORIDAD_COLOR = { baja: 'success', media: 'warning', alta: 'error' }

function StatCard({ icon, label, value, color = 'primary.main' }) {
  return (
    <Card>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ color, fontSize: 36, bgcolor: `${color}22`, borderRadius: 2, p: 1, display: 'flex' }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={700} lineHeight={1}>{value}</Typography>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default function Admin() {
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem('admin_token'))
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [usuarios, setUsuarios] = useState([])
  const [estados, setEstados] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [userTareas, setUserTareas] = useState([])
  const [tareasLoading, setTareasLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const adminApi = useCallback((config) => {
  	return api({ 
    	   ...config, 
    	   headers: { 
      		'Content-Type': 'application/json',
      		Authorization: `Bearer ${adminToken}` 
    	   } 
        })
  }, [adminToken])
  const fetchData = useCallback(async () => {
    if (!adminToken) return
    setLoading(true)
    try {
      const [statsRes, usuariosRes] = await Promise.all([
        adminApi({ method: 'get', url: '/admin/stats' }),
        adminApi({ method: 'get', url: '/admin/usuarios' })
      ])
      setStats(statsRes.data.data)
      setUsuarios(usuariosRes.data.data.usuarios)
    } catch (err) {
      if (err.response?.status === 401) {
        sessionStorage.removeItem('admin_token')
        setAdminToken(null)
      }
      setError('Error al cargar datos')
    } finally { setLoading(false) }
  }, [adminToken, adminApi])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => {
    if (!adminToken) return
    const interval = setInterval(async () => {
      try {
        const res = await adminApi({ method: 'get', url: '/heartbeat/estados' })
        setEstados(res.data.data.estados)
      } catch {}
    }, 30000)
    return () => clearInterval(interval)
  }, [adminToken, adminApi])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const { data } = await api.post('/admin/login', { password })
      sessionStorage.setItem('admin_token', data.data.token)
      setAdminToken(data.data.token)
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Error al iniciar sesion')
    } finally { setLoginLoading(false) }
  }

  const handleVerUsuario = async (usuario) => {
    setSelectedUser(usuario)
    setDialogOpen(true)
    setTareasLoading(true)
    try {
      const { data } = await adminApi({ method: 'get', url: `/admin/usuarios/${usuario.id}/tareas` })
      setUserTareas(data.data.tareas)
    } catch { setUserTareas([]) }
    finally { setTareasLoading(false) }
  }

  if (!adminToken) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <Card sx={{ width: 380, p: 2 }} elevation={6}>
          <CardContent>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <AdminPanelSettingsIcon sx={{ fontSize: 56, color: 'primary.main' }} />
              <Typography variant="h5" fontWeight={800} color="primary">Panel Admin</Typography>
              <Typography variant="body2" color="text.secondary">TaskFlow - Acceso restringido</Typography>
            </Box>
            {loginError && <Alert severity="error" sx={{ mb: 2 }}>{loginError}</Alert>}
            <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Contrasena de administrador" type="password" size="small" required
                value={password} onChange={e => setPassword(e.target.value)}
                InputProps={{ startAdornment: <LockIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> }}
              />
              <Button type="submit" variant="contained" size="large" disabled={loginLoading}>
                {loginLoading ? <CircularProgress size={22} color="inherit" /> : 'Entrar'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AdminPanelSettingsIcon color="primary" />
          <Typography variant="h5" fontWeight={700}>Panel de Administracion</Typography>
        </Box>
        <Button variant="outlined" size="small" color="error" onClick={() => {
          sessionStorage.removeItem('admin_token')
          setAdminToken(null)
        }}>Cerrar sesion</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
      ) : (
        <>
          {stats && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={4} md={2}>
                <StatCard icon={<PeopleIcon fontSize="inherit" />} label="Usuarios" value={stats.totalUsuarios} />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <StatCard icon={<CheckCircleIcon fontSize="inherit" />} label="Verificados" value={stats.verificados} color="success.main" />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <StatCard icon={<TaskIcon fontSize="inherit" />} label="Tareas" value={stats.totalTareas} color="info.main" />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <StatCard icon={<CheckCircleIcon fontSize="inherit" />} label="Completadas" value={stats.completadas} color="success.main" />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <StatCard icon={<ShareIcon fontSize="inherit" />} label="Colaboraciones" value={stats.colaboraciones} color="secondary.main" />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <StatCard icon={<CommentIcon fontSize="inherit" />} label="Comentarios" value={stats.comentarios} color="warning.main" />
              </Grid>
            </Grid>
          )}

          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Usuarios registrados ({usuarios.length})
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell align="center">Verificado</TableCell>
                    <TableCell align="center">Tareas</TableCell>
                    <TableCell align="center">Completadas</TableCell>
                    <TableCell align="center">Progreso</TableCell>
                    <TableCell>Registro</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usuarios.map(u => {
                    const progreso = u.total_tareas > 0 ? Math.round((u.completadas / u.total_tareas) * 100) : 0
                    return (
                      <TableRow key={u.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <StatusDot estado={u.estado} size={10} />
                            <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: 'primary.main' }}>
                              {u.nombre?.[0]?.toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" fontWeight={600}>{u.nombre}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell><Typography variant="body2" color="text.secondary">{u.email}</Typography></TableCell>
                        <TableCell align="center">
                          <Chip size="small" label={u.verificado ? 'Verificado' : 'Pendiente'} color={u.verificado ? 'success' : 'warning'} variant="outlined" />
                        </TableCell>
                        <TableCell align="center"><Typography variant="body2" fontWeight={600}>{u.total_tareas}</Typography></TableCell>
                        <TableCell align="center"><Typography variant="body2" color="success.main" fontWeight={600}>{u.completadas}</Typography></TableCell>
                        <TableCell sx={{ minWidth: 100 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress variant="determinate" value={progreso} sx={{ flex: 1, height: 6, borderRadius: 3 }} />
                            <Typography variant="caption">{progreso}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(u.created_at).toLocaleDateString('es-MX')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Ver tareas">
                            <IconButton size="small" onClick={() => handleVerUsuario(u)}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StatusDot estado={selectedUser?.estado} size={12} />
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: 14 }}>
              {selectedUser?.nombre?.[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>{selectedUser?.nombre}</Typography>
              <Typography variant="caption" color="text.secondary">{selectedUser?.email}</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {tareasLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : userTareas.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              Este usuario no tiene tareas
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tarea</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Prioridad</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell align="center">Colabs</TableCell>
                  <TableCell align="center">Comentarios</TableCell>
                  <TableCell align="center">Subtareas</TableCell>
                  <TableCell>Vence</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userTareas.map(t => (
                  <TableRow key={t.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{t.titulo}</Typography>
                      {t.descripcion && (
                        <Typography variant="caption" color="text.secondary">
                          {t.descripcion.slice(0, 40)}{t.descripcion.length > 40 ? '...' : ''}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell><Chip label={t.estado.replace('_', ' ')} size="small" color={ESTADO_COLOR[t.estado]} /></TableCell>
                    <TableCell><Chip label={t.prioridad} size="small" color={PRIORIDAD_COLOR[t.prioridad]} variant="outlined" /></TableCell>
                    <TableCell><Typography variant="caption">{t.categoria}</Typography></TableCell>
                    <TableCell align="center"><Typography variant="body2">{t.num_colaboradores}</Typography></TableCell>
                    <TableCell align="center"><Typography variant="body2">{t.num_comentarios}</Typography></TableCell>
                    <TableCell align="center"><Typography variant="body2">{t.num_subtareas}</Typography></TableCell>
                    <TableCell>
                      <Typography variant="caption" color={t.fecha_vencimiento && new Date(t.fecha_vencimiento) < new Date() && t.estado !== 'completada' ? 'error' : 'text.secondary'}>
                        {t.fecha_vencimiento ? new Date(t.fecha_vencimiento).toLocaleDateString('es-MX') : '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
