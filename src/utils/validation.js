export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
export const isValidPassword = (value) => typeof value === 'string' && value.length >= 8
export const isRequired = (value) => String(value ?? '').trim().length > 0

