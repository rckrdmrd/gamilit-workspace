import { useState, useEffect, useRef, useCallback, type RefObject } from 'react';

export interface ContainerSize {
  width: number;
  height: number;
}

/**
 * Hook that tracks an element's dimensions using ResizeObserver.
 * Returns a ref to attach to the target element and the current { width, height }.
 *
 * @example
 * const [containerRef, { width, height }] = useContainerSize<HTMLDivElement>();
 * return <div ref={containerRef}>Width: {width}</div>;
 */
export function useContainerSize<T extends HTMLElement = HTMLDivElement>(): [
  RefObject<T | null>,
  ContainerSize,
] {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState<ContainerSize>({ width: 0, height: 0 });

  const updateSize = useCallback((entry: ResizeObserverEntry) => {
    const { width, height } = entry.contentRect;
    setSize((prev) => {
      if (prev.width === Math.round(width) && prev.height === Math.round(height)) {
        return prev;
      }
      return { width: Math.round(width), height: Math.round(height) };
    });
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) updateSize(entry);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [updateSize]);

  return [ref, size];
}
