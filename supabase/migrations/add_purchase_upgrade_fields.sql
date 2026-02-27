-- Add upgrade-related fields to purchases table
ALTER TABLE purchases
ADD COLUMN IF NOT EXISTS is_upgrade BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS upgraded_from_purchase_id UUID REFERENCES purchases(id),
ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS invoice_url TEXT;

-- Create index for upgrade tracking
CREATE INDEX IF NOT EXISTS idx_purchases_upgrade ON purchases(upgraded_from_purchase_id) WHERE is_upgrade = true;
CREATE INDEX IF NOT EXISTS idx_purchases_invoice ON purchases(invoice_number);

-- Add comment
COMMENT ON COLUMN purchases.is_upgrade IS 'True if this purchase is an upgrade from a previous plan';
COMMENT ON COLUMN purchases.upgraded_from_purchase_id IS 'Reference to the original purchase that was upgraded';
COMMENT ON COLUMN purchases.invoice_number IS 'Unique invoice number for this purchase';
COMMENT ON COLUMN purchases.invoice_url IS 'URL to downloadable invoice PDF';
