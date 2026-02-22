-- Supabase Auth: Email Confirmation'ı Kapat
-- Bu SQL'i Supabase Dashboard → SQL Editor'da çalıştırın

-- Email confirmation'ı kapat
UPDATE auth.config 
SET 
  enable_signup = true,
  enable_confirmations = false  -- Email confirmation'ı kapat
WHERE id = 1;

-- Not: Eğer yukarıdaki çalışmazsa, Supabase Dashboard'dan manuel olarak:
-- Authentication → Providers → Email → "Confirm email" seçeneğini KAPALI yapın

