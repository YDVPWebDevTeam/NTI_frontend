'use client';

import { useEffect, useState } from 'react';

/**
 * Thin gradient bar fixed to the top of the viewport that fills as the page is
 * scrolled. Purely decorative — hidden when the user prefers reduced motion.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;

      const scrollTop = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;

      setProgress(height > 0 ? Math.min(1, scrollTop / height) : 0);
    };

    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);

      if (frame) {
        cancelAnimationFrame(frame);
      }
    };
  }, []);

  return (
    <div
      aria-hidden
      className="from-primary via-primary-container to-tertiary-fixed-dim fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r transition-transform duration-150 ease-out motion-reduce:hidden"
      style={{ transform: `scaleX(${progress})` }}
    />
  );
}
