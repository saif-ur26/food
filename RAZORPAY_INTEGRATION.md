# Razorpay Integration Guide

This document provides a comprehensive guide to the Razorpay payment integration in Daily Dish Delights.

## Overview

The application uses Razorpay for secure payment processing with the following features:
- Order creation and management
- Payment verification
- Support for both prepaid and postpaid plans
- Test and production environments
- Comprehensive error handling

## Architecture

```
Frontend (React) → Supabase Edge Functions → Razorpay API
                ↓
            Database (Orders)
```

## Components

### 1. Frontend Integration

#### Files:
- `src/pages/Order.tsx` - Main order page with payment flow
- `src/hooks/useRazorpay.ts` - Custom hook for Razorpay operations
- `src/lib/razorpay.ts` - Utility functions and types
- `src/components/PaymentStatus.tsx` - Payment status UI component

#### Key Features:
- Dynamic script loading
- Form validation
- Payment status tracking
- Error handling and user feedback

### 2. Backend Integration

#### Files:
- `supabase/functions/create-razorpay-order/index.ts` - Creates Razorpay orders
- `supabase/functions/verify-razorpay-payment/index.ts` - Verifies payments

#### Environment Variables:
```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx
```

## Payment Flow

### 1. Order Creation
```typescript
// Frontend creates order in database
const { data: orderData } = await supabase
  .from("orders")
  .insert({
    user_id: user?.id,
    plan_type: currentPlan.planType,
    payment_type: paymentType,
    total_amount: totalPrice,
  });

// Create Razorpay order via edge function
const { data: razorpayData } = await supabase.functions.invoke(
  "create-razorpay-order",
  {
    body: {
      amount: payableAmount,
      receipt: `order_${orderData.id}`,
    },
  }
);
```

### 2. Payment Processing
```typescript
// Open Razorpay checkout
const options = {
  key: razorpayData.keyId,
  amount: razorpayData.amount,
  currency: razorpayData.currency,
  name: "Daily Dish Delights",
  description: planName,
  order_id: razorpayData.orderId,
  handler: async (response) => {
    // Verify payment
    await verifyPayment(response);
  },
};

const razorpay = new window.Razorpay(options);
razorpay.open();
```

### 3. Payment Verification
```typescript
// Verify signature using HMAC-SHA256
const body = razorpay_order_id + "|" + razorpay_payment_id;
const expectedSignature = crypto
  .createHmac('sha256', keySecret)
  .update(body)
  .digest('hex');

const isValid = expectedSignature === razorpay_signature;
```

## Testing

### Test Cards

#### Successful Payment:
- **Card Number**: 4111 1111 1111 1111
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **Name**: Any name

#### Failed Payment:
- **Card Number**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **Name**: Any name

### Test UPI:
- **UPI ID**: success@razorpay
- **UPI ID (Failure)**: failure@razorpay

### Test Wallets:
- Use any wallet option in test mode
- All transactions will be successful in test mode

## Configuration

### Development Environment

1. **Razorpay Dashboard**:
   - Use test API keys
   - Enable test mode
   - Configure webhooks (optional)

2. **Supabase**:
   ```bash
   # Set environment variables
   supabase secrets set RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
   supabase secrets set RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx
   ```

3. **Frontend**:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

### Production Environment

1. **Razorpay Dashboard**:
   - Complete KYC verification
   - Get live API keys
   - Configure production webhooks
   - Set up settlement account

2. **Supabase**:
   ```bash
   # Set production environment variables
   supabase secrets set RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
   supabase secrets set RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx
   ```

3. **Domain Verification**:
   - Add your domain to Razorpay dashboard
   - Configure CORS settings

## Security Best Practices

### 1. API Key Management
- Never expose secret keys in frontend code
- Use environment variables for all credentials
- Rotate keys regularly
- Use different keys for test/production

### 2. Payment Verification
- Always verify payments on server-side
- Use signature verification for authenticity
- Implement idempotency for duplicate requests
- Log all payment attempts for audit

### 3. Error Handling
- Implement comprehensive error handling
- Provide user-friendly error messages
- Log errors for debugging
- Handle network failures gracefully

### 4. Data Protection
- Use HTTPS for all communications
- Implement proper input validation
- Sanitize user data
- Follow PCI DSS guidelines

## Monitoring and Analytics

### 1. Payment Metrics
- Success/failure rates
- Average transaction value
- Payment method preferences
- Geographic distribution

### 2. Error Tracking
- Payment failures by reason
- API response times
- User drop-off points
- System availability

### 3. Razorpay Dashboard
- Real-time transaction monitoring
- Settlement tracking
- Dispute management
- Analytics and reports

## Troubleshooting

### Common Issues

#### 1. Payment Script Not Loading
```javascript
// Check if script is loaded
if (!window.Razorpay) {
  console.error('Razorpay script not loaded');
  // Reload script or show error
}
```

#### 2. Signature Verification Fails
- Check if secret key is correct
- Ensure proper string concatenation
- Verify HMAC implementation
- Check for whitespace in keys

#### 3. CORS Errors
- Add domain to Razorpay dashboard
- Configure proper CORS headers
- Check browser console for details

#### 4. Payment Callback Issues
- Ensure proper error handling
- Check network connectivity
- Verify callback URL configuration

### Debug Mode

Enable debug logging:
```typescript
// In development
const DEBUG_PAYMENTS = process.env.NODE_ENV === 'development';

if (DEBUG_PAYMENTS) {
  console.log('Payment data:', paymentData);
}
```

## Support and Resources

### Documentation
- [Razorpay API Documentation](https://razorpay.com/docs/)
- [Razorpay Integration Guide](https://razorpay.com/docs/payments/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

### Support Channels
- Razorpay Support: support@razorpay.com
- Razorpay Community: community.razorpay.com
- GitHub Issues: For project-specific issues

### Testing Tools
- Razorpay Test Dashboard
- Browser Developer Tools
- Postman for API testing
- Supabase Logs for backend debugging

## Compliance

### Regulatory Requirements
- PCI DSS compliance for card data
- RBI guidelines for digital payments
- Data protection regulations (GDPR, etc.)
- Local tax and accounting requirements

### Audit Trail
- All transactions are logged
- Payment attempts are tracked
- User actions are recorded
- System events are monitored

This integration provides a robust, secure, and user-friendly payment experience for Daily Dish Delights customers.