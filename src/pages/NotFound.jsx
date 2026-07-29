import React from 'react'
import { Link } from 'react-router-dom'
import styles from './NotFound.module.scss'

const NotFound = () => {
  return (
    <div className={styles.notFound}>
      <h1>페이지를 찾을 수 없습니다.</h1>
      <Link to="/">홈으로 돌아가기</Link>
    </div>
  )
}

export default NotFound
