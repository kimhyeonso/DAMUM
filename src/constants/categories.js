export const CATEGORIES = ['plates', 'bowls', 'cups', 'tea-sets', 'gift-sets']

export const CATEGORY_LABELS = {
  plates: '접시',
  bowls: '볼 · 면기',
  cups: '컵 · 잔',
  'tea-sets': '다기',
  'gift-sets': '선물세트',
}

export const getCeramicCategoryValue = (category, categoryValue = '') => {
  const categoryValueByName = {
    접시: 'plates',
    '볼 · 면기': 'bowls',
    컵: 'cups',
    '컵 · 잔': 'cups',
    다기: 'tea-sets',
    선물세트: 'gift-sets',
  }

  return categoryValueByName[category] ?? categoryValue
}
