import { useState } from 'react'
import { serverTimestamp } from 'firebase/firestore'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../firebase/authApi'
import { createUserProfile } from '../firebase/userApi'
import { getFirebaseErrorMessage } from '../utils/firebaseError'
import { isRequired, isValidEmail, isValidPassword } from '../utils/validation'
import styles from './SignUp.module.scss'

const SignUp = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', nickname: '', password: '', passwordConfirm: '' })
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const validateForm = () => {
    if (!isValidEmail(form.email)) return '올바른 이메일 주소를 입력해주세요.'
    if (!isRequired(form.nickname)) return '닉네임을 입력해주세요.'
    if (!isValidPassword(form.password)) return '비밀번호는 8자 이상으로 입력해주세요.'
    if (form.password !== form.passwordConfirm) return '비밀번호 확인이 일치하지 않습니다.'
    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationMessage = validateForm()

    if (validationMessage) {
      setErrorMessage(validationMessage)
      return
    }

    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const credential = await signUp(form.email.trim(), form.password)
      await createUserProfile(credential.user.uid, {
        email: credential.user.email,
        nickname: form.nickname.trim(),
        role: 'user',
        createAt: serverTimestamp(),
      })
      navigate('/', { replace: true })
    } catch (error) {
      setErrorMessage(getFirebaseErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className={styles.signUp}>
      <div className={styles.authCard}>
        
        <h1>회원가입</h1>
        <p>3천원 쿠폰 증정💸</p>
        <p>카플친 추가 고객 한정</p>
        <img src="/img/banner/signbanner.png" alt="쿠폰 이미지" />
        <form className={styles.authForm} onSubmit={handleSubmit} noValidate>
          <label htmlFor="signup-email">이메일<input id="signup-email" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" placeholder="example@email.com" /></label>
          <label htmlFor="signup-nickname">닉네임<input id="signup-nickname" name="nickname" type="text" value={form.nickname} onChange={handleChange} autoComplete="nickname" placeholder="닉네임을 입력해주세요" /></label>
          <label htmlFor="signup-password">비밀번호<input id="signup-password" name="password" type="password" value={form.password} onChange={handleChange} autoComplete="new-password" placeholder="8자 이상 입력해주세요" /></label>
          <label htmlFor="signup-password-confirm">비밀번호 확인<input id="signup-password-confirm" name="passwordConfirm" type="password" value={form.passwordConfirm} onChange={handleChange} autoComplete="new-password" placeholder="비밀번호를 한 번 더 입력해주세요" /></label>
          {errorMessage && <p className={styles.errorMessage} role="alert">{errorMessage}</p>}
          <button type="submit" disabled={isSubmitting}>{isSubmitting ? '가입 중...' : '회원가입'}</button>
        </form>
        <p className={styles.authLink}>이미 회원이신가요? <Link to="/login">로그인</Link></p>
      </div>
    </section>
  )
}

export default SignUp
