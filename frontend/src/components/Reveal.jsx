import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

/**
 * Reveal - Wraps children with a scroll-triggered fade-in animation.
 *
 * Props:
 *   delay: 0-4 — adds stagger delay (maps to reveal-delay-N classes)
 *   className: additional classes for the wrapper
 */
const Reveal = ({ children, delay = 0, className = '' }) => {
  const [ref, isVisible] = useScrollReveal();

  const delayClass = delay > 0 ? `reveal-delay-${delay}` : '';

  return (
    <div
      ref={ref}
      className={`reveal ${isVisible ? 'reveal-visible' : ''} ${delayClass} ${className}`.trim()}
    >
      {children}
    </div>
  );
};

export default Reveal;
