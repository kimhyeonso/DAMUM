import { Link } from 'react-router-dom'
import QuantityControl from './QuantityControl'
import styles from './CartItem.module.scss'

const CartItem = ({ item, onChangeQuantity, onRemove }) => {
  const itemTotal = item.price * item.quantity

  return (
    <article className={styles.cartItem}>
      <Link className={styles.imageLink} to={`/products/${item.id}`}>
        <img src={item.image} alt={item.name} />
      </Link>

      <div className={styles.itemInfo}>
        <p>{item.category}</p>
        <Link to={`/products/${item.id}`}>{item.name}</Link>
        <strong>{item.price.toLocaleString()}원</strong>
      </div>

      <QuantityControl
        quantity={item.quantity}
        setQuantity={(quantity) => onChangeQuantity(item.id, quantity)}
        maxQuantity={item.stock}
      />

      <strong className={styles.itemTotal}>{itemTotal.toLocaleString()}원</strong>
      <button type="button" className={styles.removeButton} onClick={() => onRemove(item.id)}>삭제</button>
    </article>
  )
}

export default CartItem
