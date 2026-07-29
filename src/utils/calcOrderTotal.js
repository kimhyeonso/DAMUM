export const calcOrderTotal = (items = []) => items.reduce((total, item) => total + Number(item.price) * Number(item.quantity ?? 1), 0)

