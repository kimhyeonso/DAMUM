import styles from './AdminSection.module.scss'

const AdminSection = ({ label, title, description }) => {
  return (
    <section className={styles.section}>
      <p>{label}</p>
      <h2>{title}</h2>
      <div className={styles.notice}>
        <strong>관리 기능을 준비하고 있습니다.</strong>
        <span>{description}</span>
      </div>
    </section>
  )
}

export default AdminSection
