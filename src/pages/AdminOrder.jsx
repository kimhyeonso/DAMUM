import React from 'react'
import Pagination from '../components/Pagination'
import styles from './AdminOrder.module.scss'

const AdminOrder = () => {
  return (
    <div className={styles.adminOrder}>
      <h1>주문 관리</h1>
      <Pagination />
    </div>
  )
}

export default AdminOrder
