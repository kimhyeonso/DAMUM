import React from 'react'
import ProductCard from './ProductCard'
import styles from './ProductList.module.scss'

  const ProductList = ({products = [], variant, showRanking = false, onCartAdded}) => {
  if(products.length === 0){
    return <p className={styles.emptyMessage}>등록된 상품이 없습니다</p>
  }
  return (
    <div className={`${styles.productList} ${variant === 'catalog' ? styles.catalog : ''} ${showRanking ? styles.ranked : ''}`}>
      {
        products.map((item, index)=>(
          <ProductCard
            key={item.id}
            product={item}
            variant={variant}
            rank={showRanking ? index + 1 : null}
            onCartAdded={onCartAdded}
          />
        ))
      }
      
    </div>
  )
}

export default ProductList
