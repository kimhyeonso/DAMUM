import React,{useEffect, useState} from 'react'
import { Link } from 'react-router-dom'
import styles from './CategoryMenu.module.scss'

const CategoryMenu = () => {
  const [categories, setCategories] = useState([])
  useEffect(()=>{
      const loadCategorys = async ()=>{
        const res = await fetch('/data/categories.json')
        const categoryData = await res.json()
        setCategories(categoryData)
      }
  
      loadCategorys()
    },[])
  return (
    <section className={styles.categoryMenu}>
      {/* <div className={styles.titleAera}>
        <p>SHOP BY CATEGORY</p>
        <h2>카테고리별 상품</h2>
      </div> */}

      <div className={styles.categoryList}>
        {
          categories.map((item, index)=>(
            <Link className={styles.categoryItem} key={item.id} to={item.path}>
              <div className={styles.categoryImage}>
                <img
                  src={item.image}
                  alt=""
                  aria-hidden="true"
                  style={{ objectPosition: `${(index % 4) * 33}% ${index % 2 ? '65%' : '35%'}` }}
                />
              </div>
              <strong>{item.name}</strong>
            </Link>
          ))
        }
      </div>
    </section>
  )
} 

export default CategoryMenu
