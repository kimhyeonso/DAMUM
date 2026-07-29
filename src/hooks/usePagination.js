export const usePagination = (totalItems, currentPage = 1, perPage = 12) => ({
  currentPage,
  perPage,
  totalPages: Math.max(1, Math.ceil(totalItems / perPage)),
  startIndex: (currentPage - 1) * perPage,
})

