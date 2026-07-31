import { Link } from 'react-router-dom'
import styles from './Footer.module.scss'

const FOOTER_MENU = [
  { label: '전체상품', to: '/products' },
  { label: '접시', to: '/products/category/plates' },
  { label: '볼 · 면기', to: '/products/category/bowls' },
  { label: '컵 · 잔', to: '/products/category/cups' },
  { label: '다기', to: '/products/category/tea-sets' },
  { label: '선물세트', to: '/products/category/gift-sets' },
  { label: '공지사항', to: '/notice' },
]

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <section className={styles.brandArea} aria-label="DAMUM 소개">
          <img className={styles.logo} src="/img/footer/footerlogo.png" alt="DAMUM" />
          <p>본 사이트는 학생용 포트폴리오입니다.</p>
          <span>실제 상품 판매 및 결제가 이루어지지 않습니다.</span>
        </section>

        <nav className={styles.footerNav} aria-label="푸터 메뉴">
          {FOOTER_MENU.map((item) => (
            <Link key={item.to} to={item.to}>{item.label}</Link>
          ))}
        </nav>

        <div className={styles.footerBottom}>
          <p>본 사이트의 모든 콘텐츠는 학습 및 포트폴리오 목적으로 제작되었습니다.</p>
          <span>© 2026 DAMUM Student Portfolio</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
