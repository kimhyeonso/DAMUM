import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'

const getWishlistItemsCollection = (userId) => collection(db, 'wishlists', userId, 'items')
const getWishlistItemRef = (userId, productId) => doc(db, 'wishlists', userId, 'items', String(productId))

export const getWishlistItems = async (userId) => {
  const snapshot = await getDocs(getWishlistItemsCollection(userId))
  return snapshot.docs.map((item) => ({ ...item.data(), id: item.id }))
}

export const subscribeToWishlistCount = (userId, callback, onError) => onSnapshot(
  getWishlistItemsCollection(userId),
  (snapshot) => callback(snapshot.size),
  onError,
)

export const isWishlistItem = async (userId, productId) => {
  const snapshot = await getDoc(getWishlistItemRef(userId, productId))
  return snapshot.exists()
}

export const addWishlistItem = (userId, product) => (
  setDoc(getWishlistItemRef(userId, product.id), {
    productId: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    createAt: serverTimestamp(),
  })
)

export const deleteWishlistItem = (userId, productId) => deleteDoc(getWishlistItemRef(userId, productId))
