export const randomId = () => {
  const uuid = crypto.randomUUID()
  const splitted = uuid.split("-")
  splitted.pop()
  splitted.shift()

  return splitted.join("-")
}