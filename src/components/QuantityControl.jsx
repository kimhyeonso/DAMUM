import styles from './QuantityControl.module.scss'

const QuantityControl = ({ quantity, setQuantity, maxQuantity, disabled = false }) => {
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const increaseQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1)
    }
  }

  return (
    <div className={styles.quantityControl}>
      <button type="button" onClick={decreaseQuantity} disabled={disabled || quantity === 1} aria-label="수량 감소">−</button>
      <span>{quantity}</span>
      <button type="button" onClick={increaseQuantity} disabled={disabled || quantity === maxQuantity} aria-label="수량 증가">+</button>
    </div>
  )
}

export default QuantityControl
