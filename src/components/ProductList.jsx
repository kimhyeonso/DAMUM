import React from 'react'
import ProductCard from './ProductCard'
import styles from './ProductList.module.scss'

  const ProductList = ({products = [], variant}) => {
  if(products.length === 0){
    return <p className={styles.emptyMessage}>등록된 상품이 없습니다</p>
  }
  return (
    <div className={`${styles.productList} ${variant === 'catalog' ? styles.catalog : ''}`}>
      {
        products.map((item)=>(
          <ProductCard key={item.id} product={item} variant={variant} />
        ))
      }
      
    </div>
  )
}

export default ProductList
