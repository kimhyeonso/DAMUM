import { create } from 'zustand'
export const useOrderStore = create((set) => ({ orders: [], currentOrder: null, setOrders: (orders) => set({ orders }), setCurrentOrder: (currentOrder) => set({ currentOrder }) }))
