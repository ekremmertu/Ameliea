'use client';

import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
  disabled?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  onClick,
  type = 'button',
  className = '',
  disabled = false,
}: ButtonProps) {
  // Minimum 44x44px touch target for mobile (Apple HIG recommendation)
  const baseStyles = 'inline-flex items-center justify-center rounded-full px-4 py-3 md:px-4 md:py-3 min-h-[44px] min-w-[44px] font-medium transition-all cursor-pointer border';

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: tokens.colors.ink.base,
      color: tokens.colors.bg.primary,
      borderColor: tokens.colors.ink.base,
    },
    secondary: {
      backgroundColor: 'transparent',
      color: tokens.colors.text.primary,
      borderColor: tokens.colors.border.base,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: tokens.colors.text.primary,
      borderColor: 'transparent',
    },
  };

  const hoverStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: tokens.colors.crimson.base,
      borderColor: tokens.colors.crimson.base,
      color: 'white',
    },
    secondary: {
      backgroundColor: tokens.colors.crimson.base,
      borderColor: tokens.colors.crimson.base,
      color: 'white',
    },
    ghost: {
      color: tokens.colors.crimson.base,
    },
  };

  return (
    <motion.div
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{
        duration: tokens.motion.duration.fast / 1000,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ display: 'inline-block' }}
    >
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={baseStyles + ' ' + className}
        style={{
          ...variantStyles[variant],
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={(e) => {
          if (!disabled && hoverStyles[variant]) {
            Object.assign(e.currentTarget.style, hoverStyles[variant]);
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            Object.assign(e.currentTarget.style, variantStyles[variant]);
          }
        }}
      >
        {children}
      </button>
    </motion.div>
  );
}
