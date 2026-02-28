import { useEffect } from 'react'
import api from '../api/axios'

export function useHeartbeat() {
  useEffect(() => {
    const ping = () => api.post('/heartbeat').catch(() => {})
    ping()
    const interval = setInterval(ping, 30000)
    return () => clearInterval(interval)
  }, [])
}
