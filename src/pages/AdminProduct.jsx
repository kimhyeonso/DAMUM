import { useEffect, useState } from 'react'
import { createProduct, DEFAULT_LOW_STOCK_THRESHOLD, deleteProduct, getProducts, migrateProductsFromJson, updateProduct, updateProductRecommendation, updateProductStock } from '../firebase/productApi'
import { getFirebaseErrorCode, getFirebaseErrorMessage } from '../utils/firebaseError'
import styles from './AdminProduct.module.scss'

const initialForm = {
  name: '',
  category: '',
  categoryValue: '',
  price: '',
  discountRate: '0',
  stock: '',
  lowStockThreshold: String(DEFAULT_LOW_STOCK_THRESHOLD),
  image: '',
  description: '',
  isRecommended: false,
}

const toFormData = (product) => ({
  name: product.name ?? '',
  category: product.category ?? '',
  categoryValue: product.categoryValue ?? '',
  price: String(product.price ?? ''),
  discountRate: String(product.discountRate ?? 0),
  stock: String(product.stock ?? ''),
  lowStockThreshold: String(product.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD),
  image: product.image ?? '',
  description: product.description ?? '',
  isRecommended: Boolean(product.isRecommended),
})

const parseNonNegativeNumber = (value) => {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : null
}

const getStockStatus = (product) => {
  const stock = Number(product.stock ?? 0)
  const lowStockThreshold = Number(product.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD)

  if (stock === 0) return { label: '품절', className: 'soldOut' }
  if (stock <= lowStockThreshold) return { label: '재고 부족', className: 'lowStock' }
  return { label: '재고 충분', className: 'inStock' }
}

