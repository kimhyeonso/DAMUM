import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'
import { getCeramicCategoryValue } from '../constants/categories'

const products = collection(db, 'products')
export const DEFAULT_LOW_STOCK_THRESHOLD = 5

const toProduct = (item) => {
  const data = item.data()

  return {
    ...data,
    id: item.id,
    categoryValue: getCeramicCategoryValue(data.category, data.categoryValue),
  }
}

const toTime = (value) => {
  if (typeof value?.toMillis === 'function') return value.toMillis()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

const getJsonProducts = async () => {
  const response = await fetch('/data/products.json')
  if (!response.ok) throw new Error('상품 JSON을 불러오지 못했습니다.')
  return response.json()
}

const hasSameProductId = (firstId, secondId) => (
  String(firstId) === String(secondId)
  || (Number.isFinite(Number(firstId)) && Number(firstId) === Number(secondId))
)

const withJsonDetailDescriptionImage = (product, jsonProducts) => {
  const productKey = product.legacyId ?? product.id
  const jsonProduct = jsonProducts.find((item) => hasSameProductId(item.id, productKey))

  if (!jsonProduct?.detailDescriptionImage || product.detailDescriptionImage) return product

  return {
    ...product,
    detailDescriptionImage: jsonProduct.detailDescriptionImage,
  }
}

export const getProducts = async () => {
  const snapshot = await getDocs(products)
  return snapshot.docs.map(toProduct).sort((first, second) => toTime(second.createAt) - toTime(first.createAt))
}

export const getCatalogProducts = async () => {
  try {
    const firestoreProducts = await getProducts()
    if (firestoreProducts.length > 0) return firestoreProducts
  } catch {
    // 마이그레이션 전에도 기존 상품 화면을 유지하기 위해 JSON을 사용합니다.
  }

  return getJsonProducts()
}

export const getProduct = async (id) => {
  const item = await getDoc(doc(db, 'products', id))
  return item.exists() ? toProduct(item) : null
}

export const getCatalogProduct = async (id) => {
  const jsonProducts = await getJsonProducts()

  try {
    const firestoreProduct = await getProduct(id)
    if (firestoreProduct) return withJsonDetailDescriptionImage(firestoreProduct, jsonProducts)

    const firestoreProducts = await getProducts()
    const migratedProduct = firestoreProducts.find((item) => hasSameProductId(item.legacyId, id))
    if (migratedProduct) return withJsonDetailDescriptionImage(migratedProduct, jsonProducts)
  } catch {
    // 마이그레이션 전 기존 상세 페이지를 유지합니다.
  }

  return jsonProducts.find((item) => hasSameProductId(item.id, id)) || null
}

export const createProduct = async (data) => {
  const productRef = doc(products)
  await setDoc(productRef, {
    ...data,
    id: productRef.id,
    createAt: serverTimestamp(),
  })
  return productRef.id
}

export const updateProduct = (id, data) => updateDoc(doc(db, 'products', id), {
  ...data,
  updateAt: serverTimestamp(),
})

export const updateProductStock = (id, stock) => updateDoc(doc(db, 'products', id), {
  stock,
  updateAt: serverTimestamp(),
})

export const updateProductRecommendation = (id, isRecommended) => updateDoc(doc(db, 'products', id), {
  isRecommended,
  updateAt: serverTimestamp(),
})

export const deleteProduct = (id) => deleteDoc(doc(db, 'products', id))

export const migrateProductsFromJson = async (jsonProducts) => {
  const existingSnapshot = await getDocs(products)
  const migratedLegacyIds = new Set(
    existingSnapshot.docs
      .map((item) => item.data().legacyId)
      .filter((legacyId) => legacyId !== undefined && legacyId !== null),
  )
  const productsToMigrate = jsonProducts.filter((item) => !migratedLegacyIds.has(item.id))

  if (productsToMigrate.length === 0) {
    return { status: 'exists', count: existingSnapshot.size, migratedCount: 0 }
  }

  for (const jsonProduct of productsToMigrate) {
    const productRef = doc(products)
    const { id: legacyId, ...productData } = jsonProduct

    await setDoc(productRef, {
      ...productData,
      id: productRef.id,
      legacyId,
      isRecommended: Boolean(productData.isRecommended ?? legacyId <= 5),
      lowStockThreshold: productData.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD,
      createAt: serverTimestamp(),
    })
  }

  return { status: 'success', count: existingSnapshot.size + productsToMigrate.length, migratedCount: productsToMigrate.length }
}
