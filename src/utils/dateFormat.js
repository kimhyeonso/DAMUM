export const dateFormat = (date, options = {}) => new Intl.DateTimeFormat('ko-KR', options).format(new Date(date))

