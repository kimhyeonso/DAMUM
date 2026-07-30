import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

export const useAuth = () => {
  const state = useAuthStore()
  const initializeAuth = useAuthStore((store) => store.initializeAuth)

  useEffect(() => {
    return initializeAuth()
  }, [initializeAuth])

  return state
}
