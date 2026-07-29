import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { db } from './firebase'

const orders = collection(db, 'orders')

const getCreateAtTime = (value) => {
  if (typeof value?.toMillis === 'function') return value.toMillis()
  if (typeof value?.toDate === 'function') return value.toDate().getTime()

  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

export const getOrders = async () => (await getDocs(orders)).docs.map((item) => ({ id: item.id, ...item.data() }))
export const getOrdersByUser = async (userId) => {
  const userOrders = query(orders, where('userId', '==', userId))
  const snapshot = await getDocs(userOrders)

  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => getCreateAtTime(b.createAt) - getCreateAtTime(a.createAt))
}
export const createOrder = (data) => addDoc(orders, data)
export const updateOrder = (id, data) => updateDoc(doc(db, 'orders', id), data)
