import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getNotices } from '../firebase/noticeApi'
import { getFirebaseErrorCode } from '../utils/firebaseError'
import styles from './Notice.module.scss'

const formatDate = (value) => {
  if (!value) return '-'

  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(date)
}

const Notice = () => {
  const [notices, setNotices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadNotices = async () => {
      try {
        const result = await getNotices()
        if (isMounted) setNotices(result)
      } catch (loadError) {
        if (isMounted) setError(`공지사항을 불러오지 못했습니다. 잠시 후 다시 시도해주세요. (오류 코드: ${getFirebaseErrorCode(loadError)})`)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadNotices()
    return () => { isMounted = false }
  }, [])

  return (
    <section className={styles.noticePage}>
      <div className={styles.notice}>
        <p>NOTICE</p>
        <h1>공지사항</h1>
        <span>새로운 소식과 안내를 확인하세요.</span>

        {isLoading && <p className={styles.statusMessage}>공지사항을 불러오는 중입니다.</p>}
        {!isLoading && error && <p className={styles.errorMessage}>{error}</p>}
        {!isLoading && !error && notices.length === 0 && <p className={styles.emptyMessage}>등록된 공지사항이 없습니다.</p>}
        {!isLoading && !error && notices.length > 0 && (
          <ul className={styles.noticeList}>
            {notices.map((notice) => (
              <li key={notice.id}>
                <Link to={`/notice/${notice.id}`}>
                  <strong>{notice.title || '제목 없음'}</strong>
                  <span>{formatDate(notice.createAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default Notice
