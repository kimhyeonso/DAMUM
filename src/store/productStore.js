import { create } from 'zustand'
export const useProductStore = create((set) => ({ products: [], selectedProduct: null, setProducts: (products) => set({ products }), setSelectedProduct: (selectedProduct) => set({ selectedProduct }) }))
