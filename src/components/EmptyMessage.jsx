import styles from './EmptyMessage.module.scss'

const EmptyMessage = ({ title = '표시할 내용이 없습니다.', description }) => {
  return (
    <div className={styles.emptyMessage}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  )
}

export default EmptyMessage
