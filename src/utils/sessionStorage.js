export const getSessionItem = (key, fallback = null) => {
  try { return JSON.parse(sessionStorage.getItem(key)) ?? fallback } catch { return fallback }
}
export const setSessionItem = (key, value) => sessionStorage.setItem(key, JSON.stringify(value))
export const removeSessionItem = (key) => sessionStorage.removeItem(key)

