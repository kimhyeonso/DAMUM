import React, { useEffect, useState } from 'react'
import styles from './MainBanner.module.scss'

const MainBanner = () => {
  const [banners, setBanners] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isBannerPlaying, setIsBannerPlaying] = useState(true)
  

  useEffect(()=>{
    const loadBanners = async ()=>{
      const res = await fetch('/data/banners.json')
      const bannerData = await res.json()
      setBanners(bannerData)
    }

    loadBanners()
    },[])

  useEffect(() => {
    if (banners.length === 0 || !isBannerPlaying) {
      return undefined
    }

    const timer = setInterval(() => {
      setCurrentIndex((index) => (index + 1) % banners.length)
    }, 4000)

    return () => clearInterval(timer)
  }, [banners.length, isBannerPlaying])

  if(banners.length === 0){
    return <section>배너를 불러오는 중입니다</section>      
  }

  const currentBanner = banners[currentIndex]
  const bannerProgress = `${((currentIndex + 1) / banners.length) * 100}%`

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
        <div className={styles.dots}>
          <div className={styles.progressTrack} role="status" aria-label={`배너 ${currentIndex + 1} / ${banners.length}`}>
            <span className={styles.progressFill} style={{ width: bannerProgress }} />
          </div>
          <button
            type="button"
            className={styles.playToggle}
            onClick={() => setIsBannerPlaying((isPlaying) => !isPlaying)}
            aria-label={isBannerPlaying ? '배너 자동 전환 일시정지' : '배너 자동 전환 재생'}
          >
            {isBannerPlaying ? 'Ⅱ' : '▶'}
          </button>
        </div>
        
      </div>
    </section>
  )
}

export default MainBanner
