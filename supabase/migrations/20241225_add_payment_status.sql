-- Add payment status tracking to orders table
-- This migration adds payment-related fields to track payment completion

-- Add payment status enum
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- Add payment tracking columns to orders table
ALTER TABLE orders 
ADD COLUMN payment_status payment_status DEFAULT 'pending',
ADD COLUMN razorpay_order_id TEXT,
ADD COLUMN razorpay_payment_id TEXT,
ADD COLUMN payment_completed_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries on payment status
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_payment_completed ON orders(payment_completed_at);

-- Update existing orders to have 'paid' status (assuming they were already paid)
-- This is for backward compatibility with existing orders
UPDATE orders SET payment_status = 'paid', payment_completed_at = created_at WHERE payment_status = 'pending';

-- Add comment for documentation
COMMENT ON COLUMN orders.payment_status IS 'Payment status: pending (not paid), paid (payment successful), failed (payment failed), refunded (payment refunded)';
COMMENT ON COLUMN orders.razorpay_order_id IS 'Razorpay order ID for tracking';
COMMENT ON COLUMN orders.razorpay_payment_id IS 'Razorpay payment ID after successful payment';
COMMENT ON COLUMN orders.payment_completed_at IS 'Timestamp when payment was completed successfully';