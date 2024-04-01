export const load = (event) => {
  return {
    ...event.data,
    url: event.url.pathname
  }
}