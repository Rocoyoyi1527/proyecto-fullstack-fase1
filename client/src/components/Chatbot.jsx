import { useState, useRef, useEffect } from 'react'
import {
  Box, Paper, Typography, IconButton, TextField,
  Avatar, CircularProgress, Collapse, Tooltip
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import PersonIcon from '@mui/icons-material/Person'
import api from '../api/axios'

const WELCOME = '¡Hola! 👋 Soy tu asistente TaskFlow.\nPuedes pedirme:\n• "Lista mis tareas"\n• "Crea tarea Estudiar para el viernes"\n• "Completa la tarea Estudiar"\n• "Edita la tarea 5, cambia prioridad a alta"\n• "Elimina la tarea Estudiar"\n• "Dame un resumen de mi semana"'

// Acciones que modifican datos → disparan recarga
const MUTATING_ACTIONS = new Set(['create', 'complete', 'edit', 'delete'])

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'bot', text: WELCOME }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', text }])
    setLoading(true)

    try {
      const { data } = await api.post('/chat', { message: text })
      setMessages(prev => [...prev, { role: 'bot', text: data.answer || 'Listo.' }])

      // Si la acción modificó datos, notifica a la página para que recargue
      if (MUTATING_ACTIONS.has(data.action)) {
        window.dispatchEvent(new CustomEvent('chatbot:tasks-updated'))
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: err.response?.data?.message || 'Error al conectar con el asistente.'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300 }}>
      <Collapse in={open} unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            width: 340, height: 480, display: 'flex', flexDirection: 'column',
            mb: 1, borderRadius: 3, overflow: 'hidden',
            border: '1px solid', borderColor: 'divider'
          }}
        >
          {/* Header */}
          <Box sx={{
            p: 1.5, display: 'flex', alignItems: 'center', gap: 1,
            bgcolor: 'primary.main', color: 'white'
          }}>
            <SmartToyIcon fontSize="small" />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>Asistente TaskFlow</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Powered by Gemini</Typography>
            </Box>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {messages.map((msg, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  gap: 0.5, alignItems: 'flex-end'
                }}
              >
                <Avatar sx={{
                  width: 24, height: 24, fontSize: 12,
                  bgcolor: msg.role === 'user' ? 'secondary.main' : 'primary.main'
                }}>
                  {msg.role === 'user' ? <PersonIcon sx={{ fontSize: 14 }} /> : <SmartToyIcon sx={{ fontSize: 14 }} />}
                </Avatar>
                <Paper
                  elevation={0}
                  sx={{
                    px: 1.5, py: 1, maxWidth: '80%', borderRadius: 2,
                    bgcolor: msg.role === 'user' ? 'primary.main' : 'action.hover',
                    color: msg.role === 'user' ? 'white' : 'text.primary'
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                    {msg.text}
                  </Typography>
                </Paper>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-end' }}>
                <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                  <SmartToyIcon sx={{ fontSize: 14 }} />
                </Avatar>
                <Paper elevation={0} sx={{ px: 1.5, py: 1, borderRadius: 2, bgcolor: 'action.hover' }}>
                  <CircularProgress size={14} />
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box sx={{ p: 1, display: 'flex', gap: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <TextField
              size="small" fullWidth value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Escribe un mensaje..."
              disabled={loading}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <IconButton
              onClick={sendMessage} disabled={loading || !input.trim()}
              sx={{
                bgcolor: 'primary.main', color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                '&:disabled': { bgcolor: 'action.disabledBackground' }
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      </Collapse>

      {/* Toggle button */}
      <Tooltip title={open ? 'Cerrar asistente' : 'Abrir asistente'} placement="left">
        <IconButton
          onClick={() => setOpen(o => !o)}
          sx={{
            width: 56, height: 56,
            bgcolor: 'primary.main', color: 'white',
            boxShadow: 4,
            '&:hover': { bgcolor: 'primary.dark' },
            transition: 'transform 0.2s',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)'
          }}
        >
          {open ? <CloseIcon /> : <SmartToyIcon />}
        </IconButton>
      </Tooltip>
    </Box>
  )
}
