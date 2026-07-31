import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import MainBanner from '../components/MainBanner'
import CategoryMenu from '../components/CategoryMenu'
import CartSuccessDrawer from '../components/CartSuccessDrawer'
import ProductList from '../components/ProductList'
import { getCatalogProducts } from '../firebase/productApi'
import { HOME_SOCIAL_IMAGES, HOME_SOCIAL_POSTS } from '../data/homeSocialImages'
import styles from './Home.module.scss'

const PRODUCT_BANNERS = [
  { id: 1, image: '/img/banner/eventBanner01.png', alt: '이벤트 배너 01' },
  { id: 2, image: '/img/banner/eventBanner02.png', alt: '이벤트 배너 02' },
  { id: 3, image: '/img/banner/eventBanner03.png', alt: '이벤트 배너 03' },
  { id: 4, image: '/img/banner/eventBanner04.png', alt: '이벤트 배너 04' },
]

const BRAND_IMAGES = [
  { image: '/img/banner/aboutBanner.png', alt: '담음 도자기 브랜드 이미지' },
  { image: '/img/banner/aboutBanner02.jpg', alt: '담음 도자기 테이블웨어 이미지' },
  { image: '/img/banner/aboutBanner03.png', alt: '담음 도자기 컬렉션 이미지' },
]

