/**
 * Constants Tests
 */

import {
  getPlanPricing,
  getFormattedPrice,
  isValidPlanType,
  PLAN_TYPES,
  PLAN_PRICING,
} from '@/lib/constants';

describe('Constants', () => {
  describe('getPlanPricing', () => {
    it('should return light plan pricing', () => {
      const pricing = getPlanPricing(PLAN_TYPES.LIGHT);
      expect(pricing.amount).toBe(1999.0);
      expect(pricing.currency).toBe('TRY');
      expect(pricing.name.tr).toBe('Light');
    });

    it('should return premium plan pricing', () => {
      const pricing = getPlanPricing(PLAN_TYPES.PREMIUM);
      expect(pricing.amount).toBe(3999.0);
      expect(pricing.currency).toBe('TRY');
      expect(pricing.name.tr).toBe('Premium');
    });

    it('should throw error for invalid plan type', () => {
      expect(() => getPlanPricing('invalid' as never)).toThrow('Invalid plan type');
    });
  });

  describe('getFormattedPrice', () => {
    it('should format light plan price', () => {
      const price = getFormattedPrice(PLAN_TYPES.LIGHT);
      expect(price).toContain('1');
      expect(price).toContain('999');
    });

    it('should format premium plan price', () => {
      const price = getFormattedPrice(PLAN_TYPES.PREMIUM);
      expect(price).toContain('3');
      expect(price).toContain('999');
    });
  });

  describe('isValidPlanType', () => {
    it('should validate light plan', () => {
      expect(isValidPlanType('light')).toBe(true);
    });

    it('should validate premium plan', () => {
      expect(isValidPlanType('premium')).toBe(true);
    });

    it('should reject invalid plan type', () => {
      expect(isValidPlanType('invalid')).toBe(false);
      expect(isValidPlanType('')).toBe(false);
      expect(isValidPlanType('LIGHT')).toBe(false);
    });
  });

  describe('PLAN_PRICING', () => {
    it('should have correct structure', () => {
      expect(PLAN_PRICING.light).toBeDefined();
      expect(PLAN_PRICING.premium).toBeDefined();
      
      expect(PLAN_PRICING.light.amount).toBeGreaterThan(0);
      expect(PLAN_PRICING.premium.amount).toBeGreaterThan(PLAN_PRICING.light.amount);
    });

    it('should have bilingual features', () => {
      expect(Array.isArray(PLAN_PRICING.light.features.tr)).toBe(true);
      expect(Array.isArray(PLAN_PRICING.light.features.en)).toBe(true);
      expect(Array.isArray(PLAN_PRICING.premium.features.tr)).toBe(true);
      expect(Array.isArray(PLAN_PRICING.premium.features.en)).toBe(true);
      expect(PLAN_PRICING.premium.features.tr.length).toBeGreaterThan(PLAN_PRICING.light.features.tr.length);
    });

    it('should have tagline and emotionalHook for each plan', () => {
      expect(PLAN_PRICING.light.tagline.tr).toBeTruthy();
      expect(PLAN_PRICING.light.emotionalHook.tr).toBeTruthy();
      expect(PLAN_PRICING.premium.tagline.tr).toBeTruthy();
      expect(PLAN_PRICING.premium.emotionalHook.tr).toBeTruthy();
    });

    it('should mark premium as recommended', () => {
      expect(PLAN_PRICING.light.recommended).toBe(false);
      expect(PLAN_PRICING.premium.recommended).toBe(true);
    });

    it('should have badge only on premium', () => {
      expect(PLAN_PRICING.light.badge).toBeNull();
      expect(PLAN_PRICING.premium.badge).not.toBeNull();
      expect(PLAN_PRICING.premium.badge?.tr).toBeTruthy();
    });
  });
});
