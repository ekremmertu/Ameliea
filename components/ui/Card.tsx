'use client';

import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <motion.div
      onClick={onClick}
      className={`rounded-[20px] border p-4 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        borderColor: tokens.colors.border.light,
        background: `linear-gradient(180deg, ${tokens.colors.bg.panel}, ${tokens.colors.bg.panel})`,
      }}
      whileHover={onClick ? { 
        y: -4,
        borderColor: tokens.colors.crimson.base,
        boxShadow: tokens.shadows.lg,
      } : {}}
      transition={{
        duration: tokens.motion.duration.med / 1000,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

