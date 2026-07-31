// 홈 영상 아래 소셜 갤러리 전용 이미지 설정입니다.
// 상품 JSON과 연결되지 않으므로, 이미지 경로와 대체 텍스트를 이 파일에서 자유롭게 수정할 수 있습니다.
export const HOME_SOCIAL_IMAGES = [
  { id: 'main-left', image: '/img/official/official_01.jpg', alt: '담다 도자기 컬렉션', className: 'socialLargeLeft' },
  { id: 'top-left', image: '/img/official/official_02.jpg', alt: '담다 제작 과정', className: 'socialTopLeft' },
  { id: 'bottom-left', image: '/img/official/official_03.jpg', alt: '담다 도자기 디테일', className: 'socialBottomLeft' },
  { id: 'center', image: '/img/official/official_04.jpg', alt: '담다 대표 상품', className: 'socialCenter' },
  { id: 'top-right', image: '/img/official/official_05.jpg', alt: '담다 테이블웨어', className: 'socialTopRight' },
  { id: 'bottom-right', image: '/img/official/official_06.jpg', alt: '담다 선물 구성', className: 'socialBottomRight' },
  { id: 'main-right', image: '/img/official/official_07.jpg', alt: '담다 라이프스타일', className: 'socialLargeRight' },
]

export const HOME_SOCIAL_POSTS = {
  'main-left': {
    caption: '고요한 식탁 위에 자연스럽게 스며드는 담음의 도자기. 매일의 한 끼가 조금 더 특별해지는 순간을 담았습니다.',
    description: '차분한 색감과 부드러운 곡선이 어떤 메뉴와도 편안하게 어우러집니다.',
    hashtags: ['담음', '도자기', '홈카페', '테이블웨어'],
  },
  'top-left': {
    caption: '흙을 고르고, 손으로 빚고, 불의 시간을 지나 하나의 그릇이 완성됩니다.',
    description: '작은 결까지 정성으로 채운 담음의 제작 과정을 소개합니다.',
    hashtags: ['도자기공방', '핸드메이드', '이천도자기', '담음'],
  },
  'bottom-left': {
    caption: '일상에 여백을 더해주는 단정한 형태와 은은한 질감.',
    description: '오래 곁에 두고 싶은 생활 도자기를 만나보세요.',
    hashtags: ['생활도자기', '미니멀라이프', '그릇추천', '담음'],
  },
  center: {
    caption: '좋아하는 음식을 담는 일은 하루를 아끼는 가장 쉬운 방법입니다.',
    description: '담음의 컬렉션으로 나만의 식탁을 완성해 보세요.',
    hashtags: ['테이블스타일링', '집밥', '도자기그릇', '담음'],
  },
  'top-right': {
    caption: '계절의 빛과 식탁의 온기를 담아낸 담음의 테이블웨어.',
    description: '소중한 사람과 함께하는 식사 시간에 포근함을 더합니다.',
    hashtags: ['테이블세팅', '홈다이닝', '감성식기', '담음'],
  },
  'bottom-right': {
    caption: '마음을 전하는 선물에는 오래 기억되는 이야기가 필요합니다.',
    description: '정성스럽게 구성한 담음의 선물세트를 소개합니다.',
    hashtags: ['선물추천', '집들이선물', '도자기선물', '담음'],
  },
  'main-right': {
    caption: '천천히 흐르는 일상 속, 손에 닿는 작은 아름다움을 발견해 보세요.',
    description: '담음은 일상 가까이에서 오래 사용할 수 있는 그릇을 만듭니다.',
    hashtags: ['라이프스타일', '일상기록', '도자기', 'damum_official'],
  },
}
