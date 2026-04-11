import { useEffect, useRef, useState } from 'react';

/**
 * useScrollReveal - Returns a ref and visibility state for scroll-triggered animations.
 * Attach the ref to any element. It starts invisible and becomes visible when scrolled into view.
 *
 * Usage:
 *   const [ref, isVisible] = useScrollReveal();
 *   <div ref={ref} className={isVisible ? 'reveal reveal-visible' : 'reveal'}>
 *     ...
 *   </div>
 */
export const useScrollReveal = (options = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
        ...options
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [options]);

  return [ref, isVisible];
};
