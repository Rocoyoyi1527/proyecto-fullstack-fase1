import { useState } from 'react'
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Alert, CircularProgress, InputAdornment, IconButton, Divider
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()

  // Step 1: form data
  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmar: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 2: verification
  const [step, setStep] = useState(1) // 1 = form, 2 = verification
  const [pendingData, setPendingData] = useState(null) // { usuarioId, email }
  const [codigo, setCodigo] = useState('')
  const [verifying, setVerifying] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmar) {
      return setError('Las contrasenas no coinciden')
    }
    if (form.password.length < 6) {
      return setError('La contrasena debe tener al menos 6 caracteres')
    }

    setLoading(true)
    try {
      const { data } = await api.post('/auth/registrar', {
        nombre: form.nombre,
        email: form.email,
        password: form.password
      })

      if (data.pendingVerification) {
        setPendingData(data.data)
        setStep(2)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')

    if (codigo.length !== 6) return setError('El codigo debe tener 6 digitos')

    setVerifying(true)
    try {
      const { data } = await api.post('/auth/verificar-email', {
        usuarioId: pendingData.usuarioId,
        codigo
      })
      login(data.data.usuario, data.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Codigo incorrecto')
    } finally {
      setVerifying(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/registrar', { email: pendingData.email, nombre: '', password: '' })
      setError('')
    } catch {
      // Reenvio silencioso
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', bgcolor: 'background.default', p: 2
    }}>
      <Card sx={{ width: '100%', maxWidth: 420 }} elevation={4}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight={800} color="primary">TASKFLOW</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {step === 1 ? 'Crea tu cuenta' : 'Verifica tu correo'}
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

          {/* STEP 1: Registro */}
          {step === 1 && (
            <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Nombre completo" size="small" required
                value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon fontSize="small" /></InputAdornment> }}
              />
              <TextField
                label="Correo electronico" type="email" size="small" required
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" /></InputAdornment> }}
              />
              <TextField
                label="Contrasena" size="small" required
                type={showPass ? 'text' : 'password'}
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPass(v => !v)}>
                        {showPass ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                label="Confirmar contrasena" size="small" required
                type={showPass ? 'text' : 'password'}
                value={form.confirmar} onChange={e => setForm(f => ({ ...f, confirmar: e.target.value }))}
                InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" /></InputAdornment> }}
              />
              <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ mt: 1 }}>
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Crear cuenta'}
              </Button>
              <Divider />
              <Typography variant="body2" textAlign="center">
                Ya tienes cuenta?{' '}
                <Link to="/login" style={{ color: 'inherit', fontWeight: 600 }}>Inicia sesion</Link>
              </Typography>
            </Box>
          )}

          {/* STEP 2: Verificacion */}
          {step === 2 && (
            <Box component="form" onSubmit={handleVerify} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ textAlign: 'center', py: 1 }}>
                <MarkEmailReadIcon sx={{ fontSize: 56, color: 'primary.main', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Enviamos un codigo de 6 digitos a
                </Typography>
                <Typography variant="subtitle2" fontWeight={700}>{pendingData?.email}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Expira en 15 minutos
                </Typography>
              </Box>

              <TextField
                label="Codigo de verificacion"
                size="small"
                required
                value={codigo}
                onChange={e => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: 28, fontWeight: 700, letterSpacing: 8 } }}
                placeholder="000000"
              />

              <Button type="submit" variant="contained" size="large" disabled={verifying || codigo.length !== 6}>
                {verifying ? <CircularProgress size={22} color="inherit" /> : 'Verificar y entrar'}
              </Button>

              <Button variant="text" size="small" onClick={() => setStep(1)} color="inherit">
                Volver al registro
              </Button>

              <Typography variant="caption" textAlign="center" color="text.secondary">
                No recibiste el correo?{' '}
                <span
                  onClick={handleResend}
                  style={{ cursor: 'pointer', color: '#7c3aed', fontWeight: 600 }}
                >
                  Reenviar
                </span>
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
