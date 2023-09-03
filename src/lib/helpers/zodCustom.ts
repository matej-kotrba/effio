export function isInArray(array: Array<unknown>, value: unknown) {
  if (!array.includes(value)) {
    throw new Error("Value ${value} is not included in the predefined array.")
  }
  return value
}