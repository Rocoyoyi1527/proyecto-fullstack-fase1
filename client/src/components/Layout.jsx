import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, IconButton, Avatar, Tooltip, Divider, Switch
} from '@mui/material'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import ShareIcon from '@mui/icons-material/Share'
import BarChartIcon from '@mui/icons-material/BarChart'
import LogoutIcon from '@mui/icons-material/Logout'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { useAuth } from '../context/AuthContext'
import Chatbot from './Chatbot'
import { useHeartbeat } from '../hooks/useHeartbeat'
const DRAWER_WIDTH = 230

const navItems = [
  { label: 'Mis Tareas', icon: <TaskAltIcon />, path: '/' },
  { label: 'Compartidas', icon: <ShareIcon />, path: '/compartidas' },
  { label: 'Estadísticas', icon: <BarChartIcon />, path: '/estadisticas' }
]

function TaskflowLogo({ size = 28 }) {
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

export default function Layout({ toggleMode, mode }) {
  useHeartbeat()
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
        <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <TaskflowLogo size={32} />
          <Typography
            variant="h6" fontWeight={800}
            sx={{ background: 'linear-gradient(135deg, #9333ea, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            TASKFLOW
          </Typography>
        </Box>

        <Divider />

        <List sx={{ mt: 1, px: 1, flex: 1 }}>
          {navItems.map(item => (
            <ListItemButton
              key={item.path}
              selected={pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2, mb: 0.5,
                '&.Mui-selected': { bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: pathname === item.path ? 'white' : 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>

        <Divider />

        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LightModeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          <Switch checked={mode === 'dark'} onChange={toggleMode} size="small" color="primary" />
          <DarkModeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        </Box>

        <Box sx={{ px: 2, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'action.hover', borderRadius: 2, p: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
              {usuario?.nombre?.[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <Typography variant="body2" noWrap fontWeight={600}>{usuario?.nombre}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap>{usuario?.email}</Typography>
            </Box>
            <Tooltip title="Cerrar sesión">
              <IconButton size="small" onClick={logout} color="error">
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flex: 1, p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Outlet />
      </Box>

      {/* Chatbot flotante */}
      <Chatbot />
    </Box>
  )
}