const AdminProduct = () => {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJsonFallback, setIsJsonFallback] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [stockDrafts, setStockDrafts] = useState({})
  const [savingStockId, setSavingStockId] = useState(null)
  const [discountDrafts, setDiscountDrafts] = useState({})
  const [savingDiscountId, setSavingDiscountId] = useState(null)
  const [updatingRecommendationId, setUpdatingRecommendationId] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadProducts = async () => {
    setIsLoading(true)
    setError('')

    try {
      const firestoreProducts = await getProducts()

      if (firestoreProducts.length > 0) {
        setProducts(firestoreProducts)
        setIsJsonFallback(false)
        setStockDrafts(Object.fromEntries(firestoreProducts.map((product) => [product.id, String(product.stock ?? 0)])))
        setDiscountDrafts(Object.fromEntries(firestoreProducts.map((product) => [product.id, String(product.discountRate ?? 0)])))
      } else {
        const response = await fetch('/data/products.json')
        if (!response.ok) throw new Error('상품 JSON 조회 실패')

        const jsonProducts = await response.json()
        setProducts(jsonProducts)
        setIsJsonFallback(true)
        setStockDrafts(Object.fromEntries(jsonProducts.map((product) => [product.id, String(product.stock ?? 0)])))
        setDiscountDrafts(Object.fromEntries(jsonProducts.map((product) => [product.id, String(product.discountRate ?? 0)])))
      }
    } catch (loadError) {
      setProducts([])
      setIsJsonFallback(false)
      setError(`상품 목록을 불러오지 못했습니다. ${getFirebaseErrorMessage(loadError)} (오류 코드: ${getFirebaseErrorCode(loadError)})`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const resetForm = () => {
    setForm(initialForm)
    setEditingId(null)
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target

    if ((name === 'stock' || name === 'lowStockThreshold') && !/^\d*$/.test(value)) {
      setError('재고와 재고 부족 기준은 음수나 소수 없이 0 이상의 정수만 입력할 수 있습니다.')
      return
    }

    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    const price = parseNonNegativeNumber(form.price)
    const discountRate = parseNonNegativeNumber(form.discountRate)
    const stock = parseNonNegativeNumber(form.stock)
    const lowStockThreshold = parseNonNegativeNumber(form.lowStockThreshold)

    if (!form.name.trim() || !form.category.trim() || !form.categoryValue.trim() || !form.description.trim()) {
      setError('상품명, 카테고리명, 카테고리 값, 설명을 입력해주세요.')
      return
    }

    if (price === null || discountRate === null || discountRate > 100 || stock === null || lowStockThreshold === null || !Number.isInteger(stock) || !Number.isInteger(lowStockThreshold)) {
      setError('가격·재고·재고 부족 기준은 0 이상의 정수, 할인율은 0~100 사이의 숫자로 입력해주세요.')
      return
    }

    if (!form.image.trim()) {
      setError('대표 이미지 URL을 입력해주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      const image = form.image.trim()
      const productData = {
        name: form.name.trim(),
        category: form.category.trim(),
        categoryValue: form.categoryValue.trim(),
        price,
        discountRate,
        stock,
        lowStockThreshold,
        image,
        description: form.description.trim(),
        isRecommended: form.isRecommended,
      }

      if (editingId) {
        await updateProduct(editingId, productData)
        setProducts((currentProducts) => currentProducts.map((product) => (
          product.id === editingId ? { ...product, ...productData } : product
        )))
        setStockDrafts((currentDrafts) => ({ ...currentDrafts, [editingId]: String(stock) }))
        setDiscountDrafts((currentDrafts) => ({ ...currentDrafts, [editingId]: String(discountRate) }))
        setMessage('상품 정보를 수정했습니다.')
      } else {
        const productId = await createProduct(productData)
        setProducts((currentProducts) => [{ id: productId, ...productData }, ...currentProducts])
        setStockDrafts((currentDrafts) => ({ ...currentDrafts, [productId]: String(stock) }))
        setDiscountDrafts((currentDrafts) => ({ ...currentDrafts, [productId]: String(discountRate) }))
        setMessage('상품을 등록했습니다.')
      }

      resetForm()
    } catch (submitError) {
      const action = editingId ? '수정' : '등록'
      setError(`상품을 ${action}하지 못했습니다. ${getFirebaseErrorMessage(submitError)} (오류 코드: ${getFirebaseErrorCode(submitError)})`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (product) => {
    setError('')
    setMessage('')
    setEditingId(product.id)
    setForm(toFormData(product))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`'${product.name}' 상품을 삭제하시겠습니까?`)) return

    setError('')
    setMessage('')

    try {
      await deleteProduct(product.id)
      setProducts((currentProducts) => currentProducts.filter((item) => item.id !== product.id))
      if (editingId === product.id) resetForm()
      setMessage(`'${product.name}' 상품을 삭제했습니다.`)
    } catch (deleteError) {
      setError(`상품을 삭제하지 못했습니다. ${getFirebaseErrorMessage(deleteError)} (오류 코드: ${getFirebaseErrorCode(deleteError)})`)
    }
  }

  const handleStockDraftChange = (productId, value) => {
    if (!/^\d*$/.test(value)) {
      setError('재고는 음수나 소수 없이 0 이상의 정수만 입력할 수 있습니다.')
      return
    }

    setError('')
    setStockDrafts((currentDrafts) => ({ ...currentDrafts, [productId]: value }))
  }

  const handleStockSave = async (product) => {
    const stockValue = stockDrafts[product.id] ?? ''

    if (!/^\d+$/.test(stockValue)) {
      setError('재고는 0 이상의 정수만 입력한 뒤 저장해주세요.')
      return
    }

    const stock = Number(stockValue)
    setSavingStockId(product.id)
    setError('')
    setMessage('')

    try {
      await updateProductStock(product.id, stock)
      setProducts((currentProducts) => currentProducts.map((item) => (
        item.id === product.id ? { ...item, stock } : item
      )))
      setMessage(`'${product.name}' 상품의 재고를 ${stock}개로 저장했습니다.`)
    } catch (stockError) {
      setError(`재고를 저장하지 못했습니다. ${getFirebaseErrorMessage(stockError)} (오류 코드: ${getFirebaseErrorCode(stockError)})`)
    } finally {
      setSavingStockId(null)
    }
  }

  const handleDiscountDraftChange = (productId, value) => {
    if (!/^\d*$/.test(value) || (value !== '' && Number(value) > 100)) {
      setError('할인율은 0부터 100 사이의 정수만 입력할 수 있습니다.')
      return
    }

    setError('')
    setDiscountDrafts((currentDrafts) => ({ ...currentDrafts, [productId]: value }))
  }

  const handleDiscountSave = async (product) => {
    const discountValue = discountDrafts[product.id] ?? ''

    if (!/^\d+$/.test(discountValue) || Number(discountValue) > 100) {
      setError('할인율은 0부터 100 사이의 정수로 저장해주세요.')
      return
    }

    const discountRate = Number(discountValue)
    setSavingDiscountId(product.id)
    setError('')
    setMessage('')

    try {
      await updateProduct(product.id, { discountRate })
      setProducts((currentProducts) => currentProducts.map((item) => (
        item.id === product.id ? { ...item, discountRate } : item
      )))
      setMessage(`'${product.name}' 상품의 할인율을 ${discountRate}%로 저장했습니다.`)
    } catch (discountError) {
      setError(`할인율을 저장하지 못했습니다. ${getFirebaseErrorMessage(discountError)} (오류 코드: ${getFirebaseErrorCode(discountError)})`)
    } finally {
      setSavingDiscountId(null)
    }
  }

  const handleRecommendationToggle = async (product) => {
    const isRecommended = !Boolean(product.isRecommended)
    setError('')
    setMessage('')
    setUpdatingRecommendationId(product.id)

    try {
      await updateProductRecommendation(product.id, isRecommended)
      setProducts((currentProducts) => currentProducts.map((item) => (
        item.id === product.id ? { ...item, isRecommended } : item
      )))
      setMessage(`'${product.name}' 상품을 ${isRecommended ? '추천 상품으로 설정' : '추천 상품에서 해제'}했습니다.`)
    } catch (recommendationError) {
      setError(`추천 상태를 변경하지 못했습니다. ${getFirebaseErrorMessage(recommendationError)} (오류 코드: ${getFirebaseErrorCode(recommendationError)})`)
    } finally {
      setUpdatingRecommendationId(null)
    }
  }

  const handleMigration = async () => {
    if (!window.confirm('products.json의 기존 상품을 Firestore로 한 번만 이전하시겠습니까? 이미 등록된 Firestore 상품은 변경되지 않습니다.')) return

    setError('')
    setMessage('')
    setIsMigrating(true)

    try {
      const response = await fetch('/data/products.json')
      if (!response.ok) throw new Error('상품 JSON 조회 실패')

      const jsonProducts = await response.json()
      const result = await migrateProductsFromJson(jsonProducts)

      if (result.status === 'exists') {
        setMessage(`Firestore에 이미 ${result.count}개의 상품이 있어 마이그레이션하지 않았습니다.`)
      } else {
        setMessage(`${result.migratedCount}개의 상품을 Firestore로 이전했습니다.`)
        await loadProducts()
      }
    } catch (migrationError) {
      setError(`상품 마이그레이션에 실패했습니다. ${getFirebaseErrorMessage(migrationError)} (오류 코드: ${getFirebaseErrorCode(migrationError)})`)
    } finally {
      setIsMigrating(false)
    }
  }

  return (
    <section className={styles.adminProduct}>
      <div className={styles.pageHeader}>
        <div>
          <p>PRODUCTS</p>
          <h2>상품 관리 · 재고 관리</h2>
          <span>상품 등록, 수정, 삭제와 추천 상품 설정을 관리합니다.</span>
        </div>
        <button type="button" className={styles.migrationButton} onClick={handleMigration} disabled={isMigrating}>
          {isMigrating ? '마이그레이션 중...' : 'JSON 상품 마이그레이션'}
        </button>
      </div>

      <form className={styles.productForm} onSubmit={handleSubmit}>
        <div className={styles.formTitle}>
          <h3>{editingId ? '상품 수정' : '상품 등록'}</h3>
          {editingId && <button type="button" onClick={resetForm}>등록으로 전환</button>}
        </div>
        <div className={styles.formGrid}>
          <label>
            <span>상품명</span>
            <input name="name" value={form.name} onChange={handleChange} />
          </label>
          <label>
            <span>카테고리명</span>
            <input name="category" value={form.category} onChange={handleChange} placeholder="예: 접시" />
          </label>
          <label>
            <span>카테고리 값</span>
            <input name="categoryValue" value={form.categoryValue} onChange={handleChange} placeholder="예: plates" />
          </label>
          <label>
            <span>가격</span>
            <input type="number" name="price" min="0" value={form.price} onChange={handleChange} />
          </label>
          <label>
            <span>할인율</span>
            <input type="number" name="discountRate" min="0" max="100" value={form.discountRate} onChange={handleChange} />
          </label>
          <label>
            <span>재고</span>
            <input type="text" inputMode="numeric" name="stock" value={form.stock} onChange={handleChange} />
          </label>
          <label>
            <span>재고 부족 기준</span>
            <input type="text" inputMode="numeric" name="lowStockThreshold" value={form.lowStockThreshold} onChange={handleChange} />
          </label>
          <label className={styles.fullWidth}>
            <span>대표 이미지 URL</span>
            <input name="image" value={form.image} onChange={handleChange} placeholder="/img/products/product-main.jpg 또는 외부 이미지 URL" />
          </label>
          <label className={styles.fullWidth}>
            <span>설명</span>
            <textarea name="description" value={form.description} onChange={handleChange} rows="4" />
          </label>
          <label className={`${styles.recommendedField} ${styles.fullWidth}`}>
            <input type="checkbox" name="isRecommended" checked={form.isRecommended} onChange={handleChange} />
            <span>추천 상품으로 표시</span>
          </label>
        </div>
        <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : editingId ? '상품 수정 저장' : '상품 등록'}
        </button>
      </form>

      {error && <p className={styles.errorMessage} role="alert">{error}</p>}
      {message && <p className={styles.successMessage} role="status">{message}</p>}

      <section className={styles.listSection}>
        <div className={styles.listHeading}>
          <h3>등록 상품</h3>
          <span>{isJsonFallback ? 'JSON 원본 · ' : ''}총 {products.length}개</span>
        </div>
        {isLoading && <p className={styles.statusMessage}>상품 목록을 불러오는 중입니다.</p>}
        {!isLoading && !error && isJsonFallback && (
          <p className={styles.statusMessage}>Firestore 등록 전 products.json 원본 상품입니다. 상단의 JSON 상품 마이그레이션을 실행하면 등록 상품으로 이전됩니다.</p>
        )}
        {!isLoading && !error && !isJsonFallback && products.length === 0 && <p className={styles.statusMessage}>등록된 Firestore 상품이 없습니다.</p>}
        {!isLoading && products.length > 0 && (
          <div className={styles.productList}>
            {products.map((product) => (
              <article key={product.id} className={styles.productItem}>
                <img src={product.image} alt="" />
                <div className={styles.productInfo}>
                  <h4>{product.name || '상품명 없음'}</h4>
                  <p>{product.category || '-'} · {product.categoryValue || '-'}</p>
                  <span>{Number(product.price ?? 0).toLocaleString()}원 · 현재 재고 {product.stock ?? 0}개</span>
                </div>
                {!isJsonFallback && (
                  <div className={styles.inventoryControls}>
                    <div className={styles.stockControl}>
                      <label htmlFor={`stock-${product.id}`}>재고</label>
                      <input
                        id={`stock-${product.id}`}
                        type="text"
                        inputMode="numeric"
                        value={stockDrafts[product.id] ?? ''}
                        onChange={(event) => handleStockDraftChange(product.id, event.target.value)}
                      />
                      <button type="button" onClick={() => handleStockSave(product)} disabled={savingStockId === product.id}>
                        {savingStockId === product.id ? '저장 중' : '저장'}
                      </button>
                    </div>
                    <div className={styles.discountControl}>
                      <label htmlFor={`discount-${product.id}`}>할인율(%)</label>
                      <input
                        id={`discount-${product.id}`}
                        type="text"
                        inputMode="numeric"
                        value={discountDrafts[product.id] ?? ''}
                        onChange={(event) => handleDiscountDraftChange(product.id, event.target.value)}
                      />
                      <button type="button" onClick={() => handleDiscountSave(product)} disabled={savingDiscountId === product.id}>
                        {savingDiscountId === product.id ? '저장 중' : '저장'}
                      </button>
                    </div>
                  </div>
                )}
                <div className={styles.actions}>
                  <span className={isJsonFallback ? styles.notRecommended : product.isRecommended ? styles.recommended : styles.notRecommended}>
                    {isJsonFallback ? 'JSON' : product.isRecommended ? '추천' : '일반'}
                  </span>
                  <span className={styles[getStockStatus(product).className]}>{getStockStatus(product).label}</span>
                  {isJsonFallback ? (
                    <button type="button" onClick={handleMigration}>Firestore 등록</button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleRecommendationToggle(product)}
                        disabled={updatingRecommendationId === product.id}
                      >
                        {updatingRecommendationId === product.id
                          ? '변경 중...'
                          : product.isRecommended ? '추천 해제' : '추천'}
                      </button>
                      <button type="button" onClick={() => handleEdit(product)}>수정</button>
                      <button type="button" className={styles.deleteButton} onClick={() => handleDelete(product)}>삭제</button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}

export default AdminProduct
