export type CreateObserverParams = {
  callback: (entry: IntersectionObserverEntry, observer: IntersectionObserver) => void
}

export type CreateObserverReturn = {
  observer: IntersectionObserver;
  addIntersection: (element: HTMLElement, { shouldActive }: { shouldActive: boolean }) => void;
}

export const createObserver = ({ callback }: CreateObserverParams): CreateObserverReturn => {
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(item => callback(item, observer))
  })

  const addIntersection: CreateObserverReturn["addIntersection"] = (element: HTMLElement, { shouldActive }) => {
    if (!shouldActive) return;
    observer.observe(element);

    return {
      destroy() {
        observer.unobserve(element);
      }
    };
  }

  return {
    observer: observer,
    addIntersection: addIntersection
  }
}