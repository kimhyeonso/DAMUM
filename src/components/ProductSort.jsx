import React from 'react'
import styles from './ProductSort.module.scss'

const ProductSort = ({sortType, setSortType}) => {
  return (
    <div className={styles.productSort}>
      <label>정렬</label>
      <select value={sortType} onChange={(e)=>setSortType(e.target.value)}>
        <option value='latest'>최신순</option>
        <option value='lowPrice'>낮은 가격순</option>
        <option value='highPrice'>높은 가격순</option>
      </select>
    </div>
  )
}

export default ProductSort