const Home = () => {
  const [homePros, setHomePros] = useState([])
  const [bannerIndex, setBannerIndex] = useState(0)
  const [isBannerTransitioning, setIsBannerTransitioning] = useState(true)
  const [brandImageIndex, setBrandImageIndex] = useState(0)
  const [activeSocialIndex, setActiveSocialIndex] = useState(null)
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false)

  useEffect(() => {
    const loadHome = async () => {
      const productsData = await getCatalogProducts()
      const recommendedProducts = productsData.filter((item) => item.isRecommended)
      setHomePros(recommendedProducts.length > 0 ? recommendedProducts : productsData)
    }

    loadHome()
  }, [])

  useEffect(() => {
    if (activeSocialIndex === null) return undefined

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setActiveSocialIndex(null)
      if (event.key === 'ArrowLeft') setActiveSocialIndex((index) => (index - 1 + HOME_SOCIAL_IMAGES.length) % HOME_SOCIAL_IMAGES.length)
      if (event.key === 'ArrowRight') setActiveSocialIndex((index) => (index + 1) % HOME_SOCIAL_IMAGES.length)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeSocialIndex])

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((index) => (index >= PRODUCT_BANNERS.length ? 0 : index + 1))
    }, 3000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (bannerIndex !== PRODUCT_BANNERS.length) return undefined

    const fallbackTimer = window.setTimeout(() => {
      setIsBannerTransitioning(false)
      setBannerIndex(0)
      requestAnimationFrame(() => requestAnimationFrame(() => setIsBannerTransitioning(true)))
    }, 700)

    return () => window.clearTimeout(fallbackTimer)
  }, [bannerIndex])

  const handleBannerTransitionEnd = (event) => {
    if (event.target !== event.currentTarget || bannerIndex !== PRODUCT_BANNERS.length) {
      return
    }

    setIsBannerTransitioning(false)
    setBannerIndex(0)
    requestAnimationFrame(() => requestAnimationFrame(() => setIsBannerTransitioning(true)))
  }

  const loopBanners = [...PRODUCT_BANNERS, ...PRODUCT_BANNERS.slice(0, 2)]
  const moveBrandImage = (direction) => {
    setBrandImageIndex((index) => (index + direction + BRAND_IMAGES.length) % BRAND_IMAGES.length)
  }
  const moveSocialImage = (direction) => {
    setActiveSocialIndex((index) => (index + direction + HOME_SOCIAL_IMAGES.length) % HOME_SOCIAL_IMAGES.length)
  }
  const activeSocialImage = activeSocialIndex === null ? null : HOME_SOCIAL_IMAGES[activeSocialIndex]
  const activeSocialPost = activeSocialImage ? HOME_SOCIAL_POSTS[activeSocialImage.id] : null
  
  return (
    <div className={styles.home}>
      <MainBanner />
      <CategoryMenu />
      <div className={styles.bestSellers}>
        <div className={styles.productHeading}>
          <h2>BEST SELLERS</h2>
        </div>
        <div className={styles.productContent}>
          <ProductList products={homePros} showRanking onCartAdded={() => setIsCartDrawerOpen(true)} />
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
          <img src={BRAND_IMAGES[brandImageIndex].image} alt={BRAND_IMAGES[brandImageIndex].alt} />
          <div className={styles.identityCopy}>
            <h2>아름다움을 담다</h2>
            <p>담다 브랜드의 도자기는 좋은 흙과 맑은 물이 나는 곳에서 자리한 이천에서 수많은 손길을 거쳐 만들어집니다
              여러 번의 건조와 900도의 초벌, 1260도의 재벌 소성 과정을 통해 비로소 하나의 그릇으로 완성되죠
              총 21일간의 여정을 거쳐 탄생한 담다의 도자기가 우리의 일상을 보다 풍성하고 행복하게 만들어주는 매게체가 되길 바라며
            </p>
            <div className={styles.brandGallery} aria-label="브랜드 이미지 선택">
              <div className={styles.brandThumbnailList}>
                {BRAND_IMAGES.map((brandImage, index) => (
                  <button
                    type="button"
                    key={brandImage.image}
                    className={brandImageIndex === index ? styles.activeBrandThumbnail : ''}
                    onClick={() => setBrandImageIndex(index)}
                    aria-label={`${index + 1}번째 브랜드 이미지 보기`}
                    aria-pressed={brandImageIndex === index}
                  >
                    <img src={brandImage.image} alt="about image" />
                  </button>
                ))}
              </div>
              <div className={styles.brandGalleryControls}>
                <button type="button" onClick={() => moveBrandImage(-1)} aria-label="이전 브랜드 이미지">←</button>
                <button type="button" onClick={() => moveBrandImage(1)} aria-label="다음 브랜드 이미지">→</button>
              </div>
            </div>
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
              <button type="button" onClick={() => setActiveSocialIndex(HOME_SOCIAL_IMAGES.findIndex((image) => image.id === item.id))} aria-label={`${item.alt} 자세히 보기`}>
                <img src={item.image} alt={item.alt} />
              </button>
            </figure>
          ))}
        </div>
      </section>

      {activeSocialImage && (
        <div className={styles.socialModalLayer} role="presentation">
          <button type="button" className={styles.socialModalBackdrop} aria-label="소셜 갤러리 닫기" onClick={() => setActiveSocialIndex(null)} />
          <section className={styles.socialModal} role="dialog" aria-modal="true" aria-labelledby="social-modal-title">
            <button type="button" className={styles.socialModalClose} aria-label="소셜 갤러리 닫기" onClick={() => setActiveSocialIndex(null)}>×</button>
            <div className={styles.socialModalImageArea}>
              <img src={activeSocialImage.image} alt={activeSocialImage.alt} />
              <button type="button" className={styles.socialModalPrevious} aria-label="이전 이미지" onClick={() => moveSocialImage(-1)}>←</button>
              <button type="button" className={styles.socialModalNext} aria-label="다음 이미지" onClick={() => moveSocialImage(1)}>→</button>
              <span className={styles.socialModalCount}>{activeSocialIndex + 1} / {HOME_SOCIAL_IMAGES.length}</span>
            </div>
            <div className={styles.socialModalInfo}>
              <div className={styles.socialModalProfile}>
                <span aria-hidden="true">D</span>
                <strong id="social-modal-title">damum_official</strong>
              </div>
              <div className={styles.socialModalCopy}>
                <strong>damum_official</strong>
                <p>{activeSocialPost?.caption}</p>
                <p>{activeSocialPost?.description}</p>
                <div className={styles.socialModalHashtags}>
                  {activeSocialPost?.hashtags.map((hashtag) => <span key={hashtag}>#{hashtag}</span>)}
                </div>
              </div>
              <span className={styles.socialModalDate}>DAMUM OFFICIAL</span>
            </div>
          </section>
        </div>
      )}

      <CartSuccessDrawer isOpen={isCartDrawerOpen} onClose={() => setIsCartDrawerOpen(false)} />
    </div>
  )
}

export default Home
