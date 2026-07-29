import React, { useEffect, useState } from 'react'
import styles from './MainBanner.module.scss'
import { equalAny } from 'firebase/firestore/pipelines'

const MainBanner = () => {
  const [banners, setBanners] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  

  useEffect(()=>{
    const loadBanners = async ()=>{
      const res = await fetch('/data/banners.json')
      const bannerData = await res.json()
      setBanners(bannerData)
    }

    loadBanners()
    },[])

  useEffect(() => {
    if (banners.length === 0) {
      return undefined
    }

    const timer = setInterval(() => {
      setCurrentIndex((index) => (index + 1) % banners.length)
    }, 4000)

    return () => clearInterval(timer)
  }, [banners.length])

  if(banners.length === 0){
    return <section>배너를 불러오는 중입니다</section>      
  }

  const currentBanner = banners[currentIndex]

const onPrev = () => {
  if (currentIndex === 0) {
    setCurrentIndex(banners.length - 1)
  } else {
    setCurrentIndex(currentIndex - 1)
  }
}

const onNext = () => {
  if (currentIndex === banners.length - 1) {
    setCurrentIndex(0)
  } else {
    setCurrentIndex(currentIndex + 1)
  }
}


  return (
    <section className={styles.mainBanner}>
      <img key={currentBanner.id} src={currentBanner.image} alt="banners" />
      <div className={styles.overlay}>
        {/* 배너 문구 */}
        <div key={`text-currentBanner.id`} className={styles.textBox}>
          <p>{currentBanner.eyebrow}</p>
          <h2>{currentBanner.title}</h2>
          <p>{currentBanner.description}</p>
        </div>
        <button type="button" className={styles.prevButton} onClick={onPrev} aria-label="Previous banner">&lt;</button>
        <button type="button" className={styles.nextButton} onClick={onNext} aria-label="Next banner">&gt;</button>
        <div className={styles.dots}>
          {banners.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={index === currentIndex ? styles.active : ''}
            />
          ))}
        </div>
        
      </div>
    </section>
  )
}

export default MainBanner
