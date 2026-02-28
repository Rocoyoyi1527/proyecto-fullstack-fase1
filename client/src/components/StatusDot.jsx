import { Tooltip, Box } from '@mui/material'

const CONFIG = {
  online:  { color: '#22c55e', label: 'En linea' },
  idle:    { color: '#f59e0b', label: 'Inactivo' },
  offline: { color: '#6b7280', label: 'Desconectado' }
}

export function StatusDot({ estado = 'offline', size = 10 }) {
  const cfg = CONFIG[estado] || CONFIG.offline
  return (
    <Tooltip title={cfg.label}>
      <Box component="span" sx={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: cfg.color,
        flexShrink: 0,
        boxShadow: estado === 'online' ? `0 0 6px ${cfg.color}` : 'none'
      }} />
    </Tooltip>
  )
}
