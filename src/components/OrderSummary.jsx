import styles from './OrderSummary.module.scss'

const OrderSummary = ({ subtotal, deliveryFee, totalPrice, onOrder }) => {
  return (
    <aside className={styles.orderSummary}>
      <h2>주문 요약</h2>
      <dl>
        <div>
          <dt>상품 금액</dt>
          <dd>{subtotal.toLocaleString()}원</dd>
        </div>
        <div>
          <dt>배송비</dt>
          <dd>{deliveryFee.toLocaleString()}원</dd>
        </div>
      </dl>
      <div className={styles.totalPrice}>
        <span>총 결제 금액</span>
        <strong>{totalPrice.toLocaleString()}원</strong>
      </div>
      <button type="button" onClick={onOrder}>주문하기</button>
    </aside>
  )
}

export default OrderSummary
