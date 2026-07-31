import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import QuantityControl from '../components/QuantityControl'
import CartSuccessDrawer from '../components/CartSuccessDrawer'
import ProductDescription from '../components/ProductDescription'
import { addCartItem } from '../firebase/cartApi'
import { auth } from '../firebase/firebase'
import { addWishlistItem, deleteWishlistItem, isWishlistItem } from '../firebase/wishlistApi'
import { useAuthStore } from '../store/authStore'
import { getCatalogProduct } from '../firebase/productApi'
import styles from './ProductDetail.module.scss'

const ProductDetail = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState('')
  const [isLiked, setIsLiked] = useState(false)
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)
  const [cartMessage, setCartMessage] = useState('')
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false)
  const [wishlistMessage, setWishlistMessage] = useState('')
  const [showFloatingPurchase, setShowFloatingPurchase] = useState(false)
  const purchaseAreaRef = useRef(null)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    const loadProduct = async () => {
      const selectedProduct = await getCatalogProduct(id)

      setProduct(selectedProduct || null)
      setQuantity(1)
      setSelectedImage(selectedProduct?.image || '')
      setIsLoading(false)
    }

    loadProduct()
  }, [id])

  useEffect(() => {
    let isActive = true

    const loadWishlistState = async () => {
      const wishlistUserId = user?.uid || auth.currentUser?.uid

      if (!wishlistUserId || !product?.id) {
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
  }, [product?.id, user?.uid])

  useEffect(() => {
    const updateFloatingPurchaseVisibility = () => {
      const purchaseArea = purchaseAreaRef.current

      if (!purchaseArea) return

      setShowFloatingPurchase(purchaseArea.getBoundingClientRect().bottom < 0)
    }

    updateFloatingPurchaseVisibility()
    window.addEventListener('scroll', updateFloatingPurchaseVisibility, { passive: true })

    return () => window.removeEventListener('scroll', updateFloatingPurchaseVisibility)
  }, [product?.id])

  if (isLoading) {
    return <p>상품을 불러오는 중입니다</p>
  }

  if (!product) {
    return (
      <>
        <p>상품을 찾을 수 없습니다</p>
        <Link to="/products">상품 목록으로 이동</Link>
      </>
    )
  }

  const discountedPrice = product.price - (product.price * product.discountRate) / 100
  const totalPrice = quantity * discountedPrice
  const images = [product.image, ...(product.detailImages || [])]
  const isSoldOut = Number(product.stock) <= 0

  const moveToPurchaseArea = () => {
    purchaseAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const addToCart = async () => {
    if (isSoldOut) {
      setCartMessage('품절된 상품은 장바구니에 담을 수 없습니다.')
      return
    }

    const cartUserId = user?.uid || auth.currentUser?.uid
    if (!cartUserId) {
      setCartMessage('장바구니는 로그인 후 이용할 수 있습니다.')
      return
    }

    try {
      await addCartItem(cartUserId, {
        productId: product.id,
        productName: product.name,
        name: product.name,
        category: product.category,
        price: discountedPrice,
        quantity,
        stock: product.stock,
        image: product.image,
      })
      setCartMessage('장바구니에 담았습니다. 마이페이지에서도 확인할 수 있습니다.')
      setIsCartDrawerOpen(true)
    } catch {
      setCartMessage('장바구니를 서버에 저장하지 못했습니다. 보안 규칙과 로그인 상태를 확인해주세요.')
    }
  }

  const toggleWishlist = async () => {
    const wishlistUserId = user?.uid || auth.currentUser?.uid
    if (!wishlistUserId) {
      setWishlistMessage('찜은 로그인 후 이용할 수 있습니다.')
      return
    }

    setWishlistMessage('')
    setIsWishlistLoading(true)

    try {
      if (isLiked) {
        await deleteWishlistItem(wishlistUserId, product.id)
        setIsLiked(false)
        setWishlistMessage('찜한 상품에서 삭제되었습니다.')
      } else {
        await addWishlistItem(wishlistUserId, {
          ...product,
          price: discountedPrice,
        })
        setIsLiked(true)
        setWishlistMessage('찜한 상품에 추가되었습니다.')
      }
    } catch {
      setWishlistMessage('찜한 상품을 저장하지 못했습니다. 보안 규칙과 로그인 상태를 확인해주세요.')
    } finally {
      setIsWishlistLoading(false)
    }
  }

  return (
    <section className={styles.productDetail}>
      <div className={styles.productContainer}>
        <Link className={styles.backLink} to="/products">상품 목록</Link>

        <div className={styles.productArea}>
          <div className={styles.imageGallery}>
            <div className={styles.imageArea}>
              <img src={selectedImage || product.image} alt={product.name} />
            </div>

            {images.length > 1 && (
              <div className={styles.thumbnailList} aria-label={`${product.name} 상품 이미지`}>
                {images.map((image, index) => (
                  <button
                    type="button"
                    key={image}
                    className={selectedImage === image ? styles.activeThumbnail : ''}
                    onClick={() => setSelectedImage(image)}
                    aria-label={`${product.name} 이미지 ${index + 1}`}
                  >
                    <img src={image} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.infoArea} ref={purchaseAreaRef}>
            <p className={styles.category}>{product.category}</p>
            <h1>{product.name}</h1>
            <p className={styles.description}>{product.description}</p>

            <div className={styles.priceArea}>
              {product.discountRate > 0 && <span className={styles.discountRate}>{product.discountRate}%</span>}
              <strong>{discountedPrice.toLocaleString()}원</strong>
              {product.discountRate > 0 && <del>{product.price.toLocaleString()}원</del>}
            </div>

            <div className={styles.quantityArea}>
              <div>
                <span>수량</span>
                <small className={isSoldOut ? styles.soldOutStatus : ''}>{isSoldOut ? '품절' : `재고 ${product.stock}개`}</small>
              </div>
              <QuantityControl quantity={quantity} setQuantity={setQuantity} maxQuantity={product.stock} disabled={isSoldOut} />
            </div>

            <div className={styles.totalArea}>
              <span>총 상품금액</span>
              <strong>{totalPrice.toLocaleString()}원</strong>
            </div>

            <div className={styles.actionArea}>
              <button
                type="button"
                className={`${styles.wishlistButton} ${isLiked ? styles.isLiked : ''}`}
                onClick={toggleWishlist}
                disabled={isWishlistLoading}
              >
                {
                  isLiked ? '♥ 찜완료' : '♡ 찜하기'
                }
              </button>
              <button type="button" className={styles.cartButton} onClick={addToCart} disabled={isSoldOut}>장바구니 담기</button>
              <button type="button" className={styles.purchaseButton} disabled={isSoldOut}>{isSoldOut ? '품절' : '구매하기'}</button>
            </div>
            {cartMessage && <p className={cartMessage.includes('담았습니다') ? styles.cartMessage : styles.cartError} role="status">{cartMessage}</p>}
            {wishlistMessage && <p className={wishlistMessage.includes('되었습니다') ? styles.cartMessage : styles.cartError} role="status">{wishlistMessage}</p>}
          </div>
        </div>

        <ProductDescription product={product} />
      </div>

      {showFloatingPurchase && (
        <aside className={styles.floatingPurchase} aria-label="상품 구매 바로가기">
          <div className={styles.floatingPurchaseInner}>
            <div className={styles.floatingProduct}>
              <img src={product.image} alt="" />
              <div>
                <strong>{product.name}</strong>
                <span>{product.category}</span>
              </div>
            </div>
            <button type="button" onClick={moveToPurchaseArea}>
              {isSoldOut ? '품절된 상품' : '구매하러 가기'}
            </button>
          </div>
        </aside>
      )}

      <CartSuccessDrawer isOpen={isCartDrawerOpen} onClose={() => setIsCartDrawerOpen(false)} />
    </section>
  )
}

export default ProductDetail
