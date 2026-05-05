'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook that animates a number counting up from 0 to the target value
 * when the element enters the viewport. Uses requestAnimationFrame for
 * smooth 60fps animation.
 *
 * @param target - The final number to count up to
 * @param duration - Animation duration in milliseconds (default 1500ms)
 * @param decimals - Number of decimal places to show (default 0)
 * @returns [ref, displayValue] — attach ref to the container element
 */
export function useCountUp(
  target: number,
  duration: number = 1500,
  decimals: number = 0
): [React.RefObject<HTMLSpanElement | null>, string] {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState('0');
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            observer.disconnect();

            const startTime = performance.now();

            function animate(currentTime: number) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);

              // Ease-out cubic for a satisfying deceleration
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = eased * target;

              setDisplay(current.toFixed(decimals));

              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                setDisplay(target.toFixed(decimals));
              }
            }

            requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, decimals]);

  return [ref, display];
}
