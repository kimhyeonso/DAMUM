import { useEffect, useState } from 'react'
import { DELIVERY_FEE, FREE_DELIVERY_MINIMUM } from '../constants/delivery'
import { deleteCartItem, getCartItems, updateCartItemQuantity } from '../firebase/cartApi'
import CartItem from '../components/CartItem'
import OrderSummary from '../components/OrderSummary'
import EmptyMessage from '../components/EmptyMessage'
import { useAuthStore } from '../store/authStore'
import styles from './Cart.module.scss'

const Cart = () => {
  const user = useAuthStore((state) => state.user)
  const [cartItems, setCartItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [updatingItemId, setUpdatingItemId] = useState('')

  useEffect(() => {
    let isActive = true

    const loadCartItems = async () => {
      if (!user?.uid) return

      setIsLoading(true)
      setErrorMessage('')

      try {
        const items = await getCartItems(user.uid)
        if (isActive) setCartItems(items)
      } catch {
        if (isActive) setErrorMessage('장바구니를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadCartItems()

    return () => {
      isActive = false
    }
  }, [user?.uid])

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const deliveryFee = subtotal === 0 || subtotal >= FREE_DELIVERY_MINIMUM ? 0 : DELIVERY_FEE
  const totalPrice = subtotal + deliveryFee

  const clearCart = async () => {
    if (!window.confirm('장바구니 상품을 모두 삭제하시겠습니까?')) return

    setErrorMessage('')
    setUpdatingItemId('all')

    try {
      await Promise.all(cartItems.map((item) => deleteCartItem(user.uid, item.id)))
      setCartItems([])
    } catch {
      setErrorMessage('장바구니 상품을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setUpdatingItemId('')
    }
  }

  const changeQuantity = async (productId, newQuantity) => {
    const cartItem = cartItems.find((item) => String(item.id) === String(productId))
    if (!cartItem) return

    const maxQuantity = Number(cartItem.stock ?? Infinity)
    const quantity = Math.min(Math.max(newQuantity, 1), maxQuantity)
    if (quantity === cartItem.quantity) return

    setErrorMessage('')
    setUpdatingItemId(cartItem.id)

    try {
      await updateCartItemQuantity(user.uid, cartItem.id, quantity)
      setCartItems((items) => items.map((item) => (
        item.id === cartItem.id ? { ...item, quantity } : item
      )))
    } catch {
      setErrorMessage('수량을 변경하지 못했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setUpdatingItemId('')
    }
  }

  const removeItem = async (productId) => {
    const cartItem = cartItems.find((item) => String(item.id) === String(productId))
    if (!cartItem || !window.confirm(`${cartItem.name ?? cartItem.productName ?? '선택한'} 상품을 삭제하시겠습니까?`)) return

    setErrorMessage('')
    setUpdatingItemId(cartItem.id)

    try {
      await deleteCartItem(user.uid, cartItem.id)
      setCartItems((items) => items.filter((item) => item.id !== cartItem.id))
    } catch {
      setErrorMessage('장바구니 상품을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setUpdatingItemId('')
    }
  }

  const orderCart = () => {
    window.alert('주문 페이지는 다음 단계에서 연결합니다')
  }

  return (
    <section className={styles.cart}>
      <header className={styles.cartHeading}>
        <p>CART</p>
        <h1>장바구니</h1>
        <span>담은 상품 {cartItems.length}개</span>
      </header>

      {isLoading && <p className={styles.statusMessage} role="status">장바구니를 불러오고 있습니다.</p>}
      {errorMessage && <p className={styles.errorMessage} role="alert">{errorMessage}</p>}
      {!isLoading && !errorMessage && cartItems.length === 0 ? (
        <EmptyMessage
          title="장바구니가 비어있습니다"
          description="마음에 드는 상품을 장바구니에 담아보세요"
          actionLabel="상품 둘러보기"
          actionTo="/products"
        />
      ) : !isLoading && !errorMessage && (
        <div className={styles.cartContent}>
          <div className={styles.itemArea}>
            <div className={styles.itemAreaHeader}>
              <strong>장바구니 상품</strong>
              <button type="button" onClick={clearCart} disabled={updatingItemId === 'all'}>전체 삭제</button>
            </div>
            <div className={styles.itemList}>
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onChangeQuantity={changeQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>
          </div>

          <OrderSummary
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            totalPrice={totalPrice}
            onOrder={orderCart}
          />
        </div>
      )}
    </section>
  )
}

export default Cart
