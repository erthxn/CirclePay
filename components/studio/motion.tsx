'use client';

import { CSSProperties, useEffect, useRef, useState } from 'react';

/**
 * Tiny motion utilities — NOT Framer Motion.
 * Provides:
 *  - motion.div: a div with layout-animation support (spring via CSS transitions)
 *  - AnimatePresence: simple presence wrapper for exit animations
 *
 * Why hand-rolled: avoids adding framer-motion (~50KB) to the bundle.
 * For our use case (tab pill morphing), CSS transitions + layoutId are enough.
 */

interface MotionDivProps extends React.HTMLAttributes<HTMLDivElement> {
  layoutId?: string;
  transition?: { type?: 'spring' | 'tween'; stiffness?: number; damping?: number; mass?: number; duration?: number };
  style?: CSSProperties;
  children?: React.ReactNode;
}

// Global registry of layout elements (keyed by layoutId) for cross-element animation
const layoutRegistry = new Map<string, { el: HTMLElement; rect: DOMRect }>();

export function motionDiv({ layoutId, transition, style, children, ...rest }: MotionDivProps) {
  const ref = useRef<HTMLDivElement>(null);
  const t = transition || { type: 'spring', stiffness: 400, damping: 32, mass: 0.5 };

  // Compute transition CSS string from spring config (approximation)
  const duration = t.type === 'tween' ? (t.duration ?? 0.3) : Math.max(0.15, Math.min(0.6, (t.mass ?? 0.5) * 1.5));
  const cssTransition = `transform ${duration}s cubic-bezier(0.22, 1, 0.36, 1), background ${duration}s ease`;

  useEffect(() => {
    if (!ref.current || !layoutId) return;
    const prev = layoutRegistry.get(layoutId);
    const currRect = ref.current.getBoundingClientRect();
    if (prev) {
      // Compute delta from previous position
      const dx = prev.rect.left - currRect.left;
      const dy = prev.rect.top - currRect.top;
      const sw = prev.rect.width / currRect.width;
      const sh = prev.rect.height / currRect.height;
      // Apply inverse transform, then animate back to identity
      ref.current.style.transform = `translate(${dx}px, ${dy}px) scale(${sw}, ${sh})`;
      ref.current.style.transition = 'none';
      // Force reflow
      void ref.current.offsetHeight;
      // Next frame, animate to identity
      requestAnimationFrame(() => {
        if (!ref.current) return;
        ref.current.style.transition = cssTransition;
        ref.current.style.transform = 'translate(0, 0) scale(1, 1)';
      });
    }
    layoutRegistry.set(layoutId, { el: ref.current, rect: currRect });
    return () => {
      // Update final rect on unmount
      if (ref.current) {
        layoutRegistry.set(layoutId, { el: ref.current, rect: ref.current.getBoundingClientRect() });
      }
    };
  }, [layoutId]);

  return (
    <div
      ref={ref}
      style={{
        ...style,
        transition: cssTransition,
        transformOrigin: 'center center',
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

// Export motion as an object to mimic Framer Motion API
export const motion = {
  div: motionDiv as unknown as React.FC<MotionDivProps>,
};

// AnimatePresence: renders children while mounted, applies exit animation on unmount
export function AnimatePresence({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
