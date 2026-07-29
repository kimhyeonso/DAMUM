import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getNotice } from '../firebase/noticeApi'
import { getFirebaseErrorCode } from '../utils/firebaseError'
import styles from './NoticeDetail.module.scss'

const formatDate = (value) => {
  if (!value) return '-'

  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(date)
}

const NoticeDetail = () => {
  const { id } = useParams()
  const [notice, setNotice] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadNotice = async () => {
      try {
        const result = await getNotice(id)
        if (!result) {
          if (isMounted) setError('존재하지 않거나 삭제된 공지사항입니다.')
          return
        }
        if (isMounted) setNotice(result)
      } catch (loadError) {
        if (isMounted) setError(`공지사항을 불러오지 못했습니다. 잠시 후 다시 시도해주세요. (오류 코드: ${getFirebaseErrorCode(loadError)})`)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadNotice()
    return () => { isMounted = false }
  }, [id])

  return (
    <section className={styles.noticeDetail}>
      {isLoading && <p className={styles.statusMessage}>공지사항을 불러오는 중입니다.</p>}
      {!isLoading && error && <p className={styles.errorMessage}>{error}</p>}
      {!isLoading && !error && notice && (
        <article>
          <p>NOTICE</p>
          <h1>{notice.title || '제목 없음'}</h1>
          <time dateTime={typeof notice.createAt?.toDate === 'function' ? notice.createAt.toDate().toISOString() : undefined}>
            {formatDate(notice.createAt)}
          </time>
          <div className={styles.content}>{notice.content}</div>
        </article>
      )}
      <Link className={styles.listLink} to="/notice">목록으로</Link>
    </section>
  )
}

export default NoticeDetail
