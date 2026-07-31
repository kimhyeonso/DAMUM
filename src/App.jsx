import React, { useEffect, useLayoutEffect } from 'react'
import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import Header from './components/Header' 
import Footer from './components/Footer' 
import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'
import Notice from './pages/Notice'
import NoticeDetail from './pages/NoticeDetail'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import SearchResult from './pages/SearchResult'
import SearchBox from './components/SearchBox'
import NotFound from './pages/NotFound'

import Loading from './components/Loading' 
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Order from './pages/Order'
import OrderComplete from './pages/OrderComplete'
import MyPage from './pages/MyPage'
import Admin from './pages/Admin'
import AdminProduct from './pages/AdminProduct'
import AdminOrder from './pages/AdminOrder'
import AdminLayout from './pages/AdminLayout'
import AdminMembers from './pages/AdminMembers'
import AdminSection from './pages/AdminSection'
import AdminNotice from './pages/AdminNotice'
import { useAuth } from './hooks/useAuth'

import './App.css'

const App = () => {
  useAuth()
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  useEffect(() => {
    const content = document.querySelector('main.content')

    if (!content || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const revealSelector = 'section:not([role="dialog"]), article'
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return

        entry.target.classList.add('is-scroll-revealed')
        observer.unobserve(entry.target)
      })
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -48px',
    })

    const registerReveal = (element) => {
      if (
        !(element instanceof HTMLElement)
        || element.parentElement === content
        || element.closest('[role="dialog"]')
      ) return

      if (!element.classList.contains('scroll-reveal')) {
        element.classList.add('scroll-reveal')
      }

      if (!element.classList.contains('is-scroll-revealed')) {
        observer.observe(element)
      }
    }

    const registerWithin = (root) => {
      if (!(root instanceof HTMLElement)) return

      if (root.matches(revealSelector)) registerReveal(root)
      root.querySelectorAll(revealSelector).forEach(registerReveal)
    }

    content.querySelectorAll(':scope > .scroll-reveal').forEach((element) => {
      element.classList.remove('scroll-reveal', 'is-scroll-revealed')
    })
    registerWithin(content)

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => registerWithin(node))
      })
    })

    mutationObserver.observe(content, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutationObserver.disconnect()
    }
  }, [pathname])

  return (
    <div>
      <Header />
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Admin />} />
                <Route path="members" element={<AdminMembers />} />
                <Route path="products" element={<AdminProduct />} />
                <Route path="recommendations" element={<AdminSection label="RECOMMENDATION" title="추천상품 관리" description="추천 상품 등록과 노출 순서 관리 기능은 다음 단계에서 연결합니다." />} />
                <Route path="notices" element={<AdminNotice />} />
                <Route path="orders" element={<AdminOrder />} />
              </Route>
            </Route>
          </Route>
          <Route path="/notice" element={<Notice />} />
          <Route path="/notice/:id" element={<NoticeDetail />} />
          <Route path="/products/" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/products/category/:category" element={<Products />} />
          <Route path="/search/:keyword" element={<SearchResult />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Loading />
    </div>
  )
}

export default App
