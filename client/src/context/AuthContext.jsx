import { createContext, useContext, useState } from 'react'
import api from '../api/axios'
const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const u = localStorage.getItem('usuario')
    return u ? JSON.parse(u) : null
  })
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    if (data.pendingVerification) return { pendingVerification: true, ...data.data }
    localStorage.setItem('token', data.data.token)
    localStorage.setItem('usuario', JSON.stringify(data.data.usuario))
    setUsuario(data.data.usuario)
    return data.data.usuario
  }
  const registro = async (nombre, email, password) => {
    const { data } = await api.post('/auth/registrar', { nombre, email, password })
    return { pendingVerification: true, ...data.data }
  }
  const verificar = async (usuarioId, codigo) => {
    const { data } = await api.post('/auth/verificar-email', { usuarioId, codigo })
    localStorage.setItem('token', data.data.token)
    localStorage.setItem('usuario', JSON.stringify(data.data.usuario))
    setUsuario(data.data.usuario)
    return data.data.usuario
  }
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }
  return (
    <AuthContext.Provider value={{ usuario, login, registro, verificar, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
export const useAuth = () => useContext(AuthContext)
