'use client';

import { tokens } from '@/lib/design-tokens';

interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  lines?: number; // For text skeleton
}

export function SkeletonLoader({
  width = '100%',
  height = '1rem',
  className = '',
  rounded = 'md',
  lines,
}: SkeletonLoaderProps) {
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  const baseStyles = {
    backgroundColor: 'var(--bg-panel)',
    backgroundImage: 'linear-gradient(90deg, var(--bg-panel) 0%, var(--bg-panel-strong) 50%, var(--bg-panel) 100%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  };

  if (lines) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${roundedClasses[rounded]} ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
            style={{
              ...baseStyles,
              height: typeof height === 'number' ? `${height}px` : height,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${roundedClasses[rounded]} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...baseStyles,
      }}
    />
  );
}

// Predefined skeleton components
export function SkeletonCard() {
  return (
    <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
      <SkeletonLoader height={24} width="60%" className="mb-4" />
      <SkeletonLoader lines={3} height={16} className="mb-4" />
      <SkeletonLoader height={40} width="40%" />
    </div>
  );
}

export function SkeletonButton() {
  return <SkeletonLoader height={44} width={120} rounded="full" />;
}

export function SkeletonInput() {
  return <SkeletonLoader height={44} width="100%" rounded="xl" />;
}

// Add shimmer animation to globals.css
export const skeletonStyles = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
`;

