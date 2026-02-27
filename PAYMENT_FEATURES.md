# Payment System Features

## Overview

This document describes the payment system features including refunds, invoices, coupons, and plan upgrades.

## Features

### 1. Refund System

**Endpoint**: `POST /api/payments/refund`

**Access**: Super Admin only

**Features**:
- Full or partial refunds
- Refund reason tracking
- Admin audit trail
- Automatic status updates

**Request**:
```json
{
  "purchaseId": "uuid",
  "reason": "Customer requested refund",
  "amount": 1999.0  // Optional, defaults to full amount
}
```

**Response**:
```json
{
  "ok": true,
  "refund": {
    "purchaseId": "uuid",
    "amount": 1999.0,
    "reason": "Customer requested refund",
    "refundedAt": "2024-01-01T12:00:00Z"
  }
}
```

**Database Fields**:
- `refund_amount`: Amount refunded
- `refund_reason`: Reason for refund
- `refunded_at`: Timestamp of refund
- `refunded_by`: Admin who processed refund

**TODO**: Integrate with Iyzico refund API

### 2. Coupon System

**Endpoint**: `POST /api/coupons/validate`

**Features**:
- Percentage or fixed amount discounts
- Usage limits (global and per-user)
- Plan-specific coupons
- Expiration dates
- Multiple use prevention

**Coupon Types**:
- `percentage`: Discount as percentage (e.g., 10%)
- `fixed`: Fixed amount discount (e.g., 500 TL)

**Request**:
```json
{
  "code": "WELCOME10",
  "planType": "light"
}
```

**Response**:
```json
{
  "valid": true,
  "coupon": {
    "id": "uuid",
    "code": "WELCOME10",
    "discountType": "percentage",
    "discountValue": 10,
    "description": "10% off for new users"
  }
}
```

**Database Tables**:

**coupons**:
- `code`: Unique coupon code
- `discount_type`: 'percentage' or 'fixed'
- `discount_value`: Discount amount
- `max_uses`: Maximum total uses
- `used_count`: Current usage count
- `allow_multiple_uses`: Allow same user multiple times
- `applicable_plans`: Array of plan types or NULL for all
- `expires_at`: Expiration date

**coupon_usage**:
- `coupon_id`: Reference to coupon
- `user_id`: User who used coupon
- `purchase_id`: Associated purchase
- `discount_amount`: Actual discount applied
- `used_at`: Usage timestamp

**Creating Coupons** (Admin):
```sql
INSERT INTO coupons (code, description, discount_type, discount_value, max_uses, expires_at)
VALUES ('SAVE500', '500 TL discount', 'fixed', 500, 100, NOW() + INTERVAL '30 days');
```

### 3. Plan Upgrade

**Endpoint**: `POST /api/payments/upgrade`

**Features**:
- Upgrade from Light to Premium
- Pay only the difference
- Maintains purchase history
- Automatic plan activation after payment

**Request**:
```json
{
  "invitationId": "uuid"
}
```

**Response**:
```json
{
  "ok": true,
  "upgrade": {
    "purchaseId": "uuid",
    "fromPlan": "light",
    "toPlan": "premium",
    "amount": 2000.0,
    "currency": "TRY"
  },
  "message": "Upgrade initiated. Please complete payment."
}
```

**Pricing**:
- Light Plan: 1,999 TL
- Premium Plan: 3,999 TL
- Upgrade Cost: 2,000 TL (difference)

**Database Fields**:
- `is_upgrade`: Boolean flag
- `upgraded_from_purchase_id`: Reference to original purchase

**TODO**: Integrate upgrade flow with Iyzico payment

### 4. Invoice Generation

**Status**: Planned

**Features**:
- Automatic invoice generation after payment
- PDF format with company details
- Unique invoice numbers
- Download and email delivery

**Database Fields**:
- `invoice_number`: Unique invoice ID
- `invoice_url`: URL to PDF file

**Implementation Steps**:
1. Install PDF generation library (e.g., `jsPDF` or `pdfkit`)
2. Create invoice template
3. Generate PDF after successful payment
4. Upload to Supabase Storage
5. Send email with invoice attachment

**Example Invoice Number Format**: `INV-2024-001234`

## Integration Checklist

### Iyzico Integration

- [ ] Refund API integration
- [ ] Upgrade payment flow
- [ ] Coupon discount in payment request
- [ ] Invoice generation trigger

### Email Notifications

- [ ] Refund confirmation email
- [ ] Upgrade confirmation email
- [ ] Invoice delivery email
- [ ] Coupon usage confirmation

### Admin Features

- [ ] Coupon management UI
- [ ] Refund processing UI
- [ ] Invoice regeneration
- [ ] Upgrade analytics

## Security Considerations

1. **Refunds**: Only super admins can process refunds
2. **Coupons**: Server-side validation only
3. **Pricing**: Always calculated server-side
4. **Invoices**: Secure storage with signed URLs
5. **Audit Trail**: All payment actions logged

## Testing

### Coupon Testing
```bash
# Valid coupon
curl -X POST http://localhost:4174/api/coupons/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"WELCOME10","planType":"light"}'

# Expired coupon
# Invalid coupon
# Plan-specific coupon
```

### Upgrade Testing
```bash
# Initiate upgrade
curl -X POST http://localhost:4174/api/payments/upgrade \
  -H "Content-Type: application/json" \
  -d '{"invitationId":"uuid"}'
```

### Refund Testing (Admin)
```bash
# Process refund
curl -X POST http://localhost:4174/api/payments/refund \
  -H "Content-Type: application/json" \
  -d '{"purchaseId":"uuid","reason":"Test refund","amount":1999}'
```

## Database Migrations

Run these migrations in order:

1. `add_purchase_upgrade_fields.sql` - Adds upgrade tracking
2. `add_coupons_table.sql` - Creates coupon system

```bash
# Apply migrations
psql -h your-supabase-host -d postgres -f supabase/migrations/add_purchase_upgrade_fields.sql
psql -h your-supabase-host -d postgres -f supabase/migrations/add_coupons_table.sql
```

## Future Enhancements

1. **Subscription Model**: Recurring payments
2. **Payment Plans**: Installment options
3. **Gift Cards**: Purchasable credit
4. **Loyalty Program**: Points and rewards
5. **Multi-Currency**: Support for USD, EUR
6. **Tax Handling**: VAT calculation and reporting
7. **Bulk Discounts**: Volume-based pricing
8. **Partner Coupons**: Integration with partners

## Resources

- [Iyzico API Documentation](https://dev.iyzipay.com/)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [PDF Generation Libraries](https://www.npmjs.com/package/jspdf)
