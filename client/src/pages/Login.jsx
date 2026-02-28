import { useState } from 'react'
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, Tabs, Tab, CircularProgress, IconButton, Tooltip
} from '@mui/material'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function TaskflowLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="55" width="38" height="18" rx="4" fill="#7e22ce"/>
      <rect x="42" y="55" width="38" height="18" rx="4" fill="#9333ea"/>
      <rect x="20" y="32" width="38" height="18" rx="4" fill="#a855f7"/>
      <rect x="62" y="32" width="38" height="18" rx="4" fill="#9333ea"/>
      <rect x="0" y="32" width="16" height="18" rx="4" fill="#7e22ce"/>
      <rect x="10" y="9" width="50" height="18" rx="4" fill="#c084fc"/>
      <rect x="64" y="9" width="26" height="18" rx="4" fill="#a855f7"/>
      <rect x="30" y="-6" width="32" height="12" rx="4" fill="#d8b4fe"/>
    </svg>
  )
}

export default function Login({ toggleMode, mode }) {
  const [tab, setTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ nombre: '', email: '', password: '' })
  const [step, setStep] = useState(1)
  const [pending, setPending] = useState(null)
  const [codigo, setCodigo] = useState('')
  const { login, registro, verificar } = useAuth()
  const navigate = useNavigate()

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 0) {
        const result = await login(form.email, form.password)
        if (result?.pendingVerification) {
          setPending(result)
          setStep(2)
        } else {
          navigate('/')
        }
      } else {
        const result = await registro(form.nombre, form.email, form.password)
        setPending(result)
        setStep(2)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await verificar(pending.usuarioId, codigo)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Codigo incorrecto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', bgcolor: 'background.default', position: 'relative'
    }}>
      <Tooltip title={mode === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
        <IconButton onClick={toggleMode} sx={{ position: 'absolute', top: 16, right: 16 }}>
          {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Tooltip>

      <Card sx={{ width: 400, p: 1 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, gap: 1 }}>
            <TaskflowLogo size={48} />
            <Typography variant="h5" fontWeight={800} sx={{
              background: 'linear-gradient(135deg, #9333ea, #c084fc)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>TASKFLOW</Typography>
            <Typography variant="body2" color="text.secondary">
              {step === 1 ? 'Gestion de tareas colaborativa' : 'Verifica tu correo'}
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

          {step === 1 && (
            <>
              <Tabs value={tab} onChange={(_, v) => { setTab(v); setError('') }} centered sx={{ mb: 3 }}>
                <Tab label="Iniciar sesion" />
                <Tab label="Registrarse" />
              </Tabs>
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {tab === 1 && (
                  <TextField label="Nombre" name="nombre" value={form.nombre}
                    onChange={handleChange} required fullWidth size="small" />
                )}
                <TextField label="Email" name="email" type="email" value={form.email}
                  onChange={handleChange} required fullWidth size="small" />
                <TextField label="Contrasena" name="password" type="password" value={form.password}
                  onChange={handleChange} required fullWidth size="small" />
                <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ mt: 1 }}>
                  {loading ? <CircularProgress size={24} /> : tab === 0 ? 'Entrar' : 'Crear cuenta'}
                </Button>
              </Box>
            </>
          )}

          {step === 2 && (
            <Box component="form" onSubmit={handleVerify} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ textAlign: 'center', py: 1 }}>
                <MarkEmailReadIcon sx={{ fontSize: 56, color: 'primary.main', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Enviamos un codigo de 6 digitos a
                </Typography>
                <Typography variant="subtitle2" fontWeight={700}>{pending?.email}</Typography>
                <Typography variant="caption" color="text.secondary">Expira en 15 minutos</Typography>
              </Box>
              <TextField
                label="Codigo de verificacion" size="small" required
                value={codigo} onChange={e => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: 28, fontWeight: 700, letterSpacing: 8 } }}
                placeholder="000000"
              />
              <Button type="submit" variant="contained" size="large" disabled={loading || codigo.length !== 6}>
                {loading ? <CircularProgress size={24} /> : 'Verificar y entrar'}
              </Button>
              <Button variant="text" size="small" color="inherit" onClick={() => { setStep(1); setCodigo(''); setError('') }}>
                Volver
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
