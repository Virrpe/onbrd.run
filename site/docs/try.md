# Onbrd.run Try Guide

## Installation Steps

1. **Install the Extension**:
   - Download the latest extension package from the releases page
   - Unzip and load it into Chrome/Edge as an unpacked extension
   - Enable developer mode in browser extensions settings

2. **Configure Environment**:
   - Set up backend environment variables (see `.env.example`)
   - Ensure Stripe keys are configured for checkout functionality

## Probe Flows

### Probe A: Benchmarks Export
- **Trigger**: Click "Export Benchmarks" in extension popup
- **Flow**: 
  - Extension calls `/api/v1/benchmarks/export.csv`
  - API checks entitlements via `/api/v1/entitlements`
  - Returns CSV if paid, 402 with `{"reason":"payment_required"}` if unpaid
- **Expected Outcome**: 
  - Paid: CSV download with benchmark data
  - Unpaid: Paywall modal with checkout option

### Probe B: Artifacts Generation  
- **Trigger**: Run audit and attempt to save evidence artifacts
- **Flow**:
  - Extension calls `/api/v1/artifacts` with WCAG evidence
  - API checks entitlements via `/api/v1/entitlements`
  - Returns signed URL if paid, 402 with `{"reason":"payment_required"}` if unpaid
- **Expected Outcome**:
  - Paid: Artifact saved with download URL
  - Unpaid: Paywall modal with checkout option

## Stripe Test Card

Use this test card for checkout testing:

**Card Number**: 4242 4242 4242 4242  
**Expiry**: Any future date (e.g., 12/34)  
**CVC**: Any 3 digits (e.g., 123)  
**ZIP**: Any 5 digits (e.g., 12345)

This card will successfully create test subscriptions without charging real money.

Use test card 4242 4242 4242 4242, any future expiry, any CVC/ZIP.

## Expected Outcomes

### Successful Payment Flow
1. User clicks checkout button in paywall modal
2. Redirected to Stripe checkout page
3. Completes payment with test card
4. Redirected back to app with success message
5. Entitlements updated to "active" status
6. Previously blocked features now accessible

### Unpaid User Experience
1. User attempts paid feature (export/artifacts)
2. Receives 402 payment required response
3. Paywall modal appears with checkout option
4. Features remain locked until payment

## Troubleshooting

### Common Issues

**"Missing Stripe Environment" Error**
- Check that `STRIPE_SECRET_KEY` and `STRIPE_PRICE_ID` are set
- Verify `.env` file is loaded correctly

**Checkout Page Not Loading**
- Ensure `NEXT_PUBLIC_APP_URL` is set to correct domain
- Check CORS settings for Stripe integration

**Webhook Failures**
- Stripe webhook endpoint requires valid signature
- Test with Stripe CLI for local development

**Entitlements Not Updating**
- Webhook must be configured to process subscription events
- Check database connection for entitlement updates

### Debug Mode

Enable debug features via URL parameters:
- `?benchmarks=1` - Force enable benchmarks probe
- `?evidence=1` - Force enable evidence probe  
- `?auth=true` - Enable auth features
- `?analytics=true` - Enable analytics events

### Support

For additional help:
- Check server logs for detailed error messages
- Verify all environment variables are set
- Test with Stripe test mode credentials
- Consult backend API documentation for endpoint details