import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './SearchBox.module.scss'

const SearchBox = () => {
  const [searchKeyword, setSearchKeyword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!searchKeyword.trim()) {
      return
    }

    navigate(`/search/${encodeURIComponent(searchKeyword.trim())}`)
    setSearchKeyword('')
  }

  return (
    <div className={styles.searchBox}>
      <form onSubmit={handleSubmit}>
        <input
          type="search"
          value={searchKeyword}
          onChange={(event) => setSearchKeyword(event.target.value)}
          placeholder="상품명, 키워드를 검색해보세요"
          aria-label="Product search"
        />
        <button type="submit" aria-label="검색">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
        </button>
      </form>
    </div>
  )
}

export default SearchBox
