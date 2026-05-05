'use client';
import { useEffect, useRef } from 'react';

/**
 * Custom hook that uses IntersectionObserver to add the `is-visible` class
 * to elements when they scroll into the viewport. Attach the returned ref
 * to any container element that has the `.reveal` CSS class.
 *
 * @param threshold - Fraction of element visible before triggering (0-1)
 * @param rootMargin - Margin around root (e.g., "0px 0px -50px 0px")
 */
export function useScrollReveal(threshold = 0.15, rootMargin = '0px 0px -50px 0px') {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Once revealed, stop observing (one-time animation)
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    // Observe the element itself
    observer.observe(el);

    // Also observe any child elements with .reveal class
    const children = el.querySelectorAll('.reveal, .reveal-left, .reveal-stagger, .curtain-reveal');
    children.forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return ref;
}
