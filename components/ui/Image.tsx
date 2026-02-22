'use client';

import NextImage from 'next/image';
import { tokens } from '@/lib/design-tokens';

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export function Image({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  placeholder = 'empty',
  blurDataURL,
}: ImageProps) {
  return (
    <NextImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      className={className}
      style={{
        borderRadius: tokens.borderRadius.lg,
      }}
    />
  );
}

