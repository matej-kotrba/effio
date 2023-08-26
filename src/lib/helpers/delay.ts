export function delayResults(
  timeInMs: number,
  searchParams: string
): Promise<string> {
  return new Promise((res) => {
    setTimeout(() => {
      res(searchParams);
    }, timeInMs);
  });
}