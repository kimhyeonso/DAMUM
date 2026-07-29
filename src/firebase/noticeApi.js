import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from './firebase'

const notices = collection(db, 'notices')

export const getNotices = async () => {
  const snapshot = await getDocs(query(notices, orderBy('createAt', 'desc')))
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}

export const getNotice = async (id) => {
  const snapshot = await getDoc(doc(db, 'notices', id))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

export const createNotice = async ({ title, content, authorUid }) => {
  const notice = await addDoc(notices, {
    title,
    content,
    authorUid,
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  })

  return notice.id
}

export const updateNotice = (id, { title, content }) => updateDoc(doc(db, 'notices', id), {
  title,
  content,
  updateAt: serverTimestamp(),
})

export const deleteNotice = (id) => deleteDoc(doc(db, 'notices', id))
