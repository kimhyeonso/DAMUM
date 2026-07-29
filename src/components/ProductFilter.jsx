import React, {useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import styles from './ProductFilter.module.scss'

const ProductFilter = ({selectCategory, priceRange, setPriceRange, sortControl, productCount}) => {
  const [catalories, setCatalories] = useState([])
  const priceOptions = [
    { value: 'all', label: '전체가격' },
    { value: 'under10', label: '10만원 미만' },
    { value: 'over10', label: '10만원 이상' },
    { value: 'over30', label: '30만원이상' },
  ]
  useEffect(()=>{
    const loadCa = async ()=>{
      const res = await fetch('/data/categories.json')
      const cateData = await res.json()
      setCatalories(cateData)
    }

    loadCa()
  },[])

  const getClass = (gpath) =>{
    if(gpath === '/products' && selectCategory === ''){
      return styles.active
    }

    if(gpath === `/products/category/${selectCategory}`){
      return styles.active
    }

    return ''
  }
  return (
    <div className={styles.productFilter}>
      <div className={styles.categoryGroup}>
        <strong>카테고리</strong>
        <div className={styles.categoryLinks}>
          {
            catalories.map((item)=>(
              <Link key={item.id} to={item.path} className={getClass(item.path)}>
                {
                  item.name === '전체보기' ? '전체' : item.name
                }
              </Link>
            ))
          }
        </div>
      </div>

      <div className={styles.sortRow}>
        {sortControl}
      </div>

      <div className={styles.priceGroup}>
        <strong>가격대</strong>
        <div className={styles.priceOptions}>
          {priceOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={priceRange === option.value ? styles.selected : ''}
              onClick={() => setPriceRange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <span className={styles.productCount}>총 {productCount}개의 상품이 있습니다</span>
    </div>
  )
}

export default ProductFilter
