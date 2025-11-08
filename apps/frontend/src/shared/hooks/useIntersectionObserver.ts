import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverReturn<T extends HTMLElement> {
  ref: React.RefObject<T>;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
}

/**
 * Custom hook for detecting element visibility using IntersectionObserver API.
 * Useful for lazy loading, infinite scroll, and visibility tracking.
 *
 * @template T - The HTML element type to observe (defaults to HTMLElement)
 * @param options - IntersectionObserverInit options (threshold, root, rootMargin)
 * @returns Object containing ref to attach to element, isIntersecting state, and full entry object
 *
 * @example
 * // Lazy loading an image
 * const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({ threshold: 0.5 });
 *
 * return (
 *   <div ref={ref}>
 *     {isIntersecting ? <img src="image.jpg" /> : <Skeleton />}
 *   </div>
 * );
 *
 * @example
 * // Infinite scroll implementation
 * const { ref: loadMoreRef, isIntersecting } = useIntersectionObserver();
 *
 * useEffect(() => {
 *   if (isIntersecting) {
 *     loadMoreData();
 *   }
 * }, [isIntersecting]);
 *
 * return (
 *   <>
 *     {items.map(item => <Item key={item.id} {...item} />)}
 *     <div ref={loadMoreRef}>Loading more...</div>
 *   </>
 * );
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLElement>(
  options?: IntersectionObserverInit
): UseIntersectionObserverReturn<T> {
  const ref = useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([observedEntry]) => {
      setIsIntersecting(observedEntry.isIntersecting);
      setEntry(observedEntry);
    }, options);

    observer.observe(element);

    // Cleanup observer on unmount
    return () => {
      observer.disconnect();
    };
  }, [options]);

  return { ref, isIntersecting, entry };
}
