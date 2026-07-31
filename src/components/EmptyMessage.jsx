import { Link } from 'react-router-dom'
import styles from './EmptyMessage.module.scss'

const EmptyMessage = ({ title = '표시할 내용이 없습니다.', description, actionLabel, actionTo }) => {
  return (
    <div className={styles.emptyMessage}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {actionLabel && actionTo && <Link to={actionTo}>{actionLabel}</Link>}
    </div>
  )
}

export default EmptyMessage
