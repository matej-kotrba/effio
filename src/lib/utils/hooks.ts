type Optimistic<T> = {
  initial: T;
  request: () => Promise<{ success: boolean }>;
  onResponse: (data: { success: boolean }, initialData: T) => void;
}

export const optimistic = async <T>(onInitial: () => void, { initial, request, onResponse }: Optimistic<T>) => {
  onInitial()
  let isSuccess = false
  try {
    const { success } = await request()
    isSuccess = success
  }
  catch {
    onResponse({ success: false }, initial)
    return
  }
  onResponse({ success: isSuccess }, initial)
}