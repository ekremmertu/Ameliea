-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  allow_multiple_uses BOOLEAN DEFAULT false,
  applicable_plans TEXT[], -- ['light', 'premium'] or NULL for all
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create coupon_usage tracking table
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purchase_id UUID REFERENCES purchases(id) ON DELETE SET NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(coupon_id, user_id, purchase_id)
);

-- Add coupon fields to purchases table
ALTER TABLE purchases
ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id),
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS refund_reason TEXT,
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refunded_by UUID REFERENCES auth.users(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user ON coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_purchases_coupon ON purchases(coupon_id);

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coupons
-- Public can read active coupons (for validation)
CREATE POLICY "Anyone can read active coupons"
  ON coupons FOR SELECT
  USING (is_active = true);

-- Only admins can manage coupons
CREATE POLICY "Admins can manage coupons"
  ON coupons FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
    )
  );

-- RLS Policies for coupon_usage
-- Users can read their own usage
CREATE POLICY "Users can read own coupon usage"
  ON coupon_usage FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert usage records
CREATE POLICY "System can insert coupon usage"
  ON coupon_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all usage
CREATE POLICY "Admins can read all coupon usage"
  ON coupon_usage FOR SELECT
  USING (
    auth.jwt() ->> 'email' IN (
      SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
    )
  );

-- Function to update coupon used_count
CREATE OR REPLACE FUNCTION increment_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE coupons
  SET used_count = used_count + 1
  WHERE id = NEW.coupon_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-increment coupon usage
CREATE TRIGGER trigger_increment_coupon_usage
  AFTER INSERT ON coupon_usage
  FOR EACH ROW
  EXECUTE FUNCTION increment_coupon_usage();

-- Insert some sample coupons (optional)
INSERT INTO coupons (code, description, discount_type, discount_value, max_uses, expires_at)
VALUES
  ('WELCOME10', '10% off for new users', 'percentage', 10, 100, NOW() + INTERVAL '30 days'),
  ('SAVE500', '500 TL discount', 'fixed', 500, 50, NOW() + INTERVAL '60 days')
ON CONFLICT (code) DO NOTHING;
