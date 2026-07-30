import { collection, doc, getDoc, getDocs, runTransaction, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'

export const getUser = async (id) => { const item = await getDoc(doc(db, 'users', id)); return item.exists() ? { id: item.id, ...item.data() } : null }
export const createUserProfile = (id, { email, nickname }) => setDoc(doc(db, 'users', id), {
  email: email ?? '',
  nickname: nickname ?? '',
  role: 'user',
  createAt: serverTimestamp(),
})
export const updateUser = (id, data) => setDoc(doc(db, 'users', id), data, { merge: true })

export const getUsersForAdmin = async () => {
  const snapshot = await getDocs(collection(db, 'users'))

  const toTime = (value) => {
    if (typeof value?.toMillis === 'function') return value.toMillis()
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? 0 : date.getTime()
  }

  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((first, second) => toTime(second.createAt) - toTime(first.createAt))
}

export const ensureUserProfile = async (id, { email, nickname }) => {
  const userRef = doc(db, 'users', id)
  const result = await runTransaction(db, async (transaction) => {
    const existingUser = await transaction.get(userRef)

    if (existingUser.exists()) {
      return { created: false, profile: { id: existingUser.id, ...existingUser.data() } }
    }

    transaction.set(userRef, {
      email: email ?? '',
      nickname: nickname || '새 회원',
      role: 'user',
      createAt: serverTimestamp(),
    })

    return { created: true }
  })

  if (!result.created) return result.profile

  const createdUser = await getDoc(userRef)
  return createdUser.exists()
    ? { id: createdUser.id, ...createdUser.data() }
    : { id, email: email ?? '', nickname: nickname || '새 회원', role: 'user', createAt: null }
}
