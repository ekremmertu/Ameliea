/**
 * Design Tokens Tests
 * Tests for design tokens consistency
 */

import { tokens } from '@/lib/design-tokens';

describe('Design Tokens', () => {
  it('has all required color tokens', () => {
    expect(tokens.colors).toBeDefined();
    expect(tokens.colors.ink).toBeDefined();
    expect(tokens.colors.gold).toBeDefined();
    expect(tokens.colors.crimson).toBeDefined();
    expect(tokens.colors.bg).toBeDefined();
  });

  it('has valid color values', () => {
    expect(tokens.colors.ink.base).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(tokens.colors.gold.base).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(tokens.colors.crimson.base).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('has typography tokens', () => {
    expect(tokens.typography).toBeDefined();
    expect(tokens.typography.fontFamily).toBeDefined();
    expect(tokens.typography.fontFamily.serif).toBeDefined();
    expect(tokens.typography.fontFamily.sans).toBeDefined();
  });

  it('has motion tokens', () => {
    expect(tokens.motion).toBeDefined();
    expect(tokens.motion.duration).toBeDefined();
    expect(typeof tokens.motion.duration.fast).toBe('number');
    expect(typeof tokens.motion.duration.med).toBe('number');
    expect(typeof tokens.motion.duration.slow).toBe('number');
    expect(tokens.motion.easing).toBeDefined();
  });

  it('has spacing tokens', () => {
    expect(tokens.spacing).toBeDefined();
    expect(typeof tokens.spacing.xs).toBe('string');
    expect(typeof tokens.spacing.sm).toBe('string');
    expect(typeof tokens.spacing.md).toBe('string');
    expect(typeof tokens.spacing.lg).toBe('string');
  });
});

