type CreateObserverParams = {
  callback: (entry: IntersectionObserverEntry) => void
}

type CreateObserverReturn = {
  disconnect: () => void;
  addIntersection: (element: HTMLElement) => void;
}

export const createObserver = ({ callback }: CreateObserverParams): CreateObserverReturn => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(callback)
  })

  function addIntersection(element: HTMLElement) {
    observer.observe(element);

    return {
      destroy() {
        observer.unobserve(element);
      }
    };
  }

  return {
    disconnect: observer.disconnect,
    addIntersection: addIntersection
  }
}