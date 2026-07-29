import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { auth } from '../firebase/firebase'
import { addWishlistItem, deleteWishlistItem, isWishlistItem } from '../firebase/wishlistApi'
import { useAuthStore } from '../store/authStore'
import styles from './ProductCard.module.scss'

const ProductCard = ({product, variant}) => {
  const [isLiked, setIsLiked] = useState(false)
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)
  const user = useAuthStore((state) => state.user)

  const disPrice = product.price - ((product.price * product.discountRate) / 100 )
  const isSoldOut = Number(product.stock) <= 0

  useEffect(() => {
    let isActive = true

    const loadWishlistState = async () => {
      const wishlistUserId = user?.uid || auth.currentUser?.uid

      if (!wishlistUserId) {
        if (isActive) setIsLiked(false)
        return
      }

      try {
        const liked = await isWishlistItem(wishlistUserId, product.id)
        if (isActive) setIsLiked(liked)
      } catch {
        if (isActive) setIsLiked(false)
      }
    }

    loadWishlistState()

    return () => {
      isActive = false
    }
  }, [product.id, user?.uid])

  const changeWish = async () => {
    const wishlistUserId = user?.uid || auth.currentUser?.uid
    if (!wishlistUserId) {
      window.alert('찜은 로그인 후 이용할 수 있습니다.')
      return
    }

    setIsWishlistLoading(true)

    try {
      if (isLiked) {
        await deleteWishlistItem(wishlistUserId, product.id)
        setIsLiked(false)
      } else {
        await addWishlistItem(wishlistUserId, {
          ...product,
          price: disPrice,
        })
        setIsLiked(true)
      }
    } catch {
      window.alert('찜한 상품을 저장하지 못했습니다. 보안 규칙과 로그인 상태를 확인해주세요.')
    } finally {
      setIsWishlistLoading(false)
    }
  }

  return (
    <article className={`${styles.productCard} ${variant === 'catalog' ? styles.catalog : ''}`}>
      <Link className={styles.imageLink} to={`/products/${product.id}`}>
        <div className={styles.imageWrap}>
          <img src={product.image} alt={product.name} />
          {isSoldOut && <span className={styles.soldOutBadge}>품절</span>}
        </div>
      </Link>

      <button
        type="button"
        onClick={changeWish}
        disabled={isWishlistLoading}
        aria-label={isLiked ? `${product.name} 찜 취소` : `${product.name} 찜하기`}
      >
        {isLiked ? '♥' : '♡'}
      </button>

      <div className={styles.productInfo}>
        <Link className={styles.productName} to={`/products/${product.id}`}>
          {product.name}
        </Link>
        <p>{product.category} · 베스트 셀렉션</p>
        {
          product.discountRate > 0 && (<span> {product.discountRate}% </span>)
        }
        {isSoldOut && <em className={styles.soldOutText}>품절</em>}
        <strong>{disPrice.toLocaleString()}원</strong>
      </div>
    </article>
  )
}

export default ProductCard
