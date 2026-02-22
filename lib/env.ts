/**
 * Environment Variables Validation
 * Uses Zod for type-safe environment variable validation
 * Validates at runtime only (not at build time)
 */

import { z } from 'zod';

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),
  
  // App
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
  
  // Admin
  ADMIN_EMAILS: z.string().optional(), // Server-side only
  NEXT_PUBLIC_ADMIN_EMAILS: z.string().optional(), // Client-side (safe to expose, only for UI routing)
  
  // Google Maps
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(), // Client-side Google Maps API key
  
  // Iyzico Payment Gateway (optional - only required for payment features)
  IYZICO_API_KEY: z.string().optional(),
  IYZICO_SECRET_KEY: z.string().optional(),
  IYZICO_BASE_URL: z.string().url('IYZICO_BASE_URL must be a valid URL').optional().default('https://sandbox-api.iyzipay.com'),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Lazy validation - only validate when accessed
let cachedEnv: z.infer<typeof envSchema> | null = null;

function getEnv(): z.infer<typeof envSchema> {
  if (cachedEnv) {
    return cachedEnv;
  }

  // During build, if env vars not set, return defaults
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                      process.env.NEXT_PHASE === 'phase-development-build';
  
  if (isBuildTime && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    // Return defaults for build (will fail at runtime if not set)
      cachedEnv = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key_min_20_chars_long',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4173',
        ADMIN_EMAILS: process.env.ADMIN_EMAILS,
        NEXT_PUBLIC_ADMIN_EMAILS: process.env.NEXT_PUBLIC_ADMIN_EMAILS,
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        IYZICO_API_KEY: process.env.IYZICO_API_KEY || '',
        IYZICO_SECRET_KEY: process.env.IYZICO_SECRET_KEY || '',
        IYZICO_BASE_URL: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
        NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
      };
    return cachedEnv;
  }

  // Runtime validation - if env vars missing, use defaults and log warning
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Environment variables missing. Using defaults. This may cause errors.');
    cachedEnv = {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl || 'https://placeholder.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey || 'placeholder_key_min_20_chars_long',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4173',
      ADMIN_EMAILS: process.env.ADMIN_EMAILS,
      NEXT_PUBLIC_ADMIN_EMAILS: process.env.NEXT_PUBLIC_ADMIN_EMAILS,
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      IYZICO_API_KEY: process.env.IYZICO_API_KEY,
      IYZICO_SECRET_KEY: process.env.IYZICO_SECRET_KEY,
      IYZICO_BASE_URL: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
      NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
    };
    return cachedEnv;
  }

  // Validate when env vars are present
  try {
    cachedEnv = envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4173',
      ADMIN_EMAILS: process.env.ADMIN_EMAILS,
      NEXT_PUBLIC_ADMIN_EMAILS: process.env.NEXT_PUBLIC_ADMIN_EMAILS,
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      IYZICO_API_KEY: process.env.IYZICO_API_KEY,
      IYZICO_SECRET_KEY: process.env.IYZICO_SECRET_KEY,
      IYZICO_BASE_URL: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
      NODE_ENV: process.env.NODE_ENV || 'development',
    });
    return cachedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment variable validation error:', error.errors);
      // Return defaults instead of throwing to prevent app crash
      cachedEnv = {
        NEXT_PUBLIC_SUPABASE_URL: supabaseUrl || 'https://placeholder.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey || 'placeholder_key_min_20_chars_long',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4173',
        ADMIN_EMAILS: process.env.ADMIN_EMAILS,
        NEXT_PUBLIC_ADMIN_EMAILS: process.env.NEXT_PUBLIC_ADMIN_EMAILS,
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        IYZICO_API_KEY: process.env.IYZICO_API_KEY || '',
        IYZICO_SECRET_KEY: process.env.IYZICO_SECRET_KEY || '',
        IYZICO_BASE_URL: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
        NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
      };
      return cachedEnv;
    }
    throw error;
  }
}

export const env = getEnv();

/**
 * Type-safe environment variables
 */
export type Env = z.infer<typeof envSchema>;
