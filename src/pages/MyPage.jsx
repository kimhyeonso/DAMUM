import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { changePassword } from '../firebase/authApi'
import { deleteCartItem, getCartItems } from '../firebase/cartApi'
import { getOrdersByUser } from '../firebase/orderApi'
import { ensureUserProfile, getUser, updateUser } from '../firebase/userApi'
import { deleteWishlistItem, getWishlistItems } from '../firebase/wishlistApi'
import { getFirebaseErrorMessage } from '../utils/firebaseError'
import { isRequired, isValidPassword } from '../utils/validation'
import { useAuthStore } from '../store/authStore'
import styles from './MyPage.module.scss'

const formatKoreanDate = (value) => {
  if (!value) return '-'

  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

const formatPrice = (value) => `${Number(value ?? 0).toLocaleString('ko-KR')}원`

const getOrderProductName = (order) => {
  if (order.productName) return order.productName
  if (order.name) return order.name
  if (Array.isArray(order.items) && order.items.length > 0) {
    return order.items.length > 1 ? `${order.items[0].name} 외 ${order.items.length - 1}건` : order.items[0].name
  }

  return '상품명 없음'
}

const getOrderQuantity = (order) => {
  if (order.quantity !== undefined) return Number(order.quantity)
  if (Array.isArray(order.items)) return order.items.reduce((total, item) => total + Number(item.quantity ?? 1), 0)
  return 0
}

const getOrderAmount = (order) => {
  const savedAmount = order.totalPrice ?? order.totalAmount ?? order.orderAmount ?? order.amount
  if (savedAmount !== undefined) return Number(savedAmount)
  if (Array.isArray(order.items)) return order.items.reduce((total, item) => total + Number(item.price) * Number(item.quantity ?? 1), 0)
  return 0
}

const getCartProductName = (item) => item.productName || item.name || '상품명 없음'
const getCartPrice = (item) => Number(item.price ?? 0)
const getCartQuantity = (item) => Number(item.quantity ?? 1)
const getWishlistProductName = (item) => item.name || item.productName || '상품명 없음'
const getWishlistPrice = (item) => Number(item.price ?? 0)

const MyPage = () => {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const logout = useAuthStore((state) => state.logout)
  const [profile, setProfile] = useState(null)
  const [nickname, setNickname] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [editMessage, setEditMessage] = useState('')
  const [orders, setOrders] = useState([])
  const [isOrdersLoading, setIsOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState('')
  const [cartItems, setCartItems] = useState([])
  const [isCartLoading, setIsCartLoading] = useState(true)
  const [cartError, setCartError] = useState('')
  const [deletingCartItemId, setDeletingCartItemId] = useState('')
  const [isClearingCart, setIsClearingCart] = useState(false)
  const [wishlistItems, setWishlistItems] = useState([])
  const [isWishlistLoading, setIsWishlistLoading] = useState(true)
  const [wishlistError, setWishlistError] = useState('')
  const [deletingWishlistItemId, setDeletingWishlistItemId] = useState('')
  const [isClearingWishlist, setIsClearingWishlist] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    let isActive = true

    const loadProfile = async () => {
      if (!user?.uid) return

      setIsProfileLoading(true)
      setProfileError('')

      try {
        let userProfile = await getUser(user.uid)

        if (!userProfile) {
          const defaultNickname = user.nickname || user.email?.split('@')[0] || '새 회원'
          userProfile = await ensureUserProfile(user.uid, {
            email: user.email,
            nickname: defaultNickname,
          })
        }

        if (isActive) {
          setProfile(userProfile)
          setNickname(userProfile.nickname ?? '')
          const role = String(userProfile.role ?? '').trim().toLowerCase() === 'admin'
            ? 'admin'
            : 'user'
          setUser({ ...user, nickname: userProfile.nickname ?? '', role })
        }
      } catch {
        if (isActive) {
          setProfile(null)
          setProfileError('회원 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
        }
      } finally {
        if (isActive) setIsProfileLoading(false)
      }
    }

    loadProfile()

    return () => {
      isActive = false
    }
  }, [user?.uid])

  useEffect(() => {
    let isActive = true

    const loadWishlistItems = async () => {
      if (!user?.uid) return

      setIsWishlistLoading(true)
      setWishlistError('')

      try {
        const userWishlistItems = await getWishlistItems(user.uid)
        if (isActive) setWishlistItems(userWishlistItems)
      } catch {
        if (isActive) {
          setWishlistItems([])
          setWishlistError('찜한 상품을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
        }
      } finally {
        if (isActive) setIsWishlistLoading(false)
      }
    }

    loadWishlistItems()

    return () => {
      isActive = false
    }
  }, [user?.uid])

  useEffect(() => {
    let isActive = true

    const loadCartItems = async () => {
      if (!user?.uid) return

      setIsCartLoading(true)
      setCartError('')

      try {
        const userCartItems = await getCartItems(user.uid)
        if (isActive) setCartItems(userCartItems)
      } catch {
        if (isActive) {
          setCartItems([])
          setCartError('장바구니를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
        }
      } finally {
        if (isActive) setIsCartLoading(false)
      }
    }

    loadCartItems()

    return () => {
      isActive = false
    }
  }, [user?.uid])

  useEffect(() => {
    let isActive = true

    const loadOrders = async () => {
      if (!user?.uid) return

      setIsOrdersLoading(true)
      setOrdersError('')

      try {
        const userOrders = await getOrdersByUser(user.uid)
        if (isActive) setOrders(userOrders)
      } catch {
        if (isActive) {
          setOrders([])
          setOrdersError('주문 내역을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
        }
      } finally {
        if (isActive) setIsOrdersLoading(false)
      }
    }

    loadOrders()

    return () => {
      isActive = false
    }
  }, [user?.uid])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const trimmedNickname = nickname.trim()

    if (!isRequired(trimmedNickname)) {
      setEditMessage('닉네임을 입력해주세요.')
      return
    }

    if (newPassword && !isValidPassword(newPassword)) {
      setEditMessage('비밀번호는 8자 이상으로 입력해주세요.')
      return
    }

    setEditMessage('')
    setIsSaving(true)

    try {
      if (newPassword) {
        await changePassword(newPassword)
      }

      await updateUser(user.uid, { nickname: trimmedNickname })
      setProfile((current) => ({ ...current, nickname: trimmedNickname }))
      setUser({ ...user, nickname: trimmedNickname })
      setNewPassword('')
      setEditMessage('회원 정보가 수정되었습니다.')
      setIsEditModalOpen(false)
    } catch (error) {
      setEditMessage(getFirebaseErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  const handleCartItemDelete = async (item) => {
    const productName = getCartProductName(item)
    if (!window.confirm(`${productName} 상품을 장바구니에서 삭제하시겠습니까?`)) return

    setCartError('')
    setDeletingCartItemId(item.id)

    try {
      await deleteCartItem(user.uid, item.id)
      setCartItems((current) => current.filter((cartItem) => cartItem.id !== item.id))
    } catch {
      setCartError('장바구니 상품을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setDeletingCartItemId('')
    }
  }

  const handleWishlistItemDelete = async (item) => {
    const productName = getWishlistProductName(item)
    if (!window.confirm(`${productName} 상품을 찜한 상품에서 삭제하시겠습니까?`)) return

    setWishlistError('')
    setDeletingWishlistItemId(item.id)

    try {
      await deleteWishlistItem(user.uid, item.id)
      setWishlistItems((current) => current.filter((wishlistItem) => wishlistItem.id !== item.id))
    } catch {
      setWishlistError('찜한 상품을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setDeletingWishlistItemId('')
    }
  }

  const handleCartClear = async () => {
    if (cartItems.length === 0 || !window.confirm('장바구니 상품을 모두 삭제하시겠습니까?')) return

    setCartError('')
    setIsClearingCart(true)

    try {
      await Promise.all(cartItems.map((item) => deleteCartItem(user.uid, item.id)))
      setCartItems([])
    } catch {
      setCartError('장바구니 상품을 모두 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsClearingCart(false)
    }
  }

  const handleWishlistClear = async () => {
    if (wishlistItems.length === 0 || !window.confirm('찜한 상품을 모두 삭제하시겠습니까?')) return

    setWishlistError('')
    setIsClearingWishlist(true)

    try {
      await Promise.all(wishlistItems.map((item) => deleteWishlistItem(user.uid, item.id)))
      setWishlistItems([])
    } catch {
      setWishlistError('찜한 상품을 모두 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsClearingWishlist(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      const isLoggedOut = await logout()
      if (!isLoggedOut) throw new Error('logout failed')
    } catch {
      window.alert('로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const cartTotal = cartItems.reduce((total, item) => total + getCartPrice(item) * getCartQuantity(item), 0)

  return (
    <section className={styles.myPage}>
      <header className={styles.pageHeader}>
        <p>MY PAGE</p>
        <h1>마이페이지</h1>
        <span>회원 정보와 쇼핑 활동을 한곳에서 확인하세요.</span>
      </header>

      <div className={styles.dashboard}>
        <article className={`${styles.summaryCard} ${styles.memberCard}`}>
          <div className={styles.sectionHeading}>
            <div>
              <p>MEMBER</p>
              <h2>회원 정보</h2>
            </div>
          </div>
          {isProfileLoading && <p className={styles.statusMessage} role="status">회원 정보를 불러오고 있습니다.</p>}
          {profileError && <p className={styles.errorMessage} role="alert">{profileError}</p>}
          {!isProfileLoading && !profileError && (
            <dl className={styles.memberDetails}>
              <div><dt>닉네임</dt><dd>{profile.nickname}</dd></div>
              <div><dt>이메일</dt><dd>{profile.email}</dd></div>
              <div><dt>가입일</dt><dd>{formatKoreanDate(profile.createAt)}</dd></div>
            </dl>
          )}
          <div className={styles.memberActions}>
            <button type="button" onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
            </button>
            <button type="button" onClick={() => { setEditMessage(''); setIsEditModalOpen(true) }} disabled={isProfileLoading || Boolean(profileError)}>
              회원 정보 수정
            </button>
          </div>
        </article>

        <article className={styles.summaryCard}>
          <div className={styles.sectionHeading}>
            <div>
              <p>ORDER</p>
              <h2>주문 내역</h2>
            </div>
            <Link to="/products">상품 목록으로 이동 <span aria-hidden="true">→</span></Link>
          </div>
          {isOrdersLoading && <p className={styles.statusMessage} role="status">주문 내역을 불러오고 있습니다.</p>}
          {ordersError && <p className={styles.errorMessage} role="alert">{ordersError}</p>}
          {!isOrdersLoading && !ordersError && orders.length === 0 && (
            <p className={styles.emptyMessage}>아직 주문 내역이 없습니다.</p>
          )}
          {!isOrdersLoading && !ordersError && orders.length > 0 && (
            <ul className={styles.summaryList}>
              {orders.map((order) => (
                <li key={order.id}>
                  <strong>{getOrderProductName(order)}</strong>
                  <span>{formatKoreanDate(order.createAt)}</span>
                  <span>수량 {getOrderQuantity(order)}개</span>
                  <b>{formatPrice(getOrderAmount(order))}</b>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className={styles.summaryCard}>
          <div className={styles.sectionHeading}>
            <div>
              <p>CART</p>
              <h2>장바구니</h2>
            </div>
            <div className={styles.summaryActions}>
              <button type="button" onClick={handleCartClear} disabled={cartItems.length === 0 || isClearingCart}>
                {isClearingCart ? '삭제 중...' : '전체 삭제'}
              </button>
              <Link to="/cart">장바구니로 이동 <span aria-hidden="true">→</span></Link>
            </div>
          </div>
          {isCartLoading && <p className={styles.statusMessage} role="status">장바구니를 불러오고 있습니다.</p>}
          {cartError && <p className={styles.errorMessage} role="alert">{cartError}</p>}
          {!isCartLoading && !cartError && cartItems.length === 0 && (
            <p className={styles.emptyMessage}>장바구니가 비어 있습니다.</p>
          )}
          {!isCartLoading && !cartError && cartItems.length > 0 && (
            <>
              <ul className={styles.summaryList}>
                {cartItems.map((item) => {
                  const itemPrice = getCartPrice(item)
                  const itemQuantity = getCartQuantity(item)

                  return (
                    <li key={item.id}>
                      <strong>{getCartProductName(item)}</strong>
                      <span>가격 {formatPrice(itemPrice)}</span>
                      <span>수량 {itemQuantity}개</span>
                      <b>{formatPrice(itemPrice * itemQuantity)}</b>
                      <button className={styles.deleteButton} type="button" onClick={() => handleCartItemDelete(item)} disabled={deletingCartItemId === item.id || isClearingCart}>
                        {deletingCartItemId === item.id ? '삭제 중...' : '삭제'}
                      </button>
                    </li>
                  )
                })}
              </ul>
              <div className={styles.totalRow}>
                <span>전체 합계</span>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>
            </>
          )}
        </article>

        <article className={styles.summaryCard}>
          <div className={styles.sectionHeading}>
            <div>
              <p>WISHLIST</p>
              <h2>찜</h2>
            </div>
            <div className={styles.summaryActions}>
              <button type="button" onClick={handleWishlistClear} disabled={wishlistItems.length === 0 || isClearingWishlist}>
                {isClearingWishlist ? '삭제 중...' : '전체 삭제'}
              </button>
              <Link to="/wishlist">찜한 상품으로 이동 <span aria-hidden="true">→</span></Link>
            </div>
          </div>
          {isWishlistLoading && <p className={styles.statusMessage} role="status">찜한 상품을 불러오고 있습니다.</p>}
          {wishlistError && <p className={styles.errorMessage} role="alert">{wishlistError}</p>}
          {!isWishlistLoading && !wishlistError && wishlistItems.length === 0 && (
            <p className={styles.emptyMessage}>찜한 상품이 없습니다.</p>
          )}
          {!isWishlistLoading && !wishlistError && wishlistItems.length > 0 && (
            <ul className={`${styles.summaryList} ${styles.wishlistList}`}>
              {wishlistItems.map((item) => (
                <li key={item.id}>
                  <img src={item.image} alt="" />
                  <div>
                    <strong>{getWishlistProductName(item)}</strong>
                    <span>{formatPrice(getWishlistPrice(item))}</span>
                  </div>
                  <button className={styles.deleteButton} type="button" onClick={() => handleWishlistItemDelete(item)} disabled={deletingWishlistItemId === item.id || isClearingWishlist}>
                    {deletingWishlistItemId === item.id ? '삭제 중...' : '삭제'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>

      {isEditModalOpen && (
        <div className={styles.modalOverlay} role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsEditModalOpen(false)
        }}>
          <section className={styles.editModal} role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
            <button type="button" className={styles.modalClose} onClick={() => setIsEditModalOpen(false)} aria-label="회원 정보 수정 닫기">×</button>
            <p>PROFILE</p>
            <h2 id="profile-modal-title">회원 정보 수정</h2>
            <form className={styles.profileForm} onSubmit={handleSubmit}>
              <label htmlFor="profile-nickname">
                닉네임
                <input id="profile-nickname" value={nickname} onChange={(event) => setNickname(event.target.value)} disabled={isSaving} />
              </label>
              <label htmlFor="profile-password">
                새 비밀번호
                <input id="profile-password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" placeholder="변경할 때만 입력하세요" disabled={isSaving} />
              </label>
              {editMessage && <p className={editMessage.includes('수정되었습니다') ? styles.successMessage : styles.errorMessage} role="status">{editMessage}</p>}
              <button type="submit" disabled={isSaving}>
                {isSaving ? '저장 중...' : '회원 정보 저장'}
              </button>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}

export default MyPage
