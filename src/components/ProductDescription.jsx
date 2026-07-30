import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './ProductDescription.module.scss'

const ProductInformationAccordion = ({ product }) => {
  const [openPanel, setOpenPanel] = useState(null)
  const productInfoId = `product-information-${product.id}`
  const deliveryInfoId = `delivery-information-${product.id}`

  const togglePanel = (panel) => {
    setOpenPanel((currentPanel) => (currentPanel === panel ? null : panel))
  }

  return (
    <section className={styles.informationAccordion} aria-label="상품 추가 안내">
      <div className={styles.accordionItem}>
        <button
          type="button"
          className={styles.accordionButton}
          aria-expanded={openPanel === 'product'}
          aria-controls={productInfoId}
          onClick={() => togglePanel('product')}
        >
          <span>상품정보제공고시</span>
          <span className={styles.accordionIcon} aria-hidden="true">⌄</span>
        </button>
        {openPanel === 'product' && (
          <div className={styles.accordionContent} id={productInfoId}>
            <table className={styles.productInfoTable}>
              <thead>
                <tr>
                  <th scope="col">항목</th>
                  <th scope="col">내용</th>
                </tr>
              </thead>
              <tbody>
                <tr><th scope="row">제품명</th><td>{product.name}</td></tr>
                <tr><th scope="row">구성</th><td>면기 2개</td></tr>
                <tr><th scope="row">색상</th><td>웜 아이보리</td></tr>
                <tr><th scope="row">소재</th><td>도자기</td></tr>
                <tr><th scope="row">크기</th><td>지름 약 20cm × 높이 약 9cm</td></tr>
                <tr><th scope="row">용량</th><td>약 1,000ml</td></tr>
                <tr><th scope="row">제조 방식</th><td>수작업 성형 및 유약 마감</td></tr>
                <tr><th scope="row">사용 가능</th><td>전자레인지·식기세척기</td></tr>
                <tr><th scope="row">사용 주의</th><td>오븐·직화 사용 불가</td></tr>
                <tr><th scope="row">제조국</th><td>대한민국</td></tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={styles.accordionItem}>
        <button
          type="button"
          className={styles.accordionButton}
          aria-expanded={openPanel === 'delivery'}
          aria-controls={deliveryInfoId}
          onClick={() => togglePanel('delivery')}
        >
          <span>배송안내</span>
          <span className={styles.accordionIcon} aria-hidden="true">⌄</span>
        </button>
        {openPanel === 'delivery' && (
          <div className={styles.accordionContent} id={deliveryInfoId}>
            <div className={styles.deliveryInfo}>
              <h3>배송안내</h3>
              <dl>
                <div><dt>배송 방법</dt><dd>택배</dd></div>
                <div><dt>배송 지역</dt><dd>전국지역</dd></div>
                <div><dt>배송 비용</dt><dd>3,000원</dd></div>
                <div><dt>배송 기간</dt><dd>3일 ~ 5일</dd></div>
                <div><dt>배송 안내</dt><dd>[기본 배송비]<br /><br />3,000원(무료배송 20,000원 이상 구매시 적용)</dd></div>
              </dl>
              <div className={styles.deliveryNotice}>
                <strong>[교환 및 반품 안내]</strong>
                <p>단순 변심으로 인한 교환 및 반품은 7일 이내 접수 시 가능합니다.</p>
                <p>사용 후 피부 트러블로 인한 교환 및 반품은 20일 이내 접수 후 1:1 문의게시판에 접수하여 주시면 절차를 안내드립니다.</p>
                <p>취소/교환/반품하시는 상품 및 신청사유에 따라 배송비 환불 또는 추가 배송비가 발생할 수 있습니다.</p>
                <p>배송비는 쇼핑몰 정책에 따라 책정됩니다.</p>
                <p><strong>단, 포장 훼손 / 사용 흔적 있는 상품 / 상품 수령 후 7일이 지난 시점의 교환 및 반품은 불가능한 점 양해 부탁드립니다.</strong></p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className={styles.productListLinkWrap}>
        <Link className={styles.productListLink} to="/products">목록으로</Link>
      </div>
    </section>
  )
}

const ProductDescription = ({ product }) => {
  const detailDescriptionImage = product.detailDescriptionImage

  if (detailDescriptionImage) {
    return (
      <>
        <section className={styles.productDescription} aria-label={`${product.name} 상품 상세 설명`}>
          <img className={styles.detailDescriptionImage} src={detailDescriptionImage} alt={`${product.name} 상품 상세 설명`} />
        </section>
        <ProductInformationAccordion product={product} />
      </>
    )
  }

  const imageSources = [...new Set([product.image, ...(product.detailImages ?? [])].filter(Boolean))]
  const getImage = (index) => imageSources[index % imageSources.length] || product.image
  const titleId = `product-description-title-${product.id}`
  const reasons = [
    { title: '상품 구성', description: product.name },
    { title: '카테고리', description: product.category },
    { title: '할인 혜택', description: product.discountRate > 0 ? `${product.discountRate}% 할인 적용` : '정상가 상품' },
    { title: '현재 재고', description: `${Number(product.stock ?? 0).toLocaleString('ko-KR')}개` },
  ]
  const features = [
    { title: '상품의 매력', description: product.description },
    { title: '섬세한 디테일', description: `${product.name}의 형태와 질감을 상세 이미지로 확인해보세요.` },
    { title: '일상에 더하는 변화', description: `${product.category} 컬렉션으로 식탁과 공간에 자연스럽게 어울립니다.` },
  ]

  return (
    <>
    <section className={styles.productDescription} aria-labelledby={titleId}>
      <section className={styles.introduction}>
        <div className={styles.introCopy}>
          <p className={styles.eyebrow}>PRODUCT STORY</p>
          <h2 id={titleId}>상품소개</h2>
          <p>{product.description || '상품 상세 설명을 준비 중입니다.'}</p>
          <span>{product.name}을(를) 상세 이미지와 함께 확인해보세요.</span>
        </div>

        <div className={styles.introVisual}>
          <img src={getImage(0)} alt={`${product.name} 대표 이미지`} />
          <img src={getImage(1)} alt={`${product.name} 상세 이미지`} />
        </div>
      </section>

      <div className={styles.imageStrip} aria-label={`${product.name} 상품 이미지`}>
        {[2, 3, 4].map((index) => (
          <img key={`intro-${index}`} src={getImage(index)} alt="" />
        ))}
      </div>

      <section className={styles.reasonSection} aria-labelledby={`purchase-reason-${product.id}`}>
        <h2 id={`purchase-reason-${product.id}`}>상품 구매 이유</h2>
        <ul>
          {reasons.map((reason, index) => (
            <li key={reason.title}>
              <span aria-hidden="true">0{index + 1}</span>
              <strong>{reason.title}</strong>
              <p>{reason.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.featureSection} aria-labelledby={`product-feature-${product.id}`}>
        <h2 id={`product-feature-${product.id}`}>상품 특징</h2>
        <div className={styles.featureGrid}>
          <img className={styles.featureImageOne} src={getImage(0)} alt="" />
          <article className={styles.featureCopyOne}>
            <h3>{features[0].title}</h3>
            <p>{features[0].description}</p>
          </article>
          <img className={styles.featureImageTwo} src={getImage(1)} alt="" />
          <article className={styles.featureCopyTwo}>
            <h3>{features[1].title}</h3>
            <p>{features[1].description}</p>
          </article>
          <article className={styles.featureCopyThree}>
            <h3>{features[2].title}</h3>
            <p>{features[2].description}</p>
          </article>
          <img className={styles.featureImageThree} src={getImage(2)} alt="" />
        </div>
      </section>

      <section className={styles.reviewSection} aria-labelledby={`product-review-${product.id}`}>
        <div>
          <h2 id={`product-review-${product.id}`}>상품 후기</h2>
          <span>상품 후기 준비 중</span>
        </div>
        <p>구매 고객의 후기가 등록되면 이곳에서 확인할 수 있습니다.</p>
      </section>
    </section>
    <ProductInformationAccordion product={product} />
    </>
  )
}

export default ProductDescription
