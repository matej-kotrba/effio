export function transformCategoryNameToSlug(category: string) {
  const slug = `${category.toLowerCase()}-${crypto.randomUUID().split("-")[0]}`
  return slug
}