import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import MainBanner from '../components/MainBanner'
import CategoryMenu from '../components/CategoryMenu'
import ProductList from '../components/ProductList'
import { getCatalogProducts } from '../firebase/productApi'
import { HOME_SOCIAL_IMAGES } from '../data/homeSocialImages'
import styles from './Home.module.scss'

const PRODUCT_BANNERS = [
  { id: 1, image: '/img/banner/eventBanner01.png', alt: '이벤트 배너 01' },
  { id: 2, image: '/img/banner/eventBanner02.png', alt: '이벤트 배너 02' },
  { id: 3, image: '/img/banner/eventBanner03.png', alt: '이벤트 배너 03' },
  { id: 4, image: '/img/banner/eventBanner04.png', alt: '이벤트 배너 04' },
]

const Home = () => {
  const [homePros, setHomePros] = useState([])
  const [bannerIndex, setBannerIndex] = useState(0)
  const [isBannerTransitioning, setIsBannerTransitioning] = useState(true)

  useEffect(() => {
    const loadHome = async () => {
      const productsData = await getCatalogProducts()
      const recommendedProducts = productsData.filter((item) => item.isRecommended)
      setHomePros((recommendedProducts.length > 0 ? recommendedProducts : productsData).slice(0, 5))
    }

    loadHome()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((index) => index + 1)
    }, 3000)

    return () => clearInterval(timer)
  }, [])

  const handleBannerTransitionEnd = (event) => {
    if (event.target !== event.currentTarget || bannerIndex !== PRODUCT_BANNERS.length) {
      return
    }

    setIsBannerTransitioning(false)
    setBannerIndex(0)
    requestAnimationFrame(() => requestAnimationFrame(() => setIsBannerTransitioning(true)))
  }

  const loopBanners = [...PRODUCT_BANNERS, ...PRODUCT_BANNERS.slice(0, 2)]
  
  return (
    <div className={styles.home}>
      <MainBanner />
      <CategoryMenu />
      <div className={styles.bestSellers}>
        <div className={styles.productHeading}>
          <h2>BEST SELLERS</h2>
        </div>
        <div className={styles.productContent}>
          <ProductList products={homePros} />
        </div>
        <div className={styles.productViewAll}>
          <Link to="/products">VIEW ALL <span aria-hidden="true">→</span></Link>
        </div>
      </div>

      <div className={styles.productbanner}>
        <div className={styles.bannerViewport}>
          <div
            className={styles.bannerTrack}
            style={{
              transform: `translateX(calc(-${bannerIndex * 50}% - ${bannerIndex * 8}px))`,
              transition: isBannerTransitioning ? undefined : 'none',
            }}
            onTransitionEnd={handleBannerTransitionEnd}
          >
            {loopBanners.map((banner, index) => (
              <div className={styles.bannerCard} key={`${banner.id}-${index}`}>
                <img src={banner.image} alt={banner.alt} />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.bannerDots}>
          {PRODUCT_BANNERS.map((banner, index) => (
            <button
              type="button"
              key={banner.id}
              className={bannerIndex % PRODUCT_BANNERS.length === index ? styles.activeDot : ''}
              onClick={() => {
                setIsBannerTransitioning(true)
                setBannerIndex(index)
              }}
              aria-label={`${index + 1}번째 이벤트 배너 보기`}
            />
          ))}
        </div>
      </div>

      <section className={styles.productIdenti}>
        <div className={styles.identityContent}>
          <img src="/img/banner/aboutBanner.png" alt="소개배너" />
          <div className={styles.identityCopy}>
            <h2>아름다움을 담다</h2>
            <p>담다 브랜드의 도자기는 좋은 흙과 맑은 물이 나는 곳에서 자리한 이천에서 수많은 손길을 거쳐 만들어집니다
              여러 번의 건조와 900도의 초벌, 1260도의 재벌 소성 과정을 통해 비로소 하나의 그릇으로 완성되죠
              총 21일간의 여정을 거쳐 탄생한 담다의 도자기가 우리의 일상을 보다 풍성하고 행복하게 만들어주는 매게체가 되길 바라며
            </p>
            <div className={styles.productViewAll}>
              <Link to="/products">VIEW ALL <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </div>
      </section>
      <div className={styles.video}>
        <video autoPlay muted loop playsInline>
          <source src='/img/banner/homeplay.mp4' />
        </video>
      </div>

      <section className={styles.socialGallery} aria-label="담다 소셜 갤러리">
        <h2>@damum_official</h2>
        <div className={styles.socialGrid}>
          {HOME_SOCIAL_IMAGES.map((item) => (
            <figure key={item.id} className={`${styles.socialItem} ${styles[item.className]}`}>
              <img src={item.image} alt={item.alt} />
            </figure>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
