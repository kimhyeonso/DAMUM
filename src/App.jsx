import React from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
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
