import { create } from 'zustand'
import { login as loginWithEmail, logout as logoutFromFirebase, signUp as signUpWithEmail, subscribeToAuthState } from '../firebase/authApi'
import { createUserProfile, getUser } from '../firebase/userApi'
import { getFirebaseErrorMessage } from '../utils/firebaseError'

const toSessionUser = (authUser, profile) => ({
  uid: authUser.uid,
  email: authUser.email ?? '',
  nickname: profile?.nickname ?? '',
  role: String(profile?.role ?? '').trim().toLowerCase() === 'admin' ? 'admin' : 'user',
})

const getSessionState = (authUser, profile, error = '') => ({
  user: authUser ? toSessionUser(authUser, profile) : null,
  profile: profile ?? null,
  loading: false,
  error,
  isAuthenticated: Boolean(authUser),
  isAuthLoading: false,
  authError: error,
})

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: '',

  // 기존 인증 화면과 보호 라우트가 사용 중인 상태명은 호환성을 위해 유지합니다.
  isAuthenticated: false,
  isAuthLoading: true,
  authError: '',

  clearError: () => set({ error: '', authError: '' }),
  resetAuthState: () => set(getSessionState(null, null)),
  setUser: (user) => set((state) => {
    if (!user) return getSessionState(null, null)

    return {
      ...getSessionState(user, { ...state.profile, ...user }),
      user,
    }
  }),

  initializeAuth: () => subscribeToAuthState(async (authUser) => {
    set({ loading: true, error: '', isAuthLoading: true, authError: '' })

    if (!authUser) {
      set(getSessionState(null, null))
      return
    }

    try {
      const profile = await getUser(authUser.uid)
      set(getSessionState(authUser, profile))
    } catch (error) {
      const message = '회원 정보를 불러오지 못했습니다. Firebase 프로젝트와 Firestore 보안 규칙을 확인한 뒤 다시 로그인해주세요.'
      console.error('회원 권한 정보 조회 실패:', error)
      set(getSessionState(authUser, null, message))
    }
  }),

  login: async (email, password) => {
    if (get().loading) return false

    set({ loading: true, error: '', isAuthLoading: true, authError: '' })

    try {
      const credential = await loginWithEmail(email, password)
      const profile = await getUser(credential.user.uid)
      set(getSessionState(credential.user, profile))
      return true
    } catch (error) {
      const message = getFirebaseErrorMessage(error)
      set({ loading: false, error: message, isAuthLoading: false, authError: message })
      return false
    }
  },

  signup: async (email, password, nickname) => {
    if (get().loading) return false

    set({ loading: true, error: '', isAuthLoading: true, authError: '' })

    try {
      const credential = await signUpWithEmail(email, password)
      await createUserProfile(credential.user.uid, {
        email: credential.user.email,
        nickname,
      })
      const profile = await getUser(credential.user.uid)
      set(getSessionState(credential.user, profile))
      return true
    } catch (error) {
      const message = getFirebaseErrorMessage(error)
      set({ loading: false, error: message, isAuthLoading: false, authError: message })
      return false
    }
  },

  logout: async () => {
    set({ loading: true, error: '', isAuthLoading: true, authError: '' })

    try {
      await logoutFromFirebase()
      set(getSessionState(null, null))
      return true
    } catch (error) {
      const message = getFirebaseErrorMessage(error)
      set({ loading: false, error: message, isAuthLoading: false, authError: message })
      return false
    }
  },
}))
