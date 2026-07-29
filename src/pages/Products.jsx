import React, {useState, useEffect} from 'react'
import { Link, useParams } from 'react-router-dom'
import QuantityControl from '../components/QuantityControl'
import styles from './Products.module.scss'
import ProductFilter from '../components/ProductFilter'
import ProductSort from '../components/ProductSort'
import ProductList from '../components/ProductList'
import { getCatalogProducts } from '../firebase/productApi'
import { CATEGORY_LABELS } from '../constants/categories'

const Products = () => {
  const {category} = useParams()
  const [ products, setProducts] = useState([])
  const [ priceRange, setPriceRange] = useState('all')
  const [ sortType, setSortType ] = useState('latest')

  useEffect(()=>{
    const loadPro = async () =>{
      const productData = await getCatalogProducts()
      setProducts(productData)
    }

    loadPro()
  },[])

  const categoryItem = category ? products.filter((item)=> item.categoryValue === category) 
  : products

  const selectItem = categoryItem.filter((item)=>{
    const disPrice = item.price - ( (item.price * item.discountRate) / 100 )
    if(priceRange === 'under10'){
      return disPrice <= 100000
    }
    
    if(priceRange === 'over10'){
      return disPrice >= 100000
    }

    if(priceRange === 'over30'){
      return disPrice >= 300000
    }

    return true
  })

  const sortItem = [...selectItem].sort((a, b) => {
    const aPrice = a.price - ((a.price * a.discountRate) / 100)
    const bPrice = b.price - ((b.price * b.discountRate) / 100)

    if (sortType === 'lowPrice') return aPrice - bPrice
    if (sortType === 'highPrice') return bPrice - aPrice

    return 
  })

  return (
    <section className={styles.products}>
      <div className={styles.catalogHeader}>
        <p>PRODUCTS</p>
        <h2>{category ? CATEGORY_LABELS[category] ?? category : '전체상품'}</h2>
      </div>

      <div className={styles.catalogControls}>
        <ProductFilter
          selectCategory={category || ''}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          sortControl={<ProductSort sortType={sortType} setSortType={setSortType} />}
          productCount={selectItem.length}
        />
      </div>
      <ProductList products={sortItem} />
    </section>
  )
}

export default Products
