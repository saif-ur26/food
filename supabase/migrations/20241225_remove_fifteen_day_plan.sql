-- Remove fifteen_day plan type from the system
-- This migration removes the fifteen_day option from plan_type enum

-- First, update any existing fifteen_day orders to weekly (if any exist)
UPDATE orders SET plan_type = 'weekly' WHERE plan_type = 'fifteen_day';

-- Update any existing fifteen_day pricing plans to weekly (if any exist)
UPDATE pricing_plans SET plan_type = 'weekly' WHERE plan_type = 'fifteen_day';

-- Create new enum without fifteen_day
CREATE TYPE plan_type_new AS ENUM ('daily', 'weekly', 'monthly');

-- Update orders table to use new enum
ALTER TABLE orders ALTER COLUMN plan_type TYPE plan_type_new USING plan_type::text::plan_type_new;

-- Update pricing_plans table to use new enum
ALTER TABLE pricing_plans ALTER COLUMN plan_type TYPE plan_type_new USING plan_type::text::plan_type_new;

-- Drop old enum and rename new one
DROP TYPE plan_type;
ALTER TYPE plan_type_new RENAME TO plan_type;

-- Add comment for documentation
COMMENT ON TYPE plan_type IS 'Available meal plan types: daily, weekly, monthly (fifteen_day removed)';

-- Delete any fifteen_day pricing plans from the database
DELETE FROM pricing_plans WHERE plan_type::text = 'fifteen_day';