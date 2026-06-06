'use client';

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';

import { cn } from 'lib/utils';

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Delay before the reveal transition starts, in milliseconds. */
  delay?: number;
  /** Rendered element. Defaults to a div. */
  as?: ElementType;
  /** Reveal only once and then stop observing. Defaults to true. */
  once?: boolean;
};

/**
 * Lightweight scroll-reveal wrapper. Adds the `reveal` utility (defined in
 * global.css) and toggles `data-reveal="visible"` when the element scrolls into
 * view. Falls back to immediately visible when IntersectionObserver is missing
 * or the user prefers reduced motion.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    // Fallback for environments without IntersectionObserver: reveal next frame
    // (scheduling avoids a synchronous setState inside the effect body).
    if (typeof IntersectionObserver === 'undefined') {
      const frame = requestAnimationFrame(() => setVisible(true));

      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);

            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [once]);

  return (
    <Tag
      ref={ref}
      className={cn('reveal', className)}
      data-reveal={visible ? 'visible' : 'hidden'}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
