import { NavLink, Outlet } from 'react-router-dom'
import styles from './AdminLayout.module.scss'

const menuItems = [
  { to: '/admin', label: '대시보드', end: true },
  { to: '/admin/members', label: '회원관리' },
  { to: '/admin/products', label: '상품관리 · 재고관리' },
  { to: '/admin/recommendations', label: '추천상품 관리' },
  { to: '/admin/notices', label: '공지사항 관리' },
]

const AdminLayout = () => {
  return (
    <section className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <p>ADMIN</p>
        <h1>관리자 센터</h1>
        <nav aria-label="관리자 메뉴">
          {menuItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className={styles.content}>
        <Outlet />
      </div>
    </section>
  )
}

export default AdminLayout
