/**
 * Constants Tests
 */

import {
  getPlanPricing,
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
      expect(pricing.name.tr).toBe('Light Plan');
    });

    it('should return premium plan pricing', () => {
      const pricing = getPlanPricing(PLAN_TYPES.PREMIUM);
      expect(pricing.amount).toBe(3999.0);
      expect(pricing.currency).toBe('TRY');
      expect(pricing.name.tr).toBe('Premium Plan');
    });

    it('should throw error for invalid plan type', () => {
      expect(() => getPlanPricing('invalid' as any)).toThrow('Invalid plan type');
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

    it('should have features defined', () => {
      expect(Array.isArray(PLAN_PRICING.light.features)).toBe(true);
      expect(Array.isArray(PLAN_PRICING.premium.features)).toBe(true);
      expect(PLAN_PRICING.premium.features.length).toBeGreaterThan(PLAN_PRICING.light.features.length);
    });
  });
});
