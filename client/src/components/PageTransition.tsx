import { motion } from 'motion/react';
import type { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Subtle fade-and-rise entrance applied to every page. Kept entry-only
 * (no exit animation) so lazy route swaps stay instant and jank-free.
 */
export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{ minHeight: '100%' }}
    >
      {children}
    </motion.div>
  );
}
