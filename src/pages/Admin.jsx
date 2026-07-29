import { Link } from 'react-router-dom'
import styles from './Admin.module.scss'

const Admin = () => {
  return (
    <section className={styles.admin}>
      <p>ADMIN DASHBOARD</p>
      <h2>대시보드</h2>
      <span>운영에 필요한 관리 메뉴를 선택하세요.</span>
      <div className={styles.menuCards}>
        <Link to="/admin/members">회원관리</Link>
        <Link to="/admin/products">상품관리 · 재고관리</Link>
        <Link to="/admin/recommendations">추천상품 관리</Link>
        <Link to="/admin/notices">공지사항 관리</Link>
      </div>
      <p className={styles.passwordNotice}>관리자 비밀번호는 마이페이지에서 변경할 수 있습니다.</p>
    </section>
  )
}

export default Admin
