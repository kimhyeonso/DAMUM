import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { subscribeToCartCount } from '../firebase/cartApi'
import { subscribeToWishlistCount } from '../firebase/wishlistApi'
import SearchBox from './SearchBox'
import { useAuthStore } from '../store/authStore'
import styles from './Header.module.scss'

import logo from '/img/logo/logo.png'

const UserIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="7" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
)

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 5.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.4a5.5 5.5 0 0 0-.1-7.8Z" />
  </svg>
)

const BagIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 8h16l-1 13H5L4 8Z" />
    <path d="M8 8V6a4 4 0 0 1 8 0v2" />
  </svg>
)

const Header = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const nickname = useAuthStore((state) => state.profile?.nickname ?? state.user?.nickname)
  const role = useAuthStore((state) => state.profile?.role ?? state.user?.role)
  const userId = useAuthStore((state) => state.user?.uid)
  const isAdmin = String(role ?? '').trim().toLowerCase() === 'admin'
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!userId) {
      setCartCount(0)
      setWishlistCount(0)
      return undefined
    }

    const unsubscribeCart = subscribeToCartCount(userId, setCartCount, () => setCartCount(0))
    const unsubscribeWishlist = subscribeToWishlistCount(userId, setWishlistCount, () => setWishlistCount(0))

    return () => {
      unsubscribeCart()
      unsubscribeWishlist()
    }
  }, [userId])

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMobileMenuOpen])

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <header className={styles.header}>
      <div className={styles.mainHeader}>
        {/* 버튼 있음 */}
        <div className={styles.desktopSearch}>
          <SearchBox />
        </div>
        <Link to="/" className={styles.logo} aria-label="RECAT home">
          <img src={logo} alt="logo" />
        </Link>
        <nav className={styles.utilityMenu} aria-label="User menu">
          {isAuthenticated ? (
            <>
              <span className={styles.nickname}>{nickname ? `${nickname}님` : '회원님'}</span>
              <Link to="/mypage">마이페이지</Link>
              {isAdmin && <Link to="/admin">관리자</Link>}
            </>
          ) : (
            <Link className={styles.utilityIcon} to="/login" aria-label="로그인">
              <UserIcon />
            </Link>
          )}
          <Link className={styles.utilityIcon} to="/wishlist" aria-label={`찜한 상품 ${wishlistCount}개`}>
            <HeartIcon />
            <span className={styles.iconCount} aria-hidden="true">{wishlistCount > 99 ? '99+' : wishlistCount}</span>
          </Link>
          <Link className={styles.utilityIcon} to="/cart" aria-label={`장바구니 ${cartCount}개`}>
            <BagIcon />
            <span className={styles.iconCount} aria-hidden="true">{cartCount > 99 ? '99+' : cartCount}</span>
          </Link>
        </nav>
        <button
          type="button"
          className={styles.mobileMenuButton}
          aria-label="메뉴 열기"
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav className={styles.nav} aria-label="Product categories">
        <Link to="/products">전체상품</Link>
        <Link to="/products/category/plates">접시</Link>
        <Link to="/products/category/bowls">볼 · 면기</Link>
        <Link to="/products/category/cups">컵 · 잔</Link>
        <Link to="/products/category/tea-sets">다기</Link>
        <Link to="/products/category/gift-sets">선물세트</Link>
        <Link to="/notice">공지사항</Link>
      </nav>

      {isMobileMenuOpen && (
        <div className={styles.mobileMenuLayer} role="presentation">
          <button type="button" className={styles.mobileMenuBackdrop} aria-label="메뉴 닫기" onClick={closeMobileMenu} />
          <aside className={styles.mobileMenuPanel} role="dialog" aria-modal="true" aria-label="모바일 메뉴">
            <div className={styles.mobileMenuTop}>
              <strong>MENU</strong>
              <button type="button" aria-label="메뉴 닫기" onClick={closeMobileMenu}>×</button>
            </div>
            <div className={styles.mobileMenuSearch}>
              <SearchBox />
            </div>
            <nav className={styles.mobileCategoryNav} aria-label="상품 카테고리">
              <Link to="/products" onClick={closeMobileMenu}>전체상품</Link>
              <Link to="/products/category/plates" onClick={closeMobileMenu}>접시</Link>
              <Link to="/products/category/bowls" onClick={closeMobileMenu}>볼 · 면기</Link>
              <Link to="/products/category/cups" onClick={closeMobileMenu}>컵 · 잔</Link>
              <Link to="/products/category/tea-sets" onClick={closeMobileMenu}>다기</Link>
              <Link to="/products/category/gift-sets" onClick={closeMobileMenu}>선물세트</Link>
              <Link to="/notice" onClick={closeMobileMenu}>공지사항</Link>
            </nav>
            <nav className={styles.mobileUtilityNav} aria-label="사용자 메뉴">
              {isAuthenticated ? (
                <>
                  <Link to="/mypage" onClick={closeMobileMenu}>{nickname ? `${nickname}님 마이페이지` : '마이페이지'}</Link>
                  {isAdmin && <Link to="/admin" onClick={closeMobileMenu}>관리자</Link>}
                </>
              ) : (
                <Link to="/login" onClick={closeMobileMenu}>로그인</Link>
              )}
              <Link to="/wishlist" onClick={closeMobileMenu}>찜한 상품 <span>{wishlistCount}</span></Link>
              <Link to="/cart" onClick={closeMobileMenu}>장바구니 <span>{cartCount}</span></Link>
            </nav>
          </aside>
        </div>
      )}
    </header>
  )
}

export default Header
