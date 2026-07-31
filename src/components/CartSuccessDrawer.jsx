import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteCartItem, getCartItems, updateCartItemQuantity } from '../firebase/cartApi'
import { auth } from '../firebase/firebase'
import { useAuthStore } from '../store/authStore'
import styles from './CartSuccessDrawer.module.scss'

const CartSuccessDrawer = ({ isOpen, onClose }) => {
  const user = useAuthStore((state) => state.user)
  const [cartItems, setCartItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [updatingItemId, setUpdatingItemId] = useState('')
  const [isClearing, setIsClearing] = useState(false)

  const getCartUserId = () => user?.uid || auth.currentUser?.uid

  useEffect(() => {
    if (!isOpen) return undefined

    const cartUserId = getCartUserId()
    if (!cartUserId) {
      setCartItems([])
      setErrorMessage('장바구니 정보를 확인할 수 없습니다.')
      return undefined
    }

    let isActive = true
    setIsLoading(true)
    setErrorMessage('')

    getCartItems(cartUserId)
      .then((items) => {
        if (isActive) setCartItems(items)
      })
      .catch(() => {
        if (isActive) setErrorMessage('장바구니 상품을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [isOpen, user?.uid])

  useEffect(() => {
    if (!isOpen) return undefined

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const totalQuantity = useMemo(
    () => cartItems.reduce((total, item) => total + Number(item.quantity ?? 1), 0),
    [cartItems],
  )
  const totalPrice = useMemo(
    () => cartItems.reduce((total, item) => total + Number(item.price ?? 0) * Number(item.quantity ?? 1), 0),
    [cartItems],
  )

  const changeQuantity = async (item, nextQuantity) => {
    const cartUserId = getCartUserId()
    if (!cartUserId) return

    const maxQuantity = Number(item.stock ?? Infinity)
    const quantity = Math.min(Math.max(nextQuantity, 1), maxQuantity)
    if (quantity === Number(item.quantity ?? 1)) return

    setErrorMessage('')
    setUpdatingItemId(item.id)

    try {
      await updateCartItemQuantity(cartUserId, item.id, quantity)
      setCartItems((items) => items.map((cartItem) => (
        cartItem.id === item.id ? { ...cartItem, quantity } : cartItem
      )))
    } catch {
      setErrorMessage('수량을 변경하지 못했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setUpdatingItemId('')
    }
  }

  const removeItem = async (item) => {
    const cartUserId = getCartUserId()
    if (!cartUserId || !window.confirm(`${item.name} 상품을 장바구니에서 삭제하시겠습니까?`)) return

    setErrorMessage('')
    setUpdatingItemId(item.id)

    try {
      await deleteCartItem(cartUserId, item.id)
      setCartItems((items) => items.filter((cartItem) => cartItem.id !== item.id))
    } catch {
      setErrorMessage('상품을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setUpdatingItemId('')
    }
  }

  const clearCart = async () => {
    const cartUserId = getCartUserId()
    if (!cartUserId || cartItems.length === 0 || !window.confirm('장바구니 상품을 모두 삭제하시겠습니까?')) return

    setErrorMessage('')
    setIsClearing(true)

    try {
      await Promise.all(cartItems.map((item) => deleteCartItem(cartUserId, item.id)))
      setCartItems([])
    } catch {
      setErrorMessage('장바구니 상품을 모두 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsClearing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.cartDrawerLayer} role="presentation">
      <button type="button" className={styles.cartDrawerBackdrop} aria-label="장바구니 안내 닫기" onClick={onClose} />
      <aside className={styles.cartDrawer} role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
        <button type="button" className={styles.cartDrawerClose} aria-label="장바구니 안내 닫기" onClick={onClose}>×</button>
        <div className={styles.cartDrawerContent}>
          <p>장바구니에 담았습니다.</p>
          <div className={styles.cartDrawerHeading}>
            <h2 id="cart-drawer-title">장바구니 상품</h2>
            {!isLoading && !errorMessage && (
              <div>
                <span>총 {totalQuantity}개</span>
                <button type="button" onClick={clearCart} disabled={cartItems.length === 0 || isClearing}>
                  {isClearing ? '삭제 중' : '전체 삭제'}
                </button>
              </div>
            )}
          </div>
          {isLoading && <p className={styles.statusMessage}>장바구니 상품을 불러오는 중입니다.</p>}
          {errorMessage && <p className={styles.errorMessage} role="alert">{errorMessage}</p>}
          {!isLoading && !errorMessage && (
            <div className={styles.cartDrawerList}>
              {cartItems.length === 0 && <p className={styles.emptyMessage}>장바구니에 담긴 상품이 없습니다.</p>}
              {cartItems.map((item) => (
                <div key={item.id} className={styles.cartDrawerItem}>
                  <img src={item.image} alt={item.name} />
                  <div>
                    <strong>{item.name}</strong>
                    <div className={styles.itemControls}>
                      <div className={styles.quantityControl} aria-label={`${item.name} 수량 조절`}>
                        <button
                          type="button"
                          onClick={() => changeQuantity(item, Number(item.quantity ?? 1) - 1)}
                          disabled={Number(item.quantity ?? 1) <= 1 || updatingItemId === item.id || isClearing}
                          aria-label={`${item.name} 수량 감소`}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => changeQuantity(item, Number(item.quantity ?? 1) + 1)}
                          disabled={Number(item.quantity ?? 1) >= Number(item.stock ?? Infinity) || updatingItemId === item.id || isClearing}
                          aria-label={`${item.name} 수량 증가`}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => removeItem(item)}
                        disabled={updatingItemId === item.id || isClearing}
                      >
                        삭제
                      </button>
                    </div>
                    <b>{(Number(item.price ?? 0) * Number(item.quantity ?? 1)).toLocaleString()}원</b>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!isLoading && !errorMessage && (
            <div className={styles.cartDrawerTotal}>
              <span>상품 합계</span>
              <strong>{totalPrice.toLocaleString()}원</strong>
            </div>
          )}
        </div>
        <div className={styles.cartDrawerActions}>
          <Link to="/cart" onClick={onClose}>장바구니 가기</Link>
          <Link className={styles.directPurchaseLink} to="/cart" onClick={onClose}>바로 구매하기</Link>
        </div>
      </aside>
    </div>
  )
}

export default CartSuccessDrawer
