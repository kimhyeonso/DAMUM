import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { ROUTES } from '../constants/routes'
import { USER_ROLES } from '../constants/auth'

const AdminRoute = () => {
  const user = useAuthStore((state) => state.user)
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading)
  const authError = useAuthStore((state) => state.authError)

  if (isAuthLoading) {
    return <p role="status">관리자 권한을 확인하고 있습니다.</p>
  }

  if (authError) {
    return <p role="alert">{authError}</p>
  }

  const isAdmin = String(user?.role ?? '').trim().toLowerCase() === USER_ROLES.ADMIN

  return isAdmin ? <Outlet /> : <Navigate to={ROUTES.HOME} replace />
}

export default AdminRoute
