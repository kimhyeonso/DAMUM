import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isAuthLoading: true,
  authError: '',
  startAuthCheck: () => set({ isAuthLoading: true, authError: '' }),
  setUser: (user) => set({
    user,
    isAuthenticated: Boolean(user),
    isAuthLoading: false,
  }),
  setAuthError: (authError) => set({ authError, isAuthLoading: false }),
}))
