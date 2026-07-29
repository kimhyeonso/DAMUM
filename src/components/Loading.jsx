import React from 'react'
import { useLoadingStore } from '../store/loadingStore'
import styles from './Loading.module.scss'

const Loading = () => {
  const isLoading = useLoadingStore((state) => state.isLoading)

  return isLoading ? <div className={styles.loading}>Loading...</div> : null
} 

export default Loading
