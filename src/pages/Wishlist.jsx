import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyMessage from '../components/EmptyMessage'
import { deleteWishlistItem, getWishlistItems } from '../firebase/wishlistApi'
import { useAuthStore } from '../store/authStore'
import styles from './Wishlist.module.scss'

const Wishlist = () => {
  const user = useAuthStore((state) => state.user)
  const [wishlistItems, setWishlistItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [deletingItemId, setDeletingItemId] = useState('')

  useEffect(() => {
    let isActive = true

    const loadWishlistItems = async () => {
      if (!user?.uid) return

      setIsLoading(true)
      setErrorMessage('')

      try {
        const items = await getWishlistItems(user.uid)
        if (isActive) setWishlistItems(items)
      } catch {
        if (isActive) setErrorMessage('찜한 상품을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadWishlistItems()

    return () => {
      isActive = false
    }
  }, [user?.uid])

  const removeWishlistItem = async (item) => {
    const productName = item.name || item.productName || '선택한'
    if (!window.confirm(`${productName} 상품을 찜한 상품에서 삭제하시겠습니까?`)) return

    setErrorMessage('')
    setDeletingItemId(item.id)

    try {
      await deleteWishlistItem(user.uid, item.id)
      setWishlistItems((items) => items.filter((wishlistItem) => wishlistItem.id !== item.id))
    } catch {
      setErrorMessage('찜한 상품을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setDeletingItemId('')
    }
  }

  return (
    <section className={styles.wishlist}>
      <header className={styles.wishlistHeading}>
        <p>WISHLIST</p>
        <h1>찜한 상품</h1>
        <span>찜한 상품 {wishlistItems.length}개</span>
      </header>

      {isLoading && <p className={styles.statusMessage} role="status">찜한 상품을 불러오고 있습니다.</p>}
      {errorMessage && <p className={styles.errorMessage} role="alert">{errorMessage}</p>}
      {!isLoading && !errorMessage && wishlistItems.length === 0 ? (
        <EmptyMessage
          title="찜한 상품이 없습니다"
          description="관심 있는 상품을 찜해보세요"
        />
      ) : !isLoading && !errorMessage && (
        <div className={styles.itemArea}>
          <div className={styles.itemAreaHeader}>
            <strong>찜한 상품</strong>
            <span>상품을 클릭하면 상세 페이지로 이동합니다.</span>
          </div>
          <ul className={styles.itemList}>
            {wishlistItems.map((item) => {
              const productId = item.productId ?? item.id
              const productName = item.name || item.productName || '상품명 없음'

              return (
                <li key={item.id}>
                  <Link className={styles.imageLink} to={`/products/${productId}`}>
                    <img src={item.image} alt={productName} />
                  </Link>
                  <div className={styles.itemInfo}>
                    <Link to={`/products/${productId}`}>{productName}</Link>
                    <strong>{Number(item.price ?? 0).toLocaleString('ko-KR')}원</strong>
                  </div>
                  <button type="button" onClick={() => removeWishlistItem(item)} disabled={deletingItemId === item.id}>
                    {deletingItemId === item.id ? '삭제 중...' : '삭제'}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}

export default Wishlist
