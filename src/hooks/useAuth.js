import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/firebase'
import { getUser } from '../firebase/userApi'
import { useAuthStore } from '../store/authStore'

export const useAuth = () => {
  const state = useAuthStore()
  const setUser = useAuthStore((store) => store.setUser)
  const startAuthCheck = useAuthStore((store) => store.startAuthCheck)
  const setAuthError = useAuthStore((store) => store.setAuthError)

  useEffect(() => {
    let isActive = true

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (isActive) startAuthCheck()

      if (!authUser) {
        if (isActive) setUser(null)
        return
      }

      try {
        const profile = await getUser(authUser.uid)

        if (isActive) {
          const role = String(profile?.role ?? '').trim().toLowerCase() === 'admin'
            ? 'admin'
            : 'user'

          setUser({
            uid: authUser.uid,
            email: authUser.email,
            nickname: profile?.nickname ?? '',
            role,
          })
        }
      } catch (error) {
        console.error('회원 권한 정보 조회 실패:', error)

        if (isActive) {
          setUser({ uid: authUser.uid, email: authUser.email, nickname: '', role: 'user' })
          setAuthError('회원 권한 정보를 불러오지 못했습니다. Firebase 프로젝트와 Firestore 보안 규칙을 확인한 뒤 다시 로그인해주세요.')
        }
      }
    })

    return () => {
      isActive = false
      unsubscribe()
    }
  }, [setUser, setAuthError, startAuthCheck])

  return state
}
