type DateOptions = {
  time: boolean
}

export function transformDate(date: Date | string, options?: DateOptions) {
  if (typeof date === 'string') {
    try {
      date = new Date(date)
    }
    catch {
      return ""
    }
  }
  const time = options?.time ? ` ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}` : ''
  return `${date.getDate()}. ${(date.getMonth() + 1)}. ${date.getFullYear()} ${time}`
}