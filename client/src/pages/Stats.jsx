import { useState, useEffect } from 'react'
import {
  Box, Typography, Card, CardContent, Grid, CircularProgress,
  Alert, LinearProgress, Chip, Divider
} from '@mui/material'
import { PieChart } from '@mui/x-charts/PieChart'
import { BarChart } from '@mui/x-charts/BarChart'
import { LineChart } from '@mui/x-charts/LineChart'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PendingIcon from '@mui/icons-material/Pending'
import WarningIcon from '@mui/icons-material/Warning'
import SpeedIcon from '@mui/icons-material/Speed'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import ShareIcon from '@mui/icons-material/Share'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import api from '../api/axios'

const PRIORIDAD_COLOR = { alta: '#ef4444', media: '#f59e0b', baja: '#10b981' }
const CATEGORIA_COLOR = {
  trabajo: '#6366f1', estudio: '#3b82f6', personal: '#8b5cf6',
  hogar: '#f59e0b', salud: '#10b981', otro: '#6b7280'
}

function StatCard({ icon, label, value, color = 'primary.main', subtitle }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{
          color, fontSize: 36,
          bgcolor: `${color}22`, borderRadius: 2,
          p: 1, display: 'flex', alignItems: 'center'
        }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={700} lineHeight={1}>{value}</Typography>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
          {subtitle && <Typography variant="caption" color="text.disabled">{subtitle}</Typography>}
        </Box>
      </CardContent>
    </Card>
  )
}

export default function Stats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/tareas/estadisticas/resumen')
      .then(({ data }) => setStats(data.data))
      .catch(() => setError('Error al cargar estadisticas'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
  if (error) return <Alert severity="error">{error}</Alert>

  const { resumen, porEstado, porPrioridad, porCategoria, porDiaSemana, tareasCompletadasPorSemana } = stats

  const pieEstado = [
    { id: 0, value: porEstado.pendiente, label: 'Pendiente', color: '#f59e0b' },
    { id: 1, value: porEstado.en_progreso, label: 'En progreso', color: '#3b82f6' },
    { id: 2, value: porEstado.completada, label: 'Completada', color: '#10b981' }
  ].filter(d => d.value > 0)

  const piePrioridad = [
    { id: 0, value: porPrioridad.alta, label: 'Alta', color: '#ef4444' },
    { id: 1, value: porPrioridad.media, label: 'Media', color: '#f59e0b' },
    { id: 2, value: porPrioridad.baja, label: 'Baja', color: '#10b981' }
  ].filter(d => d.value > 0)

  const diasLabels = Object.keys(porDiaSemana)
  const diasValues = Object.values(porDiaSemana)
  const semanasLabels = tareasCompletadasPorSemana.map(s => s.semana)
  const semanasValues = tareasCompletadasPorSemana.map(s => s.completadas)

  const categoriaEntries = Object.entries(porCategoria).filter(([, v]) => v > 0)
  const maxCat = Math.max(...Object.values(porCategoria), 1)

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Estadisticas</Typography>

      {/* Fila 1: cards resumen */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={<SpeedIcon fontSize="inherit" />} label="Total" value={resumen.total} />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={<CheckCircleIcon fontSize="inherit" />} label="Completadas" value={resumen.completadas} color="success.main" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={<TrendingUpIcon fontSize="inherit" />} label="En progreso" value={resumen.enProgreso} color="info.main" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={<PendingIcon fontSize="inherit" />} label="Pendientes" value={resumen.pendientes} color="warning.main" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={<WarningIcon fontSize="inherit" />} label="Vencidas" value={resumen.vencidas} color="error.main" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={<AccessTimeIcon fontSize="inherit" />} label="Por vencer" value={resumen.porVencer} color="warning.main" subtitle="proximos 7 dias" />
        </Grid>
      </Grid>

      {/* Tasa de completado + desglose propias/colaborativas */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="subtitle2">Tasa de completado</Typography>
              {resumen.colaborativas > 0 && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip size="small" label={`${resumen.propias} propias`} variant="outlined" />
                  <Chip size="small" icon={<ShareIcon sx={{ fontSize: '12px !important' }} />}
                    label={`${resumen.colaborativas} colaborativas`} color="primary" variant="outlined" />
                </Box>
              )}
            </Box>
            <Typography variant="subtitle2" fontWeight={700} color="primary">{resumen.tasaCompletado}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={resumen.tasaCompletado} sx={{ height: 10, borderRadius: 5 }} />
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {/* Pie estado */}
        {pieEstado.length > 0 && (
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Por estado</Typography>
                <PieChart
                  series={[{ data: pieEstado, innerRadius: 45, paddingAngle: 3, cornerRadius: 4 }]}
                  height={200}
                  slotProps={{ legend: { direction: 'row', position: { vertical: 'bottom', horizontal: 'middle' }, padding: 0 } }}
                />
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Pie prioridad */}
        {piePrioridad.length > 0 && (
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Por prioridad</Typography>
                <PieChart
                  series={[{ data: piePrioridad, innerRadius: 45, paddingAngle: 3, cornerRadius: 4 }]}
                  height={200}
                  slotProps={{ legend: { direction: 'row', position: { vertical: 'bottom', horizontal: 'middle' }, padding: 0 } }}
                />
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Categorias */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Por categoria</Typography>
              {categoriaEntries.length === 0 ? (
                <Typography variant="body2" color="text.secondary">Sin datos</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {categoriaEntries.sort((a, b) => b[1] - a[1]).map(([cat, val]) => (
                    <Box key={cat}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: CATEGORIA_COLOR[cat] || '#6b7280' }} />
                          <Typography variant="body2">{cat.charAt(0).toUpperCase() + cat.slice(1)}</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600}>{val}</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(val / maxCat) * 100}
                        sx={{ height: 5, borderRadius: 3, '& .MuiLinearProgress-bar': { bgcolor: CATEGORIA_COLOR[cat] } }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Actividad por dia */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Actividad por dia (ultimos 30 dias)</Typography>
              <BarChart
                xAxis={[{ scaleType: 'band', data: diasLabels }]}
                series={[{ data: diasValues, color: '#6366f1', label: 'Tareas creadas' }]}
                height={200}
                slotProps={{ legend: { hidden: true } }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Completadas por semana */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Completadas por semana</Typography>
              <LineChart
                xAxis={[{ scaleType: 'band', data: semanasLabels }]}
                series={[{ data: semanasValues, color: '#10b981', label: 'Completadas', area: true }]}
                height={200}
                slotProps={{ legend: { hidden: true } }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Prioridades detalle */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Distribucion por prioridad</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {Object.entries(porPrioridad).map(([pri, val]) => (
                  <Box key={pri} sx={{ flex: 1, minWidth: 100 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ color: PRIORIDAD_COLOR[pri] }}>
                        {pri.charAt(0).toUpperCase() + pri.slice(1)}
                      </Typography>
                      <Typography variant="body2">{val}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={resumen.total > 0 ? (val / resumen.total) * 100 : 0}
                      sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { bgcolor: PRIORIDAD_COLOR[pri] } }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
