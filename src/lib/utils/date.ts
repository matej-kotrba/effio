type DateOptions = {
  time: boolean
}

export function transformDate(date: Date, options?: DateOptions) {
  const time = options?.time ? ` ${date.getHours()}:${date.getMinutes()}` : ''
  return `${date.getDate()}. ${(date.getMonth() + 1)}. ${date.getFullYear()} ${time}`
}