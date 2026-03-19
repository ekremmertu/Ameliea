/**
 * Application Constants
 * Centralized configuration values
 */

// Plan Types and Pricing
export const PLAN_TYPES = {
  LIGHT: 'light',
  PREMIUM: 'premium',
} as const;

export type PlanType = typeof PLAN_TYPES[keyof typeof PLAN_TYPES];

export interface PlanDetail {
  amount: number;
  currency: string;
  name: { tr: string; en: string };
  tagline: { tr: string; en: string };
  emotionalHook: { tr: string; en: string };
  badge: { tr: string; en: string } | null;
  recommended: boolean;
  features: { tr: string[]; en: string[] };
  premiumOnlyFeatures: { tr: string[]; en: string[] };
  upsellMessage: { tr: string; en: string } | null;
}

// Server-side pricing - NEVER trust client-side amounts
export const PLAN_PRICING: Record<PlanType, PlanDetail> = {
  [PLAN_TYPES.LIGHT]: {
    amount: 1999.0,
    currency: 'TRY',
    name: {
      tr: 'Light',
      en: 'Light',
    },
    tagline: {
      tr: 'Zarif bir başlangıç',
      en: 'An elegant start',
    },
    emotionalHook: {
      tr: 'Hikayenizi sade ve şık bir şekilde anlatmak için ihtiyacınız olan her şey.',
      en: 'Everything you need to tell your story with simplicity and elegance.',
    },
    badge: null,
    recommended: false,
    features: {
      tr: [
        'Profesyonel şablon davetiye',
        'Temel RSVP yönetimi',
        'Program zaman çizelgesi',
        'Google Maps entegrasyonu',
        'Sınırlı düzenleme (3 kez)',
        '1 hafta erişim',
        'E-posta desteği',
      ],
      en: [
        'Professional template invitation',
        'Basic RSVP management',
        'Schedule timeline',
        'Google Maps integration',
        'Limited edits (3 times)',
        '1-week access',
        'Email support',
      ],
    },
    premiumOnlyFeatures: { tr: [], en: [] },
    upsellMessage: null,
  },
  [PLAN_TYPES.PREMIUM]: {
    amount: 3999.0,
    currency: 'TRY',
    name: {
      tr: 'Premium',
      en: 'Premium',
    },
    tagline: {
      tr: 'Unutulmaz bir deneyim',
      en: 'An unforgettable experience',
    },
    emotionalHook: {
      tr: 'Düğününüzün her anını kontrol edin, misafirlerinizi etkileyin ve içiniz rahat olsun.',
      en: 'Control every moment of your wedding, impress your guests, and feel at ease.',
    },
    badge: {
      tr: 'Gelinlerin Favorisi',
      en: 'Brides\' Favorite',
    },
    recommended: true,
    features: {
      tr: [
        'Profesyonel şablon davetiye',
        'Premium RSVP yönetim paneli',
        'Sınırsız düzenleme',
        'Geri sayım sayacı',
        'Misafir soruları & mesajları',
        'Gelişmiş analitik',
        'Tema özelleştirme',
        'Öncelikli destek',
        'Ömür boyu erişim',
      ],
      en: [
        'Professional template invitation',
        'Premium RSVP management dashboard',
        'Unlimited edits',
        'Countdown timer',
        'Guest questions & messages',
        'Advanced analytics',
        'Theme customization',
        'Priority support',
        'Lifetime access',
      ],
    },
    premiumOnlyFeatures: {
      tr: [
        'Geri sayım sayacı',
        'Misafir soruları & mesajları',
        'Gelişmiş analitik',
        'Tema özelleştirme',
        'Öncelikli destek',
        'Ömür boyu erişim',
      ],
      en: [
        'Countdown timer',
        'Guest questions & messages',
        'Advanced analytics',
        'Theme customization',
        'Priority support',
        'Lifetime access',
      ],
    },
    upsellMessage: null,
  },
} as const;

