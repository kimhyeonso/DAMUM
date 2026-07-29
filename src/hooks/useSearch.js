import { useMemo } from 'react'
export const useSearch = (items, keyword, fields = ['name']) => useMemo(() => {
  const query = keyword.trim().toLowerCase()
  if (!query) return items
  return items.filter((item) => fields.some((field) => String(item[field] ?? '').toLowerCase().includes(query)))
}, [items, keyword, fields])

