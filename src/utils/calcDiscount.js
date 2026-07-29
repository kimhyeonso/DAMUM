export const calcDiscount = (price, discountRate = 0) => Math.round(Number(price) * (1 - Number(discountRate) / 100))

