import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Layout from './components/Layout'
import Tasks from './pages/Tasks'
import SharedTasks from './pages/SharedTasks'
import Stats from './pages/Stats'
import Admin from './pages/Admin'

function getTheme(mode) {
  return createTheme({
    palette: {
      mode,
      primary: { main: '#9333ea' },
      secondary: { main: '#c084fc' },
      background: mode === 'dark'
        ? { default: '#0f172a', paper: '#1e293b' }
        : { default: '#f1f5f9', paper: '#ffffff' }
    },
    shape: { borderRadius: 12 }
  })
}

function PrivateRoute({ children }) {
  const { usuario } = useAuth()
  return usuario ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { usuario } = useAuth()
  return !usuario ? children : <Navigate to="/" replace />
}

export default function App() {
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'dark')

  const toggleMode = () => {
    const next = mode === 'dark' ? 'light' : 'dark'
    setMode(next)
    localStorage.setItem('themeMode', next)
  }

  return (
    <ThemeProvider theme={getTheme(mode)}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
  		<Route path="/login" element={<PublicRoute><Login toggleMode={toggleMode} mode={mode} /></PublicRoute>} />
  		<Route path="/admin" element={<Admin />} />
  		<Route path="/" element={<PrivateRoute><Layout toggleMode={toggleMode} mode={mode} /></PrivateRoute>}>
    		   <Route index element={<Tasks />} />
    		   <Route path="compartidas" element={<SharedTasks />} />
    		   <Route path="estadisticas" element={<Stats />} />
  		</Route>
	  </Routes>        
	</BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
