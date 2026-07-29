import { useEffect, useState } from 'react'
import { createNotice, deleteNotice, getNotices, updateNotice } from '../firebase/noticeApi'
import { getFirebaseErrorCode } from '../utils/firebaseError'
import { useAuthStore } from '../store/authStore'
import styles from './AdminNotice.module.scss'

const initialForm = { title: '', content: '' }

const formatDate = (value) => {
  if (!value) return '-'

  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(date)
}

const AdminNotice = () => {
  const user = useAuthStore((state) => state.user)
  const [notices, setNotices] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadNotices = async () => {
    setIsLoading(true)
    setError('')

    try {
      setNotices(await getNotices())
    } catch (loadError) {
      setNotices([])
      setError(`공지사항 목록을 불러오지 못했습니다. 관리자 권한과 보안 규칙을 확인해주세요. (오류 코드: ${getFirebaseErrorCode(loadError)})`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadNotices()
  }, [])

  const resetForm = () => {
    setForm(initialForm)
    setEditingId('')
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const title = form.title.trim()
    const content = form.content.trim()

    if (!title || !content) {
      setError('공지 제목과 내용을 모두 입력해주세요.')
      return
    }

    if (!user?.uid) {
      setError('로그인 정보를 확인할 수 없습니다. 다시 로그인해주세요.')
      return
    }

    setError('')
    setMessage('')
    setIsSubmitting(true)

    try {
      if (editingId) {
        await updateNotice(editingId, { title, content })
        setMessage('공지사항을 수정했습니다.')
      } else {
        await createNotice({ title, content, authorUid: user.uid })
        setMessage('공지사항을 등록했습니다.')
      }

      resetForm()
      await loadNotices()
    } catch (submitError) {
      setError(`공지사항을 ${editingId ? '수정' : '등록'}하지 못했습니다. 관리자 권한과 보안 규칙을 확인해주세요. (오류 코드: ${getFirebaseErrorCode(submitError)})`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (notice) => {
    setError('')
    setMessage('')
    setEditingId(notice.id)
    setForm({ title: notice.title ?? '', content: notice.content ?? '' })
  }

  const handleDelete = async (notice) => {
    if (!window.confirm(`'${notice.title}' 공지사항을 삭제하시겠습니까?`)) return

    setError('')
    setMessage('')
    setDeletingId(notice.id)

    try {
      await deleteNotice(notice.id)
      if (editingId === notice.id) resetForm()
      setNotices((current) => current.filter((item) => item.id !== notice.id))
      setMessage('공지사항을 삭제했습니다.')
    } catch (deleteError) {
      setError(`공지사항을 삭제하지 못했습니다. 관리자 권한과 보안 규칙을 확인해주세요. (오류 코드: ${getFirebaseErrorCode(deleteError)})`)
    } finally {
      setDeletingId('')
    }
  }

  return (
    <section className={styles.adminNotice}>
      <header className={styles.pageHeader}>
        <p>NOTICE</p>
        <h2>공지사항 관리</h2>
        <span>공지사항을 등록하고 수정하거나 삭제할 수 있습니다.</span>
      </header>

      <form className={styles.noticeForm} onSubmit={handleSubmit}>
        <div className={styles.formHeading}>
          <h3>{editingId ? '공지사항 수정' : '공지사항 작성'}</h3>
          {editingId && <button type="button" onClick={resetForm}>작성 취소</button>}
        </div>
        <label htmlFor="notice-title">
          제목
          <input id="notice-title" name="title" value={form.title} onChange={handleChange} maxLength="120" placeholder="공지 제목을 입력해주세요" />
        </label>
        <label htmlFor="notice-content">
          내용
          <textarea id="notice-content" name="content" value={form.content} onChange={handleChange} rows="8" placeholder="공지 내용을 입력해주세요" />
        </label>
        <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : editingId ? '수정 저장' : '공지 등록'}
        </button>
      </form>

      {error && <p className={styles.errorMessage} role="alert">{error}</p>}
      {message && <p className={styles.successMessage}>{message}</p>}

      <section className={styles.noticeList}>
        <div className={styles.listHeading}>
          <h3>등록 공지사항</h3>
          <span>총 {notices.length}개</span>
        </div>
        {isLoading && <p className={styles.statusMessage}>공지사항을 불러오는 중입니다.</p>}
        {!isLoading && !error && notices.length === 0 && <p className={styles.emptyMessage}>등록된 공지사항이 없습니다.</p>}
        {!isLoading && notices.length > 0 && (
          <ul>
            {notices.map((notice) => (
              <li key={notice.id}>
                <div>
                  <strong>{notice.title || '제목 없음'}</strong>
                  <span>{formatDate(notice.createAt)}</span>
                </div>
                <div className={styles.actions}>
                  <button type="button" onClick={() => handleEdit(notice)}>수정</button>
                  <button type="button" onClick={() => handleDelete(notice)} disabled={deletingId === notice.id}>
                    {deletingId === notice.id ? '삭제 중...' : '삭제'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  )
}

export default AdminNotice
