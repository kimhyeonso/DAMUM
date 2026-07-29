import React from 'react'
import OrderSummary from '../components/OrderSummary'
import styles from './Order.module.scss'

const Order = () => {
  return (
    <div className={styles.order}>
      <h1>주문하기</h1>
      <OrderSummary />
    </div>
  )
}

export default Order
