// src/hooks/useInfiniteScroll.ts
import { useEffect, useRef } from "react";

export function useInfiniteScroll(onIntersect: () => void, options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          onIntersect();
        }
      });
    }, options ?? { root: null, rootMargin: "300px", threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [onIntersect, options]);

  return ref;
}
