import { collection, deleteDoc, doc, getDocs, onSnapshot, runTransaction, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from './firebase'

const getCartItemsCollection = (userId) => collection(db, 'carts', userId, 'items')

export const getCartItems = async (userId) => {
  const snapshot = await getDocs(getCartItemsCollection(userId))
  return snapshot.docs.map((item) => {
    const data = item.data()

    return {
      ...data,
      id: item.id,
      name: data.name ?? data.productName ?? '상품명 없음',
    }
  })
}

export const subscribeToCartCount = (userId, callback, onError) => onSnapshot(
  getCartItemsCollection(userId),
  (snapshot) => callback(snapshot.docs.reduce((total, item) => total + Number(item.data().quantity ?? 1), 0)),
  onError,
)

export const addCartItem = async (userId, item) => {
  const itemRef = doc(db, 'carts', userId, 'items', String(item.productId))

  await runTransaction(db, async (transaction) => {
    const savedItem = await transaction.get(itemRef)
    const savedQuantity = savedItem.exists() ? Number(savedItem.data().quantity ?? 0) : 0
    const requestedQuantity = Number(item.quantity ?? 1)
    const maxQuantity = Number(item.stock ?? Infinity)
    const quantity = Math.min(savedQuantity + requestedQuantity, maxQuantity)

    transaction.set(itemRef, {
      ...item,
      quantity,
      updatedAt: serverTimestamp(),
      ...(savedItem.exists() ? {} : { createAt: serverTimestamp() }),
    }, { merge: true })
  })
}

export const deleteCartItem = (userId, itemId) => deleteDoc(doc(db, 'carts', userId, 'items', itemId))

export const updateCartItemQuantity = (userId, itemId, quantity) => (
  updateDoc(doc(db, 'carts', userId, 'items', itemId), {
    quantity,
    updatedAt: serverTimestamp(),
  })
)
