import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../firebase/authApi'
import { getFirebaseErrorMessage } from '../utils/firebaseError'
import { isRequired, isValidEmail } from '../utils/validation'
import styles from './Login.module.scss'

const Login = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!isValidEmail(form.email)) {
      setErrorMessage('올바른 이메일 주소를 입력해주세요.')
      return
    }

    if (!isRequired(form.password)) {
      setErrorMessage('비밀번호를 입력해주세요.')
      return
    }

    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await login(form.email.trim(), form.password)
      navigate('/', { replace: true })
    } catch (error) {
      setErrorMessage(getFirebaseErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className={styles.login}>
      <div className={styles.authCard}>
        <p>WELCOME BACK</p>
        <h1>로그인</h1>
        <form className={styles.authForm} onSubmit={handleSubmit} noValidate>
          <label htmlFor="login-email">
            이메일
            <input id="login-email" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" placeholder="example@email.com" />
          </label>
          <label htmlFor="login-password">
            비밀번호
            <input id="login-password" name="password" type="password" value={form.password} onChange={handleChange} autoComplete="current-password" placeholder="비밀번호를 입력해주세요" />
          </label>
          {errorMessage && <p className={styles.errorMessage} role="alert">{errorMessage}</p>}
          <button type="submit" disabled={isSubmitting}>{isSubmitting ? '로그인 중...' : '로그인'}</button>
        </form>
        <p className={styles.authLink}>아직 회원이 아니신가요? <Link to="/signup">회원가입</Link></p>
      </div>
    </section>
  )
}

export default Login