export const UPSELL_COPY = {
  lightToPremiun: {
    tr: 'Hikayenizi daha unutulmaz kılmak ister misiniz? Premium ile sınırsız düzenleme ve tam kontrol sizin.',
    en: 'Want to make your story even more memorable? With Premium, unlimited edits and full control are yours.',
  },
} as const;

/**
 * Get plan pricing - SERVER SIDE ONLY
 * This ensures pricing cannot be manipulated by the client
 */
export function getPlanPricing(planType: PlanType): PlanDetail {
  const pricing = PLAN_PRICING[planType];
  if (!pricing) {
    throw new Error(`Invalid plan type: ${planType}`);
  }
  return pricing;
}

export function getFormattedPrice(planType: PlanType): string {
  const pricing = getPlanPricing(planType);
  return `₺${pricing.amount.toLocaleString('tr-TR')}`;
}

/**
 * Validate plan type
 */
export function isValidPlanType(planType: string): planType is PlanType {
  return planType === PLAN_TYPES.LIGHT || planType === PLAN_TYPES.PREMIUM;
}

// Rate Limiting Configuration
export const RATE_LIMITS = {
  API: { maxRequests: 100, windowMs: 60000 }, // 100 requests per minute
  AUTH: { maxRequests: 5, windowMs: 60000 }, // 5 requests per minute
  PAYMENT: { maxRequests: 10, windowMs: 60000 }, // 10 requests per minute
  RSVP: { maxRequests: 10, windowMs: 300000 }, // 10 requests per 5 minutes
} as const;

// File Upload Limits
export const FILE_UPLOAD_LIMITS = {
  IMAGE: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  },
  VIDEO: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    allowedExtensions: ['.mp4', '.webm', '.mov'],
  },
  AUDIO: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
    allowedExtensions: ['.mp3', '.wav', '.ogg'],
  },
} as const;

// Content Limits
export const CONTENT_LIMITS = {
  INVITATION_TITLE: 100,
  PERSONAL_MESSAGE: 2000,
  RSVP_NOTE: 500,
  LOVE_NOTE_MESSAGE: 1000,
  TESTIMONIAL_MESSAGE: 500,
  GUEST_NAME: 100,
  EMAIL: 254, // RFC 5321
  PHONE: 20,
  ADDRESS: 500,
} as const;

// Token Configuration
export const TOKEN_CONFIG = {
  LENGTH: 32,
  EXPIRATION_DAYS: 365,
  MAX_USES: null,
} as const;

// Plan access duration in days
export const PLAN_ACCESS_DURATION = {
  light: 7,
  premium: null, // null = lifetime
} as const;

// Invitation Configuration
export const INVITATION_CONFIG = {
  MAX_GUESTS: 500,
  MAX_SCHEDULE_ITEMS: 20,
  MAX_QUESTIONS: 10,
} as const;

// Theme IDs
export const THEME_IDS = {
  ELEGANT: 'elegant',
  MODERN: 'modern',
  ROMANTIC: 'romantic',
  CLASSIC: 'classic',
  MINIMAL: 'minimal',
} as const;

export type ThemeId = typeof THEME_IDS[keyof typeof THEME_IDS];

// Supported Languages
export const LANGUAGES = {
  TR: 'tr',
  EN: 'en',
} as const;

export type Language = typeof LANGUAGES[keyof typeof LANGUAGES];

// RSVP Attendance Options
export const RSVP_ATTENDANCE = {
  YES: 'yes',
  NO: 'no',
  MAYBE: 'maybe',
} as const;

export type RsvpAttendance = typeof RSVP_ATTENDANCE[keyof typeof RSVP_ATTENDANCE];

// Purchase Status
export const PURCHASE_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export type PurchaseStatus = typeof PURCHASE_STATUS[keyof typeof PURCHASE_STATUS];

// Guest Status
export const GUEST_STATUS = {
  PENDING: 'pending',
  OPENED: 'opened',
  RESPONDED: 'responded',
} as const;

export type GuestStatus = typeof GUEST_STATUS[keyof typeof GUEST_STATUS];
