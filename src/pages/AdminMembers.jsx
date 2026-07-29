import { useEffect, useState } from 'react'
import { getUsersForAdmin } from '../firebase/userApi'
import { getFirebaseErrorCode, getFirebaseErrorMessage } from '../utils/firebaseError'
import styles from './AdminMembers.module.scss'

const formatJoinedAt = (value) => {
  if (!value) return '-'

  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

const getFieldValue = (value) => (typeof value === 'string' && value.trim() ? value : '-')

const AdminMembers = () => {
  const [members, setMembers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadMembers = async () => {
      setIsLoading(true)
      setError('')

      try {
        const users = await getUsersForAdmin()
        if (isMounted) setMembers(users)
      } catch (loadError) {
        if (isMounted) {
          setMembers([])
          setError(`회원 목록을 불러오지 못했습니다. ${getFirebaseErrorMessage(loadError)} (오류 코드: ${getFirebaseErrorCode(loadError)})`)
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadMembers()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className={styles.members}>
      <p>MEMBERS</p>
      <h2>회원관리</h2>
      <span>가입일 최신순으로 회원 정보를 확인합니다.</span>

      {isLoading && <p className={styles.statusMessage}>회원 정보를 불러오는 중입니다.</p>}
      {!isLoading && error && <p className={styles.errorMessage}>{error}</p>}
      {!isLoading && !error && members.length === 0 && (
        <p className={styles.emptyMessage}>등록된 회원이 없습니다.</p>
      )}
      {!isLoading && !error && members.length > 0 && (
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th scope="col">닉네임</th>
                <th scope="col">이메일</th>
                <th scope="col">가입일</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>{getFieldValue(member.nickname)}</td>
                  <td>{getFieldValue(member.email)}</td>
                  <td>{formatJoinedAt(member.createAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default AdminMembers
