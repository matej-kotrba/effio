export const randomId = () => {
  const uuid = crypto.randomUUID()
  const splitted = uuid.split("-")
  splitted.pop()
  splitted.shift()

  return splitted.join("-")
}

export const randomIdLettersOnly = () => {
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substring(2, 10)
}