import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ProductList from '../components/ProductList'
import { getCatalogProducts } from '../firebase/productApi'
import styles from './SearchResult.module.scss'

const SearchResult = () => {
  const { keyword } = useParams()
  const [searchResults, setSearchResults] = useState([])

  useEffect(() => {
    const searchProducts = async () => {
      const proData = await getCatalogProducts()
      const trimKeyword = (keyword ?? '').toLowerCase().trim()

      const results = proData.filter((item) => {
        const productName = item.name.toLowerCase()
        const productCategory = item.category.toLowerCase()
        return productName.includes(trimKeyword) || productCategory.includes(trimKeyword)
      })

      setSearchResults(results)
    }

    searchProducts()
  }, [keyword])
  return (
    <section className={styles.searchResult}>
      <div>
        <p>Search</p>
        <h2>"{keyword}" 검색결과</h2>
        <span>총 {searchResults.length}개의 상품을 찾았습니다</span>
      </div>

      <div>
        <ProductList products={searchResults}/>
      </div>
    </section>
  )
}

export default SearchResult
