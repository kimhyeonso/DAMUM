import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { ROUTES } from '../constants/routes'

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading)
  const location = useLocation()

  if (isAuthLoading) {
    return <p role="status">인증 상태를 확인하고 있습니다.</p>
  }

  return isAuthenticated ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />
}

export default ProtectedRoute
