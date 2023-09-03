// TODO: Find a way how to use this or remove it
export function isInArray(array: readonly unknown[], value: unknown) {
  if (!array.includes(value)) {
    throw new Error("Value ${value} is not included in the predefined array.")
  }
  return value
}